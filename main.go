package main

import (
	"encoding/gob"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"livenote/utils"

	socketio "github.com/googollee/go-socket.io"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/rs/xid"
)

// IP adress
const IP = "127.0.0.1"

// PORT local
const PORT = "8080"

// Generate a random key
var store = sessions.NewCookieStore([]byte("top-secret"))

// User struct for session
// ID: unique identifier.
// Files: this is the file path uploaded in the static folder.
// Code: this is the unique code to generate the correspondig url.
type User struct {
	ID    string
	Files []string
	Codes []string
}

// Presentation struct for identify which pdf we are presenting
// Mode: 0 Master - 1 Client
// Path: file path
// Slide: # of current slide
type Presentation struct {
	Mode  int
	Path  string
	Slide int
}

//init function to initialize the structs and allow serialise/deserialise
func init() {
	gob.Register(&User{})
	gob.Register(&Presentation{})
}

//LayoutDir is a layout
var LayoutDir = "templates/*.gohtml"
var server *socketio.Server

func main() {

	utils.LoadTemplates(LayoutDir)

	r := mux.NewRouter()

	r.HandleFunc("/", indexGetHandler).Methods("GET")
	r.HandleFunc("/", indexPostHandler).Methods("POST")
	//start pdf presentation master/client according to a loaded file
	r.HandleFunc("/{user-session-id}-{id}", userGetHandler).Methods("GET")

	r.HandleFunc("/delete-presentation", deletePostHandler).Methods("POST")
	//TODO serve static files
	staticDirFiles := http.FileServer(http.Dir("./static/"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", staticDirFiles))

	srv := &http.Server{
		Handler: r,
		Addr:    IP + ":" + PORT,
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	s, err := socketio.NewServer(nil)
	server = s
	if err != nil {
		fmt.Printf("error creatin server\n")
		log.Fatal(err)
	}

	LoadActiveSessions()

	go server.Serve()
	defer server.Close()

	r.Handle("/socket.io/", server)

	log.Fatal(srv.ListenAndServe())
	//http.ListenAndServe("http://"+IP+":"+PORT, nil)
}

// indexGetHandler load entry page
// if there is some value in session we retrieve it, otherwise we just execute the template
// we check that all items are correct, if not we are removing them
func indexGetHandler(w http.ResponseWriter, r *http.Request) {

	session, _ := store.Get(r, "user-session")
	val := session.Values["user"]
	var user = &User{}
	user, ok := val.(*User)

	if ok {
		files, err2 := ioutil.ReadDir("./static/sessions/" + user.ID)
		if err2 != nil {
			fmt.Printf("create new dir...")
			os.Mkdir("./static/sessions/"+user.ID, os.ModePerm)
			user.Codes = user.Codes[:0]
			user.Files = user.Files[:0]
			session.Save(r, w)
			utils.ExecuteTemplate(w, "index", session.Values)
			return
		}
		var localFiles []string
		for _, f := range files {
			localFiles = append(localFiles, f.Name())
		}

		for _, sf := range user.Codes {
			_, check := contains(localFiles, sf+".pdf")

			if !check {
				fmt.Printf("remove...")
				index, _ := contains(user.Codes, sf)
				user.Codes = RemoveIndex(user.Codes, index)
				user.Files = RemoveIndex(user.Files, index)
			}
		}
		err := session.Save(r, w)
		if err != nil {
			fmt.Printf("error saving session")
			return
		}

	}
	utils.ExecuteTemplate(w, "index", session.Values)
}

// deletePostHandler when click on button delete happens, we are removing all references to path and deleting the file
func deletePostHandler(w http.ResponseWriter, r *http.Request) {

	session, _ := store.Get(r, "user-session")
	val := session.Values["user"]
	var user = &User{}
	user, ok := val.(*User)

	if !ok {
		return
	}
	var p = strings.Split(r.FormValue("delete"), "-")
	var usersession = p[0]
	var file = p[1]

	err := os.Remove("./static/sessions/" + usersession + "/" + file + ".pdf")
	if err != nil {
		utils.InternalServerError(w)
		return
	}

	index, check := contains(user.Codes, file)
	fmt.Printf("Check remove %d \n", index)
	if check {
		user.Codes = RemoveIndex(user.Codes, index)
		user.Files = RemoveIndex(user.Files, index)
		err = session.Save(r, w)
		if err != nil {
			fmt.Printf("error saving session")
			return
		}
	}

	http.Redirect(w, r, "http://"+IP+":"+PORT, 302)
}

// indexPostHandler create a session for the user who upload a file, and save this file in a specific folder
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
	workingDir := user.ID

	guid := xid.New()
	fileid := guid.String()

	fmt.Printf("Loading session for user " + user.ID + "\n")

	os.Mkdir("./static/sessions/"+workingDir, os.ModePerm)

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

	NewLiveNote("/" + workingDir + "-" + fileid)

	//utils.SavePresentation(fileid, url)
	http.Redirect(w, r, "http://"+IP+":"+PORT, 302)
}

// LoadActiveSessions create the session for all the files uploaded
func LoadActiveSessions() {

	sessions, err := ioutil.ReadDir("./static/sessions/")
	if err != nil {
		log.Fatal(err)
		return
	}
	for _, s := range sessions {
		files, err2 := ioutil.ReadDir("./static/sessions/" + s.Name())
		if err2 != nil {
			log.Fatal(err)
			return
		}
		for _, f := range files {
			ns := s.Name() + "-" + strings.Trim(f.Name(), ".pdf")
			NewLiveNote("/" + ns)

		}
	}

}

// NewLiveNote manage the socket.io connection for each livenote
// we connect on the parent directory, then we join a room with specific id
func NewLiveNote(id string) {

	fmt.Printf("Create live note %s\n", id)

	server.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")
		fmt.Println("connected :", s.ID())
		return nil
	})
	server.OnConnect(id, func(s socketio.Conn) error {
		s.SetContext("")
		s.Join("bcast")
		fmt.Println("connected and entering :", s.ID())
		return nil
	})
	server.OnError(id, func(s socketio.Conn, e error) {
		fmt.Printf("error on socket server\n")
		s.LeaveAll()
	})
	server.OnDisconnect(id, func(s socketio.Conn, reason string) {
		s.LeaveAll()
		s.Close()
	})
}

