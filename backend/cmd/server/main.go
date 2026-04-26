package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"slices"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/db"
	"pendaftaran-uib/backend/internal/handlers"
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

	tokenStore, err := auth.NewTokenStore(provider.Mongo)
	if err != nil {
		slog.Error("token store init failed", "error", err)
		os.Exit(1)
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(corsMiddleware)

	loginIPLimiter := auth.NewRateLimiter(30, 10*time.Minute)
	loginEmailLimiter := auth.NewRateLimiter(5, 15*time.Minute)

	registerLimiter := auth.NewRateLimiter(5, 60*time.Minute)

	refreshIPLimiter := auth.NewRateLimiter(60, 1*time.Minute)
	refreshUserLimiter := auth.NewRateLimiter(30, 1*time.Minute)

	profileLimiter := auth.NewRateLimiter(60, 1*time.Minute)
	logoutLimiter := auth.NewRateLimiter(20, 60*time.Minute)

	r.Get("/health", handlers.HealthCheck(provider))

	r.Post("/api/auth/login", loginIPLimiter.RateLimit(handlers.Login(provider.MySQL, tokenStore, loginEmailLimiter)))
	r.Post("/api/auth/register", registerLimiter.RateLimitDevice(handlers.Register(provider.MySQL)))
	r.Post("/api/auth/refresh", auth.RateLimitRefresh(refreshIPLimiter, refreshUserLimiter, handlers.Refresh(provider.MySQL, tokenStore)))

	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware(tokenStore))
		r.Get("/api/profile", profileLimiter.RateLimitUser(handlers.Profile(provider.MySQL)))
		r.Post("/api/auth/logout", logoutLimiter.RateLimitUser(handlers.Logout(tokenStore)))
	})

	port := os.Getenv("SERVER_PORT")
	srv := &http.Server{
		Addr: ":"+port,
		Handler: r,
		ReadTimeout: 15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout: 60 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	go func() {
		slog.Info("server listening", "port", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Info("server error", "error", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	slog.Info("Shutting down server...")

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("Server forced to shutdown", "error", err)
		os.Exit(1)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	origin := os.Getenv("CORS_ORIGIN")
	var allowedOrigins []string

	if origin != "" {
		for o := range strings.SplitSeq(origin, ",") {
			allowedOrigins = append(allowedOrigins, strings.TrimSpace(o))
		}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		if slices.Contains(allowedOrigins, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
