package middleware

import (
	"net/http"
)

const jsonBodyLimit = 1 << 20
const multipartBodyLimit = 30 << 20

func LimitBody(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			next.ServeHTTP(w, r)
		})
	}
}

func LimitJSON(next http.Handler) http.Handler {
	return LimitBody(jsonBodyLimit)(next)
}

func LimitMultipart(next http.Handler) http.Handler {
	return LimitBody(multipartBodyLimit)(next)
}
