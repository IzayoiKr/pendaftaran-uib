package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	// Uncomment this if you are not using docker/podman
	// "github.com/joho/godotenv"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/clamav"
	"pendaftaran-uib/backend/internal/crypto"
	"pendaftaran-uib/backend/internal/db"
	"pendaftaran-uib/backend/internal/email"
	"pendaftaran-uib/backend/internal/handlers"
	"pendaftaran-uib/backend/internal/middleware"
	"pendaftaran-uib/backend/internal/utils"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	// Uncomment this if you are not using docker/podman
	// if err := godotenv.Load(); err != nil {
	// 	slog.Error("error loading .env file", "error", err)
	// 	os.Exit(1)
	// }

	if err := auth.InitAuth(); err != nil {
		slog.Error("auth init error", "error", err)
		os.Exit(1)
	}

	if err := crypto.InitCrypto(); err != nil {
		slog.Error("crypto init error", "error", err)
		os.Exit(1)
	}

	if err := utils.InitValidator(); err != nil {
		slog.Error("validator init error", "error", err)
		os.Exit(1)
	}

	clamavAddr := os.Getenv("CLAMD_ADDR")
	if clamavAddr == "" {
		slog.Error("CLAMD_ADDR variable not set")
		os.Exit(1)
	}
	scanner := clamav.New(strings.TrimPrefix(clamavAddr, "tcp://"))

	storageDir := os.Getenv("STORAGE_DIR")
	if storageDir == "" {
		slog.Error("STORAGE_DIR variable not set")
		os.Exit(1)
	}
	if err := os.MkdirAll(filepath.Join(storageDir), 0700); err != nil {
		slog.Error("failed to create storage directory", "error", err)
		os.Exit(1)
	}

	ctx := context.Background()

	provider, err := db.NewProvider(ctx)
	if err != nil {
		slog.Error("database initialization error", "error", err)
		os.Exit(1)
	}
	defer func() {
		if err := provider.Close(ctx); err != nil {
			slog.Error("database shutdown error", "error", err)
		}
	}()

	slog.Info("Connected to MySQL")
	slog.Info("Connected to MongoDB")

	db.NewCleaner(provider.MySQL).Start()
	slog.Info("Starting hourly cleanup of expired tokens...")

	tokenStore, err := auth.NewTokenStore(provider.Mongo)
	if err != nil {
		slog.Error("token store init failed", "error", err)
		os.Exit(1)
	}

	mailer, err := email.NewMailer()
	if err != nil {
		slog.Error("mailer init failed", "error", err)
		os.Exit(1)
	}

	auditLogger := audit.NewLogger()

	r := chi.NewRouter()
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Timeout(30 * time.Second))
	r.Use(middleware.CORS)
	r.Use(middleware.SecFetch)
	r.Use(middleware.SecurityHeaders)
	r.Use(chimiddleware.Logger)

	rl := newRateLimiters()

	r.Get("/health", handlers.HealthCheck(provider))
	r.Group(func(r chi.Router) {
		r.Use(middleware.LimitJSON)

		r.Get("/api/program_studi", handlers.ProgramStudi(provider.MySQL))

		r.Get("/api/gelombang", handlers.Gelombang(provider.MySQL))

		r.Post("/api/auth/login",
			rl.loginIP.RateLimit(
				handlers.Login(provider.MySQL, tokenStore, rl.loginEmail, auditLogger),
			),
		)
		r.Post("/api/auth/register",
			rl.register.RateLimit(
				handlers.Register(provider.MySQL, mailer, auditLogger),
			),
		)
		r.Post("/api/auth/refresh",
			auth.RateLimitRefresh(
				rl.refreshIP,
				rl.refreshUser,
				handlers.Refresh(provider.MySQL, tokenStore, auditLogger),
			),
		)
		r.Post("/api/auth/forgot-password",
			rl.forgotPassword.RateLimit(
				handlers.ForgotPassword(provider.MySQL, mailer, rl.forgotPasswordEmail, auditLogger),
			),
		)
		r.Post("/api/auth/reset-password",
			rl.resetPassword.RateLimit(
				handlers.ResetPassword(provider.MySQL, tokenStore, auditLogger),
			),
		)
		r.Post("/api/auth/verify-email",
			rl.verifyEmail.RateLimit(
				handlers.VerifyEmail(provider.MySQL, auditLogger),
			),
		)
		r.Post("/api/auth/resend-verification",
			rl.resendVerify.RateLimit(
				handlers.ResendVerification(provider.MySQL, mailer, auditLogger),
			),
		)
		r.Get("/api/registrations/{batchKey}/init",
			rl.registrationInit.RateLimit(handlers.RegistrationInit(provider.MySQL)),
		)
	})
	// Protected Routes
	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware(tokenStore))
		r.Use(middleware.LimitJSON)

		r.Get("/api/profile",
			rl.profile.RateLimitUser(handlers.Profile(provider.MySQL)),
		)
		r.Post("/api/profile",
			rl.updateProfile.RateLimitUser(handlers.UpdateProfile(provider.MySQL, auditLogger)),
		)
		r.Get("/api/profile/nik",
			rl.revealNIK.RateLimitUser(handlers.RevealNIK(provider.MySQL, auditLogger)),
		)
		r.Post("/api/auth/logout",
			rl.logout.RateLimitUser(handlers.Logout(tokenStore, auditLogger)),
		)
		r.Post("/api/profile/password",
			rl.changePassword.RateLimitUser(handlers.ChangePassword(provider.MySQL, tokenStore, auditLogger)),
		)
		r.Get("/api/registrations/{batchKey}/status",
			rl.registrationStatus.RateLimitUser(handlers.RegistrationStatus(provider.MySQL)),
		)
		r.Get("/api/registrations/{regID}",
			rl.registrationInit.RateLimitUser(handlers.GetRegistrationDetail(provider.MySQL)),
		)
		r.Delete("/api/registrations/{batchKey}",
			rl.registrationDelete.RateLimitUser(handlers.RegistrationDelete(provider.MySQL, storageDir, auditLogger)),
		)
		r.Post("/api/registrations/{batchKey}/withdraw",
			rl.registrationWithdraw.RateLimitUser(handlers.RegistrationWithdraw(provider.MySQL, auditLogger)),
		)
		r.Get("/api/prodi-change",
			rl.profile.RateLimitUser(handlers.GetProdiChangeRequests(provider.MySQL)),
		)
		r.Post("/api/prodi-change",
			rl.profile.RateLimitUser(handlers.CreateProdiChangeRequest(provider.MySQL)),
		)
		r.Get("/api/transfer-proof",
			rl.transferProofGet.RateLimitUser(handlers.GetTransferProof(provider.MySQL)),
		)
		r.Get("/api/transfer-proof/file/{regID}",
			rl.transferProofGet.RateLimitUser(handlers.ServeTransferProof(provider.MySQL)),
		)
		r.Get("/api/ospek/prasyarat",
			rl.ospekGet.RateLimitUser(handlers.GetOspekPrerequisite(provider.MySQL)),
		)
		r.Get("/api/ospek/prasyarat/file/{regID}/pasphoto",
			rl.ospekGet.RateLimitUser(handlers.ServeOspekPrerequisite(provider.MySQL, "pasphoto")),
		)
		r.Get("/api/ospek/prasyarat/file/{regID}/ijazah",
			rl.ospekGet.RateLimitUser(handlers.ServeOspekPrerequisite(provider.MySQL, "ijazah")),
		)
		r.Get("/api/registrations/{batchKey}/loa",
			rl.registrationLoa.RateLimitUser(handlers.RegistrationLoA(provider.MySQL)),
		)
	})

	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware(tokenStore))
		r.Use(middleware.LimitMultipart)

		r.Post("/api/registrations/{batchKey}/draft",
			rl.registrationDraft.RateLimitUser(handlers.RegistrationDraft(provider.MySQL, storageDir, scanner, auditLogger)),
		)
		r.Post("/api/registrations/{batchKey}/submit",
			rl.registrationSubmit.RateLimitUser(handlers.RegistrationSubmit(provider.MySQL, storageDir, scanner, auditLogger)),
		)
		r.Post("/api/transfer-proof",
			rl.transferProofUpload.RateLimitUser(handlers.UploadTransferProof(provider.MySQL, scanner, storageDir)),
		)
		r.Post("/api/ospek/prasyarat",
			rl.ospekUpload.RateLimitUser(handlers.UploadOspekPrerequisite(provider.MySQL, scanner, storageDir)),
		)
	})

	port := os.Getenv("SERVER_PORT")
	srv := &http.Server{
		Addr:           ":" + port,
		Handler:        r,
		ReadTimeout:    15 * time.Second,
		WriteTimeout:   15 * time.Second,
		IdleTimeout:    60 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	go func() {
		slog.Info("server listening", "port", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	slog.Info("Shutting down server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("Server forced to shutdown", "error", err)
		os.Exit(1)
	}
}

type rateLimiters struct {
	loginIP             *auth.RateLimiter
	loginEmail          *auth.RateLimiter
	register            *auth.RateLimiter
	refreshIP           *auth.RateLimiter
	refreshUser         *auth.RateLimiter
	profile             *auth.RateLimiter
	revealNIK           *auth.RateLimiter
	updateProfile       *auth.RateLimiter
	changePassword      *auth.RateLimiter
	forgotPassword      *auth.RateLimiter
	forgotPasswordEmail *auth.RateLimiter
	resetPassword       *auth.RateLimiter
	logout              *auth.RateLimiter
	verifyEmail         *auth.RateLimiter
	resendVerify        *auth.RateLimiter
	registrationInit    *auth.RateLimiter
	registrationStatus  *auth.RateLimiter
	registrationDraft   *auth.RateLimiter
	registrationSubmit  *auth.RateLimiter
	registrationDelete  *auth.RateLimiter
	registrationWithdraw *auth.RateLimiter
	transferProofGet    *auth.RateLimiter
	transferProofUpload *auth.RateLimiter
	ospekGet            *auth.RateLimiter
	ospekUpload         *auth.RateLimiter
	registrationLoa		*auth.RateLimiter
}

func newRateLimiters() rateLimiters {
	return rateLimiters{
		loginIP:             auth.NewRateLimiter(30, 10*time.Minute),
		loginEmail:          auth.NewRateLimiter(5, 15*time.Minute),
		register:            auth.NewRateLimiter(15, 60*time.Minute),
		refreshIP:           auth.NewRateLimiter(60, 1*time.Minute),
		refreshUser:         auth.NewRateLimiter(30, 1*time.Minute),
		profile:             auth.NewRateLimiter(60, 1*time.Minute),
		revealNIK:           auth.NewRateLimiter(10, 5*time.Minute),
		updateProfile:       auth.NewRateLimiter(10, 1*time.Minute),
		changePassword:      auth.NewRateLimiter(5, 15*time.Minute),
		forgotPassword:      auth.NewRateLimiter(30, 60*time.Minute),
		forgotPasswordEmail: auth.NewRateLimiter(3, 60*time.Minute),
		resetPassword:       auth.NewRateLimiter(10, 60*time.Minute),
		logout:              auth.NewRateLimiter(10, 1*time.Minute),
		verifyEmail:         auth.NewRateLimiter(30, 60*time.Minute),
		resendVerify:        auth.NewRateLimiter(30, 60*time.Minute),
		registrationInit:    auth.NewRateLimiter(60, 1*time.Minute),
		registrationStatus:  auth.NewRateLimiter(60, 1*time.Minute),
		registrationDraft:   auth.NewRateLimiter(20, 1*time.Minute),
		registrationSubmit:  auth.NewRateLimiter(5, 15*time.Minute),
		registrationDelete:  auth.NewRateLimiter(5, 5*time.Minute),
		registrationWithdraw: auth.NewRateLimiter(3, 15*time.Minute),
		transferProofGet:    auth.NewRateLimiter(60, 1*time.Minute),
		transferProofUpload: auth.NewRateLimiter(10, 5*time.Minute),
		ospekGet:            auth.NewRateLimiter(60, 1*time.Minute),
		ospekUpload:         auth.NewRateLimiter(10, 5*time.Minute),
		registrationLoa: 	 auth.NewRateLimiter(10, 5*time.Minute),
	}
}
