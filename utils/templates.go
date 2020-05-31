package utils

import (
	"html/template"
	"net/http"
)

var templates *template.Template

// LoadTemplates is ok
func LoadTemplates(pattern string) {
	templates = template.Must(template.ParseGlob(pattern))
}

// ExecuteTemplate is ok
func ExecuteTemplate(w http.ResponseWriter, tmpl string, data interface{}) {
	templates.ExecuteTemplate(w, tmpl, data)
}
