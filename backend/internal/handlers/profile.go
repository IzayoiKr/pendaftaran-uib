package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/IzayoiKr/pendaftaran-uib/backend/internal/auth"
)

type userProfile struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"created_at"`
}

func ProfileHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(auth.UserClaimsKey).(*auth.Claims)
		if !ok {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}

		var p userProfile
		err := db.QueryRowContext(r.Context(),
			"SELECT id, email, username, created_at FROM users WHERE id = ?",
			claims.UserID,
		).Scan(&p.ID, &p.Email, &p.Username, &p.CreatedAt)
		if err == sql.ErrNoRows {
			http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
			return
		}
		if err != nil {
			http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(p)
	}
}
