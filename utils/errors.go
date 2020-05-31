package utils

import (
	"net/http"
)

// InternalServerError is blabla
func InternalServerError(w http.ResponseWriter) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte("Internal server error"))
}
