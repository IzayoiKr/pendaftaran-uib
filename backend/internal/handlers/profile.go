package handlers

import (
    "encoding/json"
    "net/http"
	"database/sql"
    "github.com/IzayoiKr/pendaftaran-uib/backend/internal/auth"
)

func ProfileHandler(db *sql.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        user := r.Context().Value("user").(*auth.Claims)
        // Fetch additional user info if needed
        json.NewEncoder(w).Encode(user)
    }
}

