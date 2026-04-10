package handlers

import (
	"net/http"

	"pendaftaran-uib/backend/internal/auth"
)

func Logout(ts *auth.TokenStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if claims := auth.GetClaims(r); claims != nil {
			_ = ts.Revoke(r.Context(), claims)
		}

		if cookie, err := r.Cookie("refresh_token"); err == nil {
			if refreshClaims, err := auth.Validatetoken(cookie.Value); err == nil {
				_ = ts.Revoke(r.Context(), refreshClaims)
			}
		}

		clearRefreshCookie(w)

		writeJSON(w, http.StatusOK, map[string]string{
			"message": "logout berhasil",
		})
	}
}
