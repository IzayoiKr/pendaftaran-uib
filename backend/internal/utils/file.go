package utils

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
)

// SaveUploadedFile saves a multipart file to the local disk and returns the relative path
func SaveUploadedFile(file multipart.File, header *multipart.FileHeader, uploadDir string) (string, error) {
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return "", err
	}

	// Generate a unique filename to prevent overwriting
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%d-%s%s", time.Now().UnixNano(), "doc", ext)
	filepath := filepath.Join(uploadDir, filename)

	out, err := os.Create(filepath)
	if err != nil {
		return "", err
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		return "", err
	}

	// Return the relative path to store in the database
	return "/" + filepath, nil
}
