package middleware

import (
	"net/http"

	"pendaftaran-uib/backend/internal/utils"
)

func SecFetch(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        site := r.Header.Get("Sec-Fetch-Site")

        if site == "" {
            next.ServeHTTP(w, r)
            return
        }

        switch r.Method {
        case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
            if site == "cross-site" {
				utils.WriteJSON(w, http.StatusForbidden, utils.ErrJSON("forbidden"))
                return
            }
        }

        next.ServeHTTP(w, r)
    })
}
