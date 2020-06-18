package main

import (
	"encoding/gob"
	"fmt"
	"./utils"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/rs/xid"
	"golang.org/x/net/context"
)

//IP is bla
const IP = "127.0.0.1"

//PORT is bla
const PORT = "8080"

var ctx context.Context

//secret key -- random generate
var store = sessions.NewCookieStore([]byte("top-secret"))

//User is a struct
type User struct {
	ID    string
	Files []string //this the file path uploaded in the static folder
	Codes []string //this is the unique code to generate the correspondig url
}

//Presentation is a struct
type Presentation struct {
	Mode  int
	Path  string
	Slide int
}

func init() {
	gob.Register(&User{})
}

//LayoutDir is a layout
var LayoutDir = "templates/*.gohtml"

func main() {

	utils.LoadTemplates(LayoutDir)
	utils.LoadDB()

	r := mux.NewRouter()

	r.HandleFunc("/", indexGetHandler).Methods("GET")
	r.HandleFunc("/", indexPostHandler).Methods("POST")
	//start pdf presentation master/client according to a loaded file
	r.HandleFunc("/{id}", userGetHandler).Methods("GET")

	//TODO just for dev
	/*r.HandleFunc("/test/test", testGetHandler).Methods("GET")
	r.HandleFunc("/test/test/test", testtestGetHandler).Methods("GET")
	r.HandleFunc("/pdfview/prova", pdfGetHandler).Methods("GET", "OPTIONS")*/
	//TODO end jsut for dev (we remove it soon)

	//TODO serve static files
	staticDirFiles := http.FileServer(http.Dir("./static/"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", staticDirFiles))

	//use r as default handler
	//TODO we do not need this, for now we remove it
	//http.Handle("/", r)

	srv := &http.Server{
		Handler: r,
		Addr:    IP + ":" + PORT,
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Fatal(srv.ListenAndServe())
	//http.ListenAndServe("http://"+IP+":"+PORT, nil)
}

//entry page
func indexGetHandler(w http.ResponseWriter, r *http.Request) {

	session, _ := store.Get(r, "user-session")
	//TODO make template to change the ip and the port of the configured server (line 14 of index.html)
	utils.ExecuteTemplate(w, "index", session.Values)
}

func indexPostHandler(w http.ResponseWriter, r *http.Request) {

	//max 10 MB files
	r.ParseMultipartForm(10 << 20)
	file, _, err := r.FormFile("file")

	if err != nil {
		fmt.Printf("Error parsing file or not file is present to upload")
		utils.InternalServerError(w)
		return
	}

	session, _ := store.Get(r, "user-session")
	val := session.Values["user"]
	var user = &User{}
	user, ok := val.(*User)

	if !ok {
		//Fist time a user enter in the system, we create the data and bla bla...
		//TODO add doc
		fmt.Printf("Create new user session\n")
		guid := xid.New()
		userid := guid.String()

		os.Mkdir("./static/sessions/"+userid, os.ModePerm)

		session.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   86400,
			HttpOnly: true,
		}

		u := &User{
			ID:    userid,
			Files: []string{},
			Codes: []string{},
		}

		session.Values["user"] = u
		err = session.Save(r, w)
		if err != nil {
			fmt.Printf("error saving session")
			return
		}
		user = u
	}
	//now we create new presentation code and load the file in the user session
	var workingDir = user.ID

	guid := xid.New()
	fileid := guid.String()

	fmt.Printf("Loading session for user " + user.ID + " \n")

	//FIXME variabile di sistema
	uFile, err := os.Create("./static/sessions/" + workingDir + "/" + fileid + ".pdf")

	if err != nil {
		fmt.Printf("error creating file in the user session folder")
		log.Fatal(err)
		utils.InternalServerError(w)
		return
	}
	fmt.Printf("name of file %+v\n", uFile.Name())

	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		fmt.Printf("error reading file")
		utils.InternalServerError(w)
		return
	}

	uFile.Write(fileBytes)

	defer uFile.Close()
	defer file.Close()

	var url = "http://" + IP + ":" + PORT + "/static/sessions/" + workingDir + "/" + fileid + ".pdf"
	user.Files = append(user.Files, url)
	user.Codes = append(user.Codes, fileid)
	session.Save(r, w)
	fmt.Printf("redirect on .." + " http://" + IP + ":" + PORT + "/" + fileid)

	utils.SavePresentation(fileid, url)
	http.Redirect(w, r, "http://"+IP+":"+PORT, 302)

}

//checkid is a func
func contains(slice []string, val string) (int, bool) {
	for i, item := range slice {
		if item == val {
			return i, true
		}
	}
	return -1, false
}

//FIXME contains
func userGetHandler(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	code := vars["id"]

	session, _ := store.Get(r, "user-session")

	val := session.Values["user"]

	var user = &User{}
	user, ok := val.(*User)

	fmt.Printf("Load id:" + code + " for user session " + user.ID)

	var p = &Presentation{}

	if !ok {
		fmt.Fprintf(w, "hello client")
		p.Mode = 1
		p.Path = utils.LoadPresentation(code)
		p.Slide = 1

	} else if index, check := contains(user.Codes, code); check {
		p.Mode = 0
		p.Path = user.Files[index]
		p.Slide = 1
	}
	utils.ExecuteTemplate(w, "presenter", p)
}

/*
	from
	here
	not
	used
*/
/*
func pdfGetHandler(w http.ResponseWriter, r *http.Request) {
	utils.ExecuteTemplate(w, "pdfview.html", nil)
}

//AuthRequired is bla
func AuthRequired(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, "session")
		_, ok := session.Values["username"]
		if !ok {
			http.Redirect(w, r, "http://"+IP+":"+PORT+"/login", 302)
			return
		}
		handler.ServeHTTP(w, r)
	}
}

func testGetHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "user-session")

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
	session, _ := store.Get(r, "user-session")

	val := session.Values["person"]

	var person = &Person{}
	person, ok := val.(*Person)

	if !ok {
		fmt.Printf("error readin person")
		utils.InternalServerError(w)
	}

	w.Write([]byte(person.Link[0]))
}
*/
