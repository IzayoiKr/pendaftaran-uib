package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"

	"pendaftaran-uib/backend/internal/audit"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/db"
	"pendaftaran-uib/backend/internal/email"
	"pendaftaran-uib/backend/internal/handlers"
	"pendaftaran-uib/backend/internal/middleware"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	if err := godotenv.Load(); err != nil {
		slog.Error("error loading .env file", "error", err)
		os.Exit(1)
	}

	if err := auth.InitJWT(os.Getenv("JWT_SECRET"), os.Getenv("JWT_ISSUER")); err != nil {
		slog.Error("jwt config error", "error", err)
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
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(middleware.CORS)
	r.Use(middleware.SecFetch)
	r.Use(middleware.SecurityHeaders)

	fileServer := http.FileServer(http.Dir("./uploads"))
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", fileServer))

	rl := newRateLimiters()

	// Public Routes
	r.Get("/health", handlers.HealthCheck(provider))
	r.Get("/api/program_studi", handlers.ProgramStudi(provider.MySQL))

	r.Get("/api/gelombang",
		rl.gelombang.RateLimit(
			handlers.GetGelombangList(provider.MySQL),
		),
	)
	r.Get("/api/gelombang/{registrationKey}",
		rl.gelombang.RateLimit(
			handlers.GetGelombangByKey(provider.MySQL),
		),
	)

	r.Post("/api/auth/login",
		rl.loginIP.RateLimit(
			handlers.Login(provider.MySQL, tokenStore, rl.loginEmail, auditLogger),
		),
	)
	r.Post("/api/auth/register",
		rl.register.RateLimitDevice(
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
		rl.forgotPasswordIP.RateLimitDevice(
			handlers.ForgotPassword(provider.MySQL, mailer, rl.forgotPasswordEmail, auditLogger),
		),
	)
	r.Post("/api/auth/reset-password",
		rl.resetPassword.RateLimit(
			handlers.ResetPassword(provider.MySQL, tokenStore, auditLogger),
		),
	)
	r.Post("/api/auth/verify-email",
		rl.verifyEmail.RateLimitDevice(
			handlers.VerifyEmail(provider.MySQL, auditLogger),
		),
	)
	r.Post("/api/auth/resend-verification",
		rl.resendVerify.RateLimitDevice(
			handlers.ResendVerification(provider.MySQL, mailer, auditLogger),
		),
	)

	// Protected Routes
	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware(tokenStore))
		r.Get("/api/profile",
			rl.profile.RateLimitUser(
				handlers.Profile(provider.MySQL),
			),
		)
		r.Post("/api/profile",
			rl.updateProfile.RateLimitUser(
				handlers.UpdateProfile(provider.MySQL, auditLogger),
			),
		)
		r.Post("/api/auth/logout",
			rl.logout.RateLimitUser(
				handlers.Logout(tokenStore, auditLogger),
			),
		)
		r.Post("/api/profile/password",
			rl.changePassword.RateLimitUser(
				handlers.ChangePassword(provider.MySQL, tokenStore, auditLogger),
			),
		)

		r.Post("/api/registration",
			rl.studentRegister.RateLimitUser(
				handlers.RegisterStudent(provider.MySQL, auditLogger),
			),
		)
		r.Get("/api/registration/{id}",
			rl.profile.RateLimitUser(
				handlers.GetRegistrationDetails(provider.MySQL),
			),
		)
		r.Post("/api/registration/{id}",
			rl.studentRegister.RateLimitUser(
				handlers.UpdateRegistration(provider.MySQL),
			),
		)
		r.Post("/api/registration/{id}/transfer",
			rl.studentRegister.RateLimitUser(
				handlers.UploadTransferProof(provider.MySQL),
			),
		)
		r.Get("/api/registration-status",
			rl.profile.RateLimitUser(
				handlers.GetRegistrationStatus(provider.MySQL),
			),
		)
		r.Get("/api/registration/latest",
			rl.profile.RateLimitUser(
				handlers.GetLatestRegistration(provider.MySQL),
			),
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
	updateProfile       *auth.RateLimiter
	changePassword      *auth.RateLimiter
	forgotPasswordIP    *auth.RateLimiter
	forgotPasswordEmail *auth.RateLimiter
	resetPassword       *auth.RateLimiter
	logout              *auth.RateLimiter
	verifyEmail         *auth.RateLimiter
	resendVerify        *auth.RateLimiter
	gelombang           *auth.RateLimiter
	studentRegister     *auth.RateLimiter
}

func newRateLimiters() rateLimiters {
	return rateLimiters{
		loginIP:             auth.NewRateLimiter(30, 10*time.Minute),
		loginEmail:          auth.NewRateLimiter(5, 15*time.Minute),
		register:            auth.NewRateLimiter(5, 60*time.Minute),
		refreshIP:           auth.NewRateLimiter(60, 1*time.Minute),
		refreshUser:         auth.NewRateLimiter(30, 1*time.Minute),
		profile:             auth.NewRateLimiter(60, 1*time.Minute),
		updateProfile:       auth.NewRateLimiter(10, 1*time.Minute),
		changePassword:      auth.NewRateLimiter(5, 15*time.Minute),
		forgotPasswordIP:    auth.NewRateLimiter(3, 60*time.Minute),
		forgotPasswordEmail: auth.NewRateLimiter(5, 60*time.Minute),
		resetPassword:       auth.NewRateLimiter(10, 60*time.Minute),
		logout:              auth.NewRateLimiter(20, 60*time.Minute),
		verifyEmail:         auth.NewRateLimiter(5, 60*time.Minute),
		resendVerify:        auth.NewRateLimiter(3, 60*time.Minute),
		gelombang:           auth.NewRateLimiter(120, 1*time.Minute),
		studentRegister:     auth.NewRateLimiter(10, 60*time.Minute),
	}
}
