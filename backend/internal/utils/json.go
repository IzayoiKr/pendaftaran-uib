package utils

import (
	"encoding/json"
	"errors"
	"net/http"
)

type APIError struct {
	Error string `json:"error"`
}

func ErrJSON(msg string) APIError {
	return APIError{Error: msg}
}

func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func DecodeJSON(r *http.Request, dst any) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	if err := dec.Decode(dst); err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			return errors.New("ukuran data terlalu besar")
		}
		return errors.New("data yang dimasukkan tidak valid")
	}
	return nil
}
