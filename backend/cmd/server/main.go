package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/IzayoiKr/pendaftaran-uib/backend/internal/auth"
	"github.com/IzayoiKr/pendaftaran-uib/backend/internal/handlers"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	// ── MySQL ──────────────────────────────────────────────────
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Failed to open MySQL connection:", err)
	}
	defer db.Close()

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Fatal("MySQL ping failed:", err)
	}
	log.Println("Connected to MySQL")

	// ── MongoDB ────────────────────────────────────────────────
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer func() {
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			log.Println("MongoDB disconnect error:", err)
		}
	}()

	if err := mongoClient.Ping(ctx, nil); err != nil {
		log.Fatal("MongoDB ping failed:", err)
	}
	log.Println("✓ Connected to MongoDB")

	mongoDBName := os.Getenv("MONGO_DB")
	if mongoDBName == "" {
		mongoDBName = "pendaftaran-uib"
	}
	mongoDB := mongoClient.Database(mongoDBName)

	// ── Token store (MongoDB) ──────────────────────────────────
	tokenStore := auth.NewTokenStore(mongoDB)
	if err := tokenStore.EnsureIndexes(context.Background()); err != nil {
		log.Fatal("Failed to create MongoDB indexes:", err)
	}
	log.Println("Token store ready")

	// ── Router ─────────────────────────────────────────────────
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			next.ServeHTTP(w, r)
		})
	})

	// Public routes
	r.Post("/api/register", handlers.RegisterHandler(db))
	r.Post("/api/login", handlers.LoginHandler(db, tokenStore))
	r.Post("/api/logout", handlers.LogoutHandler(tokenStore))

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware(tokenStore))
		r.Get("/api/profile", handlers.ProfileHandler(db))
	})

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8888"
	}
	log.Printf("Server listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
