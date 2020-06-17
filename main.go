package main

import (
	"encoding/gob"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"golang.org/x/net/context"

	"github.com/rs/xid"

	"gorillaproj/utils"
)

var ctx context.Context

//secret key -- random generate
var store = sessions.NewCookieStore([]byte("top-secret"))

//Person is a struct
type Person struct {
	Name     string
	Pathfile []string
	Link     []string
}

func init() {
	gob.Register(&Person{})
}

func main() {

	utils.LoadTemplates("templates/*.html")

	r := mux.NewRouter()

	r.HandleFunc("/", indexGetHandler).Methods("GET")
	r.HandleFunc("/", indexPostHandler).Methods("POST")
	r.HandleFunc("/logout", logoutGetHandler).Methods("GET")
	r.HandleFunc("/{id}", userGetHandler).Methods("GET")

	r.HandleFunc("/test/test", testGetHandler).Methods("GET")
	r.HandleFunc("/test/test/test", testtestGetHandler).Methods("GET")
	r.HandleFunc("/pdfview/prova", pdfGetHandler).Methods("GET", "OPTIONS")

	fs := http.FileServer(http.Dir("./static/"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))

	//use r as default handler
	http.Handle("/", r)
	http.ListenAndServe(":8080", nil)
}

//entry page
func indexGetHandler(w http.ResponseWriter, r *http.Request) {

	session, _ := store.Get(r, "session-prova")

	// val := session.Values["person"]

	// var person = &Person{}
	// person, ok := val.(*Person)

	// if !ok {
	// 	fmt.Printf("error retrieving struct")
	// 	//utils.InternalServerError(w)
	// 	//return
	// 	http.Redirect(w, r, "/", 302)
	// } else {
	// 	fmt.Printf(person.Name)
	// }
	//_, ok := session.Values["id"]

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

	// if !ok {
	// 	//delete session
	// 	session.Options.MaxAge = -1
	// 	err := session.Save(r, w)
	// 	if err != nil {
	// 		fmt.Printf("error deleting session for client")
	// 		utils.InternalServerError(w)
	// 		return
	// 	}
	// }

	utils.ExecuteTemplate(w, "index.html", session.Values)
}

func indexPostHandler(w http.ResponseWriter, r *http.Request) {

	session, _ := store.Get(r, "session-prova")

	val := session.Values["person"]

	var person = &Person{}
	person, ok := val.(*Person)

	if !ok {
		fmt.Printf("first time uploading\n")

		guid := xid.New()
		codice := guid.String()

		//max 10 MB files
		r.ParseMultipartForm(10 << 20)
		file, handler, err := r.FormFile("myFile")

		if err != nil {
			fmt.Printf("error parsing file")
			utils.InternalServerError(w)
			return
		}

		defer file.Close()
		fmt.Printf("uploaded file %+v\n", handler.Filename)
		fmt.Printf("file size: %+v\n", handler.Size)
		fmt.Printf("main handler: %+v\n", handler.Header)

		os.Mkdir("./static/sessions/"+codice, os.ModePerm)

		//tempFile, err := ioutil.TempFile(codice, "pdf-*.pdf")
		tempFile, err := ioutil.TempFile("./static/sessions/"+codice, "pdf-*.pdf")

		if err != nil {
			fmt.Printf("error creating file in the new folder")
			utils.InternalServerError(w)
			return
		}

		fmt.Printf("name of file %+v\n", tempFile.Name())
		path := tempFile.Name()
		defer tempFile.Close()

		fileBytes, err := ioutil.ReadAll(file)
		if err != nil {
			fmt.Printf("error reading file")
			utils.InternalServerError(w)
			return
		}

		tempFile.Write(fileBytes)

		//link := "http://localhost:8080/" + id + "/" + strings.Trim(filepath.Base(path), ".pdf")
		link := "http://localhost:8080/" + codice

		session.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   86400,
			HttpOnly: true,
		}

		person := &Person{
			Name:     codice,
			Pathfile: []string{path},
			Link:     []string{link},
		}

		session.Values["person"] = person
		err = session.Save(r, w)
		if err != nil {
			fmt.Printf("error saving session")
		}

		http.Redirect(w, r, "/"+codice, 302)

	} else {
		fmt.Printf(person.Name)

		r.ParseMultipartForm(10 << 20)
		file, handler, err := r.FormFile("myFile")

		if err != nil {
			fmt.Printf("error parsing file")
			utils.InternalServerError(w)
			return
		}

		defer file.Close()
		fmt.Printf("uploaded file %+v\n", handler.Filename)
		fmt.Printf("file size: %+v\n", handler.Size)
		fmt.Printf("main handler: %+v\n", handler.Header)

		tempFile, err := ioutil.TempFile("./static/sessions/"+person.Name, "pdf-*.pdf")

		if err != nil {
			fmt.Printf("error creating file in the new folder")
			utils.InternalServerError(w)
			return
		}

		fmt.Printf("name of file %+v\n", tempFile.Name())
		path := tempFile.Name()
		defer tempFile.Close()

		fileBytes, err := ioutil.ReadAll(file)
		if err != nil {
			fmt.Printf("error reading file")
			utils.InternalServerError(w)
			return
		}

		tempFile.Write(fileBytes)
		person.Pathfile = append(person.Pathfile, path)
		session.Save(r, w)

		http.Redirect(w, r, "/"+person.Name, 302)
	}

}

func userGetHandler(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	id := vars["id"]

	session, _ := store.Get(r, "session-prova")

	val := session.Values["person"]

	var person = &Person{}
	person, ok := val.(*Person)

	if !ok {
		fmt.Fprintf(w, "hello client")
	} else if person.Name == id {
		fmt.Fprintf(w, "hello master")

	}

}

func logoutGetHandler(w http.ResponseWriter, r *http.Request) {

	session, _ := store.Get(r, "session-prova")

	val := session.Values["person"]

	var person = &Person{}
	person, ok := val.(*Person)

	if !ok {
		fmt.Printf("error retrieving struct")
		//utils.InternalServerError(w)
		//return
		http.Redirect(w, r, "/", 302)
	} else {
		for i := 0; i < len(person.Pathfile); i++ {
			err := os.Remove(person.Pathfile[i])

			if err != nil {
				fmt.Printf("error iterating removing path")
				//utils.InternalServerError(w)
				//return
				http.Redirect(w, r, "/", 302)
			}
		}

		err := os.RemoveAll("./static/sessions/" + person.Name)

		if err != nil {
			fmt.Printf("error removing dynamic folder")
			utils.InternalServerError(w)
			return
		}

		delete(session.Values, "person")
		err = session.Save(r, w)
		if err != nil {
			fmt.Printf("error saving session")
		} else {
			fmt.Printf("session deleted")
		}
	}

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

func testGetHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session-prova")

	person := &Person{
		Name:     "daniele",
		Pathfile: []string{""},
		Link:     []string{""},
	}

	session.Values["person"] = person
	err := session.Save(r, w)
	if err != nil {
		fmt.Printf("error saving session")
	}

	w.Write([]byte(person.Name))
}

func testtestGetHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session-prova")

	val := session.Values["person"]

	var person = &Person{}
	person, ok := val.(*Person)

	if !ok {
		fmt.Printf("error readin person")
		utils.InternalServerError(w)
	}

	w.Write([]byte(person.Link[0]))
}
