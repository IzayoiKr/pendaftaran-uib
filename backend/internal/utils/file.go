package utils

import (
	"bytes"
	"context"
	"errors"
	"io"
	"log/slog"
	"mime/multipart"
	"os"
	"path/filepath"

	"pendaftaran-uib/backend/internal/clamav"
	"pendaftaran-uib/backend/internal/crypto"
)

type UploadConfig struct {
	TargetDir string
	TargetName string
	MaxBytes int64
}

var (
	ErrFileTooLarge    = errors.New("file too large")
	ErrInvalidType     = errors.New("invalid file type")
	ErrMissingHeader   = errors.New("missing file header")
	ErrMalwareDetected = errors.New("malware detected")
)

func SaveFile(
	ctx context.Context, 
	file multipart.File,
	header *multipart.FileHeader,
	cfg UploadConfig,
	scanner *clamav.Client,
) (int64, error) {
	if header == nil {
		return 0, ErrMissingHeader
	}

	if header.Size > cfg.MaxBytes {
		return 0, ErrFileTooLarge
	}

	if seeker, ok := file.(io.Seeker); ok {
		if _, err := seeker.Seek(0, io.SeekStart); err != nil {
			return 0, err
		}
	}

	magicBuf := make([]byte, 512)
	n, err := file.Read(magicBuf)
	if err != nil && err != io.EOF {
		return 0, err
	}
	magicBuf = magicBuf[:n]

	if !bytes.Contains(magicBuf, []byte("%PDF-")) {
		return 0, ErrInvalidType
	}

	var bodyBuf bytes.Buffer
	bodyBuf.Write(magicBuf)

	remainingBytes := cfg.MaxBytes - int64(n)
	if remainingBytes < 0 {
		return 0, ErrFileTooLarge
	}

	limitedStream := io.LimitReader(file, remainingBytes+1)
	written, err := io.Copy(&bodyBuf, limitedStream)
	if err != nil {
		return 0, err
	}
	if written > remainingBytes {
		return 0, ErrFileTooLarge
	}

	clean, scanErr := scanner.ScanStream(ctx, bytes.NewReader(bodyBuf.Bytes()))
	if scanErr != nil {
		return 0, scanErr
	}
	if !clean {
		return 0, ErrMalwareDetected
	}

	if err := os.MkdirAll(cfg.TargetDir, 0700); err != nil {
		return 0, err
	}

	finalPath := filepath.Join(cfg.TargetDir, cfg.TargetName)
	tmpPath := finalPath + ".tmp"
	
	out, err := os.OpenFile(tmpPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		return 0, err
	}

	var success bool
	defer func() {
		err := out.Close()
		if err == nil || errors.Is(err, os.ErrClosed) {
			slog.Debug("utils.SaveFile: file closed safely")
		} else {
			slog.Error("utils.SaveFile: actual disk close error encountered", "error", err)
		}
		if !success {
			_ = os.Remove(tmpPath)
		}
	}()

	if err := crypto.EncryptStream(bytes.NewReader(bodyBuf.Bytes()), out); err != nil {
		return 0, err
	}

	if err := os.Rename(tmpPath, finalPath); err != nil {
		return 0, err
	}
	success = true

	if seeker, ok := file.(io.Seeker); ok {
		_, _ = seeker.Seek(0, io.SeekStart)
	}

	fi, err := os.Stat(finalPath)
	if err != nil {
		return 0, err
	}

	return fi.Size(), nil
}

func FormatEncryptedPDFFileBuilder(docType string) (string, error) {
	id := NewUUID()
	return docType + "_" + id.String() + ".pdf.enc", nil
}
