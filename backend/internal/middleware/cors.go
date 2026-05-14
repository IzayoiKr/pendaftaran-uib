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

		w.Header().Set("Vary", "Origin")

		if slices.Contains(allowed, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Max-Age", "3600")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
