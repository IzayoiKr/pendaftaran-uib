package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"log"	
	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/models"
)

func UpdateProfile(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
			return
		}

		var req models.UserDTO
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":"Invalid input"}`, http.StatusBadRequest)
			return
		}

		log.Printf("Attempting update for UserID: %s", claims.UserID)
		log.Printf("New Name Received: '%s'", req.FullName)

		query := "UPDATE users SET full_name = ? WHERE id = ?"
		_, err := db.Exec(query, req.FullName, claims.UserID)
		if err != nil {
			log.Printf("SQL Error updating profile: %v", err) 
			
			http.Error(w, `{"error":"Failed to update profile"}`, http.StatusInternalServerError)
			return	
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Profile updated successfully"}`))
	}
}

