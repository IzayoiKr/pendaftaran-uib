package handlers

import (
    "encoding/json"
    "net/http"
    "golang.org/x/crypto/bcrypt"
    "database/sql"
)

type registerRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
    Username string `json:"username"`
}

func RegisterHandler(db *sql.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req registerRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, "Invalid request", http.StatusBadRequest)
            return
        }
        // Hash password
        hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
        if err != nil {
            http.Error(w, "Internal error", http.StatusInternalServerError)
            return
        }
        // Insert into DB
        var userID int
        err = db.QueryRow(`
            INSERT INTO users (email, password_hash, username)
            VALUES ($1, $2, $3) RETURNING id`,
            req.Email, string(hashed), req.Username,
        ).Scan(&userID)
        if err != nil {
            // Check for duplicate email etc.
            http.Error(w, "Could not create user", http.StatusInternalServerError)
            return
        }
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(map[string]interface{}{"id": userID})
    }
}

