package utils

import (
	"net/http"
)

/*
InternalServerError is a function to handle errors
*/
func InternalServerError(w http.ResponseWriter) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte("Internal server error"))
}
