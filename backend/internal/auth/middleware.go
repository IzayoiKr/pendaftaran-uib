package auth

import (
	"context"
	"net/http"
	"strings"
)

type contextKey string

// UserClaimsKey is the context key used to pass parsed Claims to handlers.
const UserClaimsKey contextKey = "user_claims"

// Middleware returns an http.Handler middleware that:
//  1. Requires a valid Bearer token in the Authorization header.
//  2. Checks the token's JTI against the MongoDB blacklist (revoked tokens).
//  3. Injects the parsed Claims into the request context on success.
func Middleware(ts *TokenStore) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, `{"error":"missing or invalid authorization header"}`, http.StatusUnauthorized)
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			claims, err := ParseToken(tokenStr)
			if err != nil {
				http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
				return
			}

			blacklisted, err := ts.IsBlacklisted(r.Context(), claims.JTI)
			if err != nil {
				http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
				return
			}
			if blacklisted {
				http.Error(w, `{"error":"token has been revoked, please log in again"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserClaimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
