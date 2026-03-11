package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/IzayoiKr/pendaftaran-uib/backend/internal/auth"
)

// LogoutHandler revokes the current token by adding its JTI to the
// MongoDB blacklist. After this, the token is rejected by auth.Middleware
// even before it expires.
func LogoutHandler(ts *auth.TokenStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, `{"error":"missing authorization header"}`, http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := auth.ParseToken(tokenStr)
		if err != nil {
			http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
			return
		}

		if err := ts.BlacklistToken(r.Context(), claims.JTI, claims.ExpiresAt.Time); err != nil {
			http.Error(w, `{"error":"failed to revoke token"}`, http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"message": "logged out successfully"})
	}
}
