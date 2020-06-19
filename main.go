package main

import (
	"encoding/gob"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"./utils"

	socketio "github.com/googollee/go-socket.io"
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
var server *socketio.Server

func main() {

	utils.LoadTemplates(LayoutDir)

	r := mux.NewRouter()

	r.HandleFunc("/", indexGetHandler).Methods("GET")
	r.HandleFunc("/", indexPostHandler).Methods("POST")
	//start pdf presentation master/client according to a loaded file
	r.HandleFunc("/{user-session-id}-{id}", userGetHandler).Methods("GET")

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
		log.Fatal(err)
	}
	server.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")
		fmt.Println("connected:", s.ID())

		return nil
	})

	server.OnEvent("/", "addToPresentation", func(s socketio.Conn, pID string) {
		fmt.Println("addToPresentation:", pID)
		s.Join(pID)
	})

	server.OnEvent("/", "notice", func(s socketio.Conn, msg string) {
		fmt.Println("notice:", msg)
		s.Emit("reply", "have "+msg)
	})
	server.OnEvent("/chat", "msg", func(s socketio.Conn, msg string) string {
		s.SetContext(msg)
		return "recv " + msg
	})
	server.OnEvent("/", "bye", func(s socketio.Conn) string {
		last := s.Context().(string)
		s.Emit("bye", last)
		s.Close()
		return last
	})
	server.OnError("/", func(s socketio.Conn, e error) {
		fmt.Println("meet error:", e)
	})
	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		fmt.Println("closed", reason)
	})

	go server.Serve()
	defer server.Close()

	r.Handle("/socket.io/", server)

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

	//utils.SavePresentation(fileid, url)
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
	userSessionId := vars["user-session-id"]

	session, _ := store.Get(r, "user-session")

	val := session.Values["user"]

	var user = &User{}
	user, ok := val.(*User)

	fmt.Printf("Load id:" + code + " for user session " + userSessionId)

	var p = &Presentation{}

	if !ok {
		fmt.Println("./static/sessions/" + userSessionId + "/")
		files, err := ioutil.ReadDir("./static/sessions/" + userSessionId + "/")
		if err != nil {
			utils.ExecuteTemplate(w, "error", p)
			return
		}
		var path = ""
		for _, f := range files {
			if f.Name() == code+".pdf" {
				path = "/static/sessions/" + userSessionId + "/" + f.Name()
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

		server.BroadcastToRoom("", code, "event:start", "")

		server.OnEvent("/", "event:master", func(s socketio.Conn, msg string) string {

			server.BroadcastToRoom("", code, "event:slide", msg)
			return ""
		})
	}
	utils.ExecuteTemplate(w, "presenter", p)
}
