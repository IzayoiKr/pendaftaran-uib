package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"github.com/IzayoiKr/pendaftaran-uib/backend/internal/auth"
	"github.com/IzayoiKr/pendaftaran-uib/backend/internal/handlers"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("Database ping failed:", err)
	}
	log.Println("Connected to database")

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Post("/api/register", handlers.RegisterHandler(db))
	r.Post("/api/login", handlers.LoginHandler(db))

	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware)
		r.Get("/api/profile", handlers.ProfileHandler(db))
	})

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8888"
	}
	log.Printf("Server starting on:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