//contains check if an array of string contains a specific string
func contains(slice []string, val string) (int, bool) {
	for i, item := range slice {
		if item == val {
			return i, true
		}
	}
	return -1, false
}

//RemoveIndex delete an element at defined position in a string array
func RemoveIndex(s []string, index int) []string {
	return append(s[:index], s[index+1:]...)
}

//FIXME contains
//userGetHandler manage the presentation for master/client
func userGetHandler(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	code := vars["id"]
	userSessionID := vars["user-session-id"]

	session, _ := store.Get(r, "user-session")
	val := session.Values["user"]
	var user = &User{}
	user, ok := val.(*User)

	fmt.Printf("Load id:" + code + " for user session " + userSessionID)

	var p = &Presentation{}

	if !ok {
		fmt.Println("./static/sessions/" + userSessionID + "/")
		files, err := ioutil.ReadDir("./static/sessions/" + userSessionID + "/")
		if err != nil {
			utils.ExecuteTemplate(w, "error", p)
			return
		}
		var path = ""
		for _, f := range files {
			if f.Name() == code+".pdf" {
				path = "/static/sessions/" + userSessionID + "/" + f.Name()
				break
			}
		}
		if path == "" {
			utils.ExecuteTemplate(w, "error", p)
			return
		}
		p.Mode = 1
		p.Path = path
		p.Slide = 1

	} else if index, check := contains(user.Codes, code); check {
		p.Mode = 0
		p.Path = user.Files[index]
		p.Slide = 1

		server.BroadcastToRoom("/"+userSessionID+"-"+code, "bcast", "event:start", "{\"pID\":\""+code+"\"}")

		server.OnEvent("/"+userSessionID+"-"+code, "event:master", func(s socketio.Conn, msg string) string {
			fmt.Println("event:master for " + "/" + userSessionID + "-" + code)
			server.BroadcastToRoom("/"+userSessionID+"-"+code, "bcast", "event:slide", msg)
			return ""
		})

		server.OnEvent("/"+userSessionID+"-"+code, "event:master:shape", func(s socketio.Conn, msg string) string {
			fmt.Println("event:master for " + "/" + userSessionID + "-" + code)
			server.BroadcastToRoom("/"+userSessionID+"-"+code, "bcast", "event:slide:shape", msg)
			return ""
		})
	}
	utils.ExecuteTemplate(w, "presenter", p)
}
