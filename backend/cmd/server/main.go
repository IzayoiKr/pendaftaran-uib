package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"

	"pendaftaran-uib/backend/internal/db"
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/handlers"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("error loading .env file: %v", err)
	}

	ctx := context.Background()

	mysql, err := db.NewMySQL()
	if err != nil {
		log.Fatalf("mysql connection failed: %v", err)
	}
	defer mysql.Close()
	log.Println("connected to MySQL")

	mongoClient, mongoDBName, err := db.NewMongo(ctx)
	if err != nil {
		log.Fatalf("mongo connection failed: %v", err)
	}
	defer mongoClient.Disconnect(ctx)
	log.Println("connected to MongoDB")

	mongoDB := mongoClient.Database(mongoDBName)

	tokenStore, err := auth.NewTokenStore(mongoDB)
	if err != nil {
		log.Fatalf("token store init failed: %v", err)
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(corsMiddleware)

	r.Post("/api/auth/login", handlers.Login(mysql))
	r.Post("/api/auth/register", handlers.Register(mysql))
	r.Post("/api/auth/refresh", handlers.Refresh(mysql, tokenStore))

	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware(tokenStore))
		r.Post("/api/auth/logout", handlers.Logout(tokenStore))
		// r.Post("/api/auth/profile", handlers.Profile(mysql))
	})

	port := os.Getenv("SERVER_PORT")
	log.Printf("server listening on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := os.Getenv("CORS_ORIGIN")
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
