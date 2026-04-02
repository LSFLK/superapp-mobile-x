// internal/utils/mime_utils.go
package utils

import (
	"net/http"
	"path/filepath"
	"strings"
)

// mimeMapping provides a single source of truth for allowed extensions and their canonical MIME types
var mimeMapping = map[string]string{
	".pdf":  "application/pdf",
	".png":  "image/png",
	".jpg":  "image/jpeg",
	".jpeg": "image/jpeg",
}

// ValidateFile checks the filename extension and actual content (magic bytes)
// Returns MIME type and a boolean indicating if the file is valid
func ValidateFile(filename string, content []byte) (string, bool) {
	ext := strings.ToLower(filepath.Ext(filename))

	// Validate Extension against our known allowed list
	canonicalMime, supported := mimeMapping[ext]
	if !supported {
		return "", false
	}

	// Validate actual content for security
	// http.DetectContentType uses the first 512 bytes to determine the MIME type.
	detectedMime := http.DetectContentType(content)

	// Clean detected MIME (remove charset info if present)
	if parts := strings.Split(detectedMime, ";"); len(parts) > 0 {
		detectedMime = parts[0]
	}

	// Make sure the extension matches the actual content type
	// This prevents a user from uploading a .exe renamed to .pdf
	if detectedMime != canonicalMime {
		return "", false
	}

	return canonicalMime, true
}

// GetMimeByExtension is a helper for cases where only the filename is available
func GetMimeByExtension(filename string) (string, bool) {
	ext := strings.ToLower(filepath.Ext(filename))
	mime, allowed := mimeMapping[ext]
	return mime, allowed
}
