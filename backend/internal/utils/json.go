package utils

import (
	"encoding/json"
	"errors"
	"net/http"
)

func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

type APIError struct {
	Error string `json:"error"`
}

func ErrJSON(msg string) APIError {
	return APIError{Error: msg}
}

func DecodeJSON(r *http.Request, dst any) error {
	if err := json.NewDecoder(r.Body).Decode(dst); err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			return errors.New("ukuran data terlalu besar")
		}
		return errors.New("data yang dimasukkan tidak valid")
	}
	return nil
}
