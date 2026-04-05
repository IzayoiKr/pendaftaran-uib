package auth

import (
	"context"
	"net/http"
	"strings"
)

type contextKey string

const ClaimsKey contextKey = "claims"

func Middleware(ts *TokenStore) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			claims, err := Validatetoken(strings.TrimPrefix(header, "Bearer "))
			if err != nil {
				http.Error(w, `{"error":"token has been revoked"}`, http.StatusUnauthorized)
				return
			}

			revoked, err := ts.IsRevoked(r.Context(), claims.ID)
			if err != nil {
				http.Error(w, `{"error":"server error"}`, http.StatusInternalServerError)
				return
			}
			if revoked {
				http.Error(w, `{"error":"token has been revoked"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), ClaimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetClaims(r *http.Request) *Claims {
	claims, _ := r.Context().Value(ClaimsKey).(*Claims)
	return claims
}
