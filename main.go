package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"golang.org/x/net/context"

	"github.com/rs/xid"

	"gorillaproj/utils"
)

var ctx context.Context

//secret key -- random generate
var store = sessions.NewCookieStore([]byte("top-secret"))

func main() {

	utils.LoadTemplates("templates/*.html")
	//templates = template.Must(template.ParseGlob("templates/*.html"))
	r := mux.NewRouter()

	//r.HandleFunc("/", AuthRequired(indexGetHandler)).Methods("GET")

	r.HandleFunc("/", indexGetHandler).Methods("GET")
	r.HandleFunc("/", indexPostHandler).Methods("POST")
	//r.HandleFunc("/login", loginGetHandler).Methods("GET")
	//r.HandleFunc("/login", loginPostHandler).Methods("POST")
	r.HandleFunc("/logout", logoutGetHandler).Methods("GET")
	r.HandleFunc("/{id}", userGetHandler).Methods("GET")
	r.HandleFunc("/test", AuthRequired(testGetHandler)).Methods("GET")

	r.HandleFunc("/pdfview/prova", pdfGetHandler).Methods("GET")

	fs := http.FileServer(http.Dir("./static/"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))

	//use r as default handler
	http.Handle("/", r)
	http.ListenAndServe(":8080", nil)
}

//entry page
func indexGetHandler(w http.ResponseWriter, r *http.Request) {

	session, _ := store.Get(r, "session")

	_, ok := session.Values["id"]

	//check if another session is alive
	// if !ok {
	// 	if err != nil {
	// 		utils.InternalServerError(w)
	// 		return
	// 	}
	// 	guid := xid.New()

	// 	//change max age to 86400 * i(time in seconds)to have i days until cookie expire
	// 	//max age = 0 means that the cookie will be deleted after browser session ends
	// 	session.Options = &sessions.Options{
	// 		Path:     "/",
	// 		MaxAge:   0,
	// 		HttpOnly: true,
	// 	}

	// 	codice := guid.String()
	// 	session.Values["id"] = codice
	// 	session.Save(r, w)
	// }

	if !ok {
		//delete session
		session.Options.MaxAge = -1
		err := session.Save(r, w)
		if err != nil {
			utils.InternalServerError(w)
			return
		}
		//utils.ExecuteTemplate(w, "index.html", nil)
	}

	utils.ExecuteTemplate(w, "index.html", session.Values)
}

func indexPostHandler(w http.ResponseWriter, r *http.Request) {

	session, _ := store.Get(r, "session")

	guid := xid.New()
	codice := guid.String()
	session.Values["id"] = codice
	session.Save(r, w)

	//max 10 MB files
	r.ParseMultipartForm(10 << 20)
	file, handler, err := r.FormFile("myFile")

	if err != nil {
		utils.InternalServerError(w)
		return
	}

	defer file.Close()
	fmt.Printf("uploaded file %+v\n", handler.Filename)
	fmt.Printf("file size: %+v\n", handler.Size)
	fmt.Printf("main handler: %+v\n", handler.Header)

	//create directory for session

	// tmpDir := os.TempDir()
	// pathprova := tmpDir + "/" + codice
	// err = os.MkdirAll(pathprova, os.ModeDir)
	// if err != nil {
	// 	utils.InternalServerError(w)
	// 	return
	// }

	// tempo, _ := ioutil.TempFile(pathprova, "tempo-*.pdf")
	// tempoBytes, _ := ioutil.ReadAll(file)

	// tempo.Write(tempoBytes)

	//write temporary files
	tempFile, err := ioutil.TempFile("temp-pdf", "upload-*.pdf")

	if err != nil {
		utils.InternalServerError(w)
		return
	}

	fmt.Printf("name of file %+v\n", tempFile.Name())
	path := tempFile.Name()
	session.Values["pathfile"] = tempFile.Name()
	session.Save(r, w)
	defer tempFile.Close()

	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		utils.InternalServerError(w)
		return
	}

	tempFile.Write(fileBytes)

	untyped, ok := session.Values["id"]
	if !ok {
		utils.InternalServerError(w)
		return
	}

	id, ok := untyped.(string)
	if !ok {
		utils.InternalServerError(w)
		return
	}

	// if you upload successfully, your cookie will expire in one day
	//	change max age to 86400 * i(time in seconds)to have i days until cookie expire
	// 	max age = 0 means that the cookie will be deleted after browser session ends
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400,
		HttpOnly: true,
	}

	link := "http://localhost:8080/" + id + "/" + strings.Trim(filepath.Base(path), ".pdf")
	session.Values["link"] = link
	session.Save(r, w)
	//fmt.Fprintf(w, "success upload\n")
	//fmt.Fprintf(w, "your link is: %s", link)

	http.Redirect(w, r, "/"+id, 302)
}

func userGetHandler(w http.ResponseWriter, r *http.Request) {

	session, _ := store.Get(r, "session")

	vars := mux.Vars(r)
	id := vars["id"]

	fmt.Fprintf(w, "hello %+v\n\n", id)

	if session.Values["id"] == id {
		fmt.Fprintf(w, "hello master")
	} else {
		fmt.Fprintf(w, "hello client")
	}

}

func logoutGetHandler(w http.ResponseWriter, r *http.Request) {

	session, _ := store.Get(r, "session")
	untyped, _ := session.Values["pathfile"]
	path, ok := untyped.(string)

	if !ok {
		utils.InternalServerError(w)
		return
	}

	err := os.Remove(path)

	if err != nil {
		utils.InternalServerError(w)
		return
	}

	delete(session.Values, "id")
	delete(session.Values, "pathfile")
	delete(session.Values, "link")
	session.Save(r, w)
	http.Redirect(w, r, "/", 302)
}

/*
	from
	here
	not
	used
*/

func pdfGetHandler(w http.ResponseWriter, r *http.Request) {
	utils.ExecuteTemplate(w, "pdfview.html", nil)
}

//AuthRequired is bla
func AuthRequired(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, "session")
		_, ok := session.Values["username"]
		if !ok {
			http.Redirect(w, r, "/login", 302)
			return
		}
		handler.ServeHTTP(w, r)
	}
}

func loginGetHandler(w http.ResponseWriter, r *http.Request) {
	utils.ExecuteTemplate(w, "login.html", nil)
}

func loginPostHandler(w http.ResponseWriter, r *http.Request) {

	r.ParseForm()
	username := r.PostForm.Get("username")
	password := r.PostForm.Get("password")

	session, _ := store.Get(r, "session")
	session.Values["username"] = username
	session.Values["password"] = password
	session.Save(r, w)
	http.Redirect(w, r, "/", 302)

}

func testGetHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session")
	untyped, ok := session.Values["username"]

	if !ok {
		utils.InternalServerError(w)
		return
	}

	username, ok := untyped.(string)
	if !ok {
		utils.InternalServerError(w)
		return
	}

	untyped, ok = session.Values["password"]

	if !ok {
		utils.InternalServerError(w)
		return
	}

	password, ok := untyped.(string)
	if !ok {
		utils.InternalServerError(w)
		return
	}

	untyped, _ = session.Values["path"]
	path, ok := untyped.(string)
	if !ok {
		utils.InternalServerError(w)
		return
	}

	w.Write([]byte(username))
	w.Write([]byte(password))
	w.Write([]byte(path))
}
