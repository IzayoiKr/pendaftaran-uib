package handlers

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"pendaftaran-uib/backend/internal/auth"
	"pendaftaran-uib/backend/internal/crypto"

	"github.com/go-chi/chi/v5"
)

func ServeStorageFile(storageDir string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r)
		if claims == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Extract the wild-card path from the URL
		fileSubPath := chi.URLParam(r, "*")
		if fileSubPath == "" {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}

		// Clean the path to prevent directory traversal
		cleanSubPath := filepath.Clean(fileSubPath)
		pathParts := strings.Split(filepath.ToSlash(cleanSubPath), "/")

		// Security: Enforce ownership check
		// Expected path: registrations/{userID}/{regID}/...
		if len(pathParts) < 2 || pathParts[0] != "registrations" || pathParts[1] != claims.Subject {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}

		// Prevent directory traversal attacks by joining it with the absolute storage directory.
		fullPath := filepath.Join(storageDir, cleanSubPath)

		// Ensure the resulting path is actually inside the storageDir
		// (additional safeguard against path traversal)
		if !strings.HasPrefix(fullPath, filepath.Clean(storageDir)) {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}

		// Open the encrypted file
		file, err := os.Open(fullPath)
		if err != nil {
			if os.IsNotExist(err) {
				http.Error(w, "File not found", http.StatusNotFound)
			} else {
				http.Error(w, "Internal server error", http.StatusInternalServerError)
			}
			return
		}
		defer file.Close()

		// Decrypt on-the-fly and stream to client
		pr, pw := io.Pipe()
		go func() {
			err := crypto.DecryptStream(file, pw)
			_ = pw.CloseWithError(err)
		}()
		dr := pr

		// Sniff content type from decrypted data
		magicBuf := make([]byte, 512)
		n, err := io.ReadFull(dr, magicBuf)
		if err != nil && err != io.EOF && err != io.ErrUnexpectedEOF {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		magicBuf = magicBuf[:n]

		contentType := http.DetectContentType(magicBuf)
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Disposition", "inline")

		// Write the sniffed buffer first
		if _, err := w.Write(magicBuf); err != nil {
			return
		}

		// Stream the rest of the decrypted content
		if _, err := io.Copy(w, dr); err != nil {
			// Note: At this point, headers might have been sent,
			// so http.Error might not be effective.
			return
		}
	}
}
