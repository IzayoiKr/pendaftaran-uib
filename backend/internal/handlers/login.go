package handlers

import (
    "encoding/json"
    "net/http"
    "database/sql"
    "golang.org/x/crypto/bcrypt"
    "github.com/IzayoiKr/pendaftaran-uib/backend/internal/auth"
)

type loginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

func LoginHandler(db *sql.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req loginRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, "Invalid request", http.StatusBadRequest)
            return
        }
        var userID int
        var hashed string
        err := db.QueryRow(`
            SELECT id, password_hash FROM users WHERE email=$1`,
            req.Email,
        ).Scan(&userID, &hashed)
        if err != nil {
            if err == sql.ErrNoRows {
                http.Error(w, "Invalid credentials", http.StatusUnauthorized)
            } else {
                http.Error(w, "Internal error", http.StatusInternalServerError)
            }
            return
        }
        // Compare password
        if err := bcrypt.CompareHashAndPassword([]byte(hashed), []byte(req.Password)); err != nil {
            http.Error(w, "Invalid credentials", http.StatusUnauthorized)
            return
        }
        // Generate JWT
        token, err := auth.GenerateToken(userID, req.Email, "") // "student" role discarded
        if err != nil {
            http.Error(w, "Could not generate token", http.StatusInternalServerError)
            return
        }
        json.NewEncoder(w).Encode(map[string]string{"token": token})
    }
}

