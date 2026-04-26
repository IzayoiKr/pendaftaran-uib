package auth

import (
	"context"
	"net/http"
	"pendaftaran-uib/backend/internal/utils"
	"strings"
)

type contextKey string

const ClaimsKey contextKey = "claims"

func Middleware(ts *TokenStore) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				w.Header().Set("X-Auth-Error", "token")
				utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
				return
			}

			claims, err := ValidateToken(strings.TrimPrefix(header, "Bearer "))
			if err != nil {
				w.Header().Set("X-Auth-Error", "token")
				utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("invalid token"))
				return
			}

			if claims.TokenType != TokenTypeAccess {
				w.Header().Set("X-Auth-Error", "token")
				utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("invalid token type"))
				return
			}

			revoked, err := ts.IsRevoked(r.Context(), claims.ID)
			if err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, utils.ErrJSON("server error"))
				return
			}
			if revoked {
				w.Header().Set("X-Auth-Error", "token")
				utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("token has been revoked"))
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
