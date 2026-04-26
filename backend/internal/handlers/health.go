package handlers

import (
	"net/http"
	"pendaftaran-uib/backend/internal/db"
	"pendaftaran-uib/backend/internal/utils"
)

func HealthCheck(provider *db.Provider) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		mysqlOK, mongoOK := provider.PingCheck(r.Context())

		status := http.StatusOK
		if !mysqlOK || !mongoOK {
			status = http.StatusServiceUnavailable
		}

		utils.WriteJSON(w, status, map[string]any{
			"status": map[string]bool{
				"mysql": mysqlOK,
				"mongo": mongoOK,
			},
		})
	}
}
