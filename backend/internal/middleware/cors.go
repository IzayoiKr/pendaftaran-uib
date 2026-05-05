package middleware

import (
	"net/http"
	"os"
	"slices"
	"strings"
)

func CORS(next http.Handler) http.Handler {
	var allowed []string

	for o := range strings.SplitSeq(os.Getenv("CORS_ORIGIN"), ",") {
		if trimmed := strings.TrimSpace(o); trimmed != "" {
			allowed = append(allowed, trimmed)
		}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		if slices.Contains(allowed, origin) {
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
