const express = require("express");
const app = express();
const fileUpload = require('express-fileupload');
const http = require("http");
var fs = require( 'fs' );
var path = require('path');
var shortid = require('shortid');
var cookieSession = require('cookie-session');
let ejs = require('ejs');
const { ifError } = require("assert");
const { json } = require("express");

//Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let broadcaster;
const port = 8080;

/*
Create https server with certificate
*/
const server = http.createServer({ 
},app);

const io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + '/public/sessions'));
app.use(fileUpload({
  limits: {fileSize: 50 * 1024 * 1024},
}));
app.use(cookieSession({
  id:'',
  links: [],
  ids: [],
  keys: ['livenote','++']
}))

/*
Index page - GET
Check if the user is new, otherwise render the page with the right informations
TODO: manage more then 1 file
*/
app.get('/', function(req, res) {
  
  var sess = req.session;
  if (sess.isNew){
    res.render('index.ejs', {element: ""});
  }else{
    var session_folder = path.join(__dirname + '/public/sessions/'+ sess.id);
    if (!fs.existsSync(session_folder)) { 
      sess.links = [];  // un array di sessione dove ogni sessione contiene un tot di file
      sess.ids = [];    // array di id dei file caricati
      sess.save(function(err) {
        if (err) throw err;
      })
      res.render('index.ejs', {element: ""});
    }else{
      res.render('index.ejs', {element: sess.id +"/"+sess.ids[sess.ids.length-1]});
     }
 }
});

/*
Dynamic page for presentation - GET
Check if you are master or slave and render the page
Prendo la session id e il file id nella richiesta. Faccio il confronto con la session id con l'id memorizzato nella sessione.
Se sono uguali allora è il master in quanto è colui che ha caricato il file
Se sono diversi, vuol dire che non si tratta della persona che ha caricato il file quindi un slave. 
*/
app.get('/:session_id/:file_id', function(req, res) {
  sid = req.params.session_id;
  fid = req.params.file_id;
  var sess = req.session;
  if (sess.isNew || sess.id != sid){
    
    res.sendFile(path.join(__dirname + '/public/slave/slave.html'))
  }else{
    res.sendFile(path.join(__dirname + '/public/master/master.html'))
  }
  //res.sendFile(path.join(__dirname + '/public/upload.html'))
})

/*
Index page - POST
Manage the upload of the file - for now only pdf
TODO: manage different type of files
*/
app.post('/', function(req, res) {
  var id = shortid.generate();
  var sess = req.session;
  var fileUploaded = req.files.file;
  if (fileUploaded.truncated) {
    console.log('File size over the limit!');
    res.redirect('back');
  }
  if (sess.isNew){
    sess.id = shortid.generate();
    sess.links = [];
    sess.ids = [];
  }else {
    try {
      if(sess.ids[0] != undefined){
        fs.unlinkSync(path.join(__dirname + '/public/sessions/'+ sess.id +"/"+sess.ids[0]+".pdf"));
      }
      sess.links = [];
      sess.ids = [];
      //file removed
    } catch(err) {
      console.error(err)
    }
  }

  var session_folder = path.join(__dirname + '/public/sessions/'+ sess.id);
  if (!fs.existsSync(session_folder)) {
    fs.mkdirSync(session_folder);
  }
  sess.links.push('sessions/'+ sess.id + '/' + id+".pdf");
  sess.ids.push(id)

  fileUploaded.mv(path.join(session_folder + '/' + id+".pdf"), (err) => {
    if (err) throw err;
    console.log('file uploaded successfull in folder');
  })
  sess.save(function(err) {
    if (err) throw err;
  })
  createnewlive("/"+sess.id+"/"+id)
  res.redirect(301, 'back');
})

/*
Create livenote for the name specified 
eg: /abc/def
*/

function createnewlive(name){
  console.log("New live at "+name)
  const nm = io.of(name);
  console.log(nm.name);
  nm.on("error", e => console.log(e));
  nm.on("connection", socket => makeitlive(socket));
}

/*
Load a session for each file on the server
Per il momento non è stato fatto ma lo scopo è quello di caricare un live per ogni sessione che tiene tot file 
*/
function loadSessions(){
  const directoryPath = path.join(__dirname, 'public/sessions');
  fs.readdir(directoryPath, function (err, files) {
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      } 
      files.forEach(function (session) {
          fs.readdir(path.join(__dirname, 'public/sessions/'+session), function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            } 
            files.forEach(function (file) {
                createnewlive("/"+session+"/"+path.parse(file).name)
            });
        });
      });
  });
}

/*
Create socket connection for each name
*/


function makeitlive(socket){
    // INIZIO 
    // OPERAZIONI PER LA CONNESSIONE VIDEO
  countPeopleInLive++;
  
  //updatingPollEnteringPerson();

  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });

  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });

  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });

  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });

  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  // FINE
  socket.on("disconnect", () => {
    if(chat_users_for_namespaces[socket.nsp.name]!= undefined && chat_users_for_namespaces[socket.nsp.name][socket.id] != undefined){
      delete chat_users_for_namespaces[socket.nsp.name][socket.id];
     }
    socket.broadcast.emit("chat-list", chat_users_for_namespaces[socket.nsp.name]);
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });

  socket.on("master", (data) => {
    socket.broadcast.emit("slidechanged", data);
  });

  socket.on("chat-message", (nickname, message) => {
     socket.broadcast.emit("chat-message", nickname, message);
  });

  socket.on("chat-enter", (nickname) => {
    if(chat_users_for_namespaces[socket.nsp.name] == undefined){
    chat_users_for_namespaces[socket.nsp.name] = {}
    }
    chat_users_for_namespaces[socket.nsp.name][socket.id] = nickname;
    console.log("socket.nsp.name: "+ socket.nsp.name+" e socket id: "+socket.id);
    socket.broadcast.emit("chat-list", chat_users_for_namespaces[socket.nsp.name]);
    socket.emit("chat-list", chat_users_for_namespaces[socket.nsp.name]);
    console.log("chat_users_for_namespaces"+JSON.stringify(chat_users_for_namespaces));
  });

  socket.on("pokemon", (status, name) => {
    socket.broadcast.emit("pokemon-update", status, name);
  });

  socket.on("shape", (data) => {
    socket.broadcast.emit("shapechanged", data);
  });

  socket.on("color", (data) => {
    socket.broadcast.emit("colorchanged", data);
  });
  
  socket.on("line", (data) => {
    socket.broadcast.emit("linechanged", data);
  });

  // creazione sondaggio
  socket.on("pollMultiple",(data)=>{
    countPeopleFixed=countPeopleInLive;
    datePoll=data;
    socket.broadcast.emit("pollMultiple",data);
    
  });

  socket.on("pollOpen",(data)=>{
    countPeopleFixed=countPeopleInLive;
    datePoll=data;
    socket.broadcast.emit("pollOpen",data);
  });

  //aggiornamento sondaggio
  socket.on("updatingPoll",(optionChecked)=>{
    
    var value=updatingOptionValue(optionChecked);

    socket.broadcast.emit("updatingPoll",{"optionChecked":optionChecked,"value":value});
    socket.emit("updatingPoll",{"optionChecked":optionChecked,"value":value});
    
   
  });

  // avviso i slave che il sondaggio è chiuso. Setto a 0 datePoll cosicchè un nuovo utente che entra saprà che non ci sarà nessun sondaggio
  socket.on("closePoll",()=>{
    datePoll=0;
    
    socket.broadcast.emit("closePoll");
  });

  
  // un nuovo utente che si connette prende i dati del sondaggio
  if(datePoll){// se il sondaggio è stato creato, l'utente prende altrimenti no
    socket.emit("getPoll",datePoll,countPeopleFixed);
  }

  socket.on("disconnect",()=>{
    countPeopleInLive--;
  });

}
var countPeopleFixed;
var countPeopleInLive=-1;
var chat_users_for_namespaces = {}
var datePoll=0;

loadSessions()
server.listen(port, () => console.log(`Server is running on port ${port}`));


// calcolo il valore della percentuale di una determinata opzione in base alle persone che stanno 
// partecipando al sondaggio e al conteggio del selezionamento di una determinata opzione
function updatingOptionValue(optionChecked){
  
  var value;
  var jsonDati=JSON.parse(datePoll);

  var countAnswer=jsonDati.valueOption[optionChecked];
  countAnswer++;

  value=Math.round((countAnswer/countPeopleFixed)*100); // Math.round per fare gli arrotondamenti quando abbiamo i numeri decimali

  jsonDati.valueOption[optionChecked]=countAnswer;

  datePoll=JSON.stringify(jsonDati);
  
  return value;
}

/*
// funzione che permette di aggiornare i dati del sondaggio quando un nuovo utente entra nel sito
function updatingPollEnteringPerson(){
  if(datePoll){
    var jsonDati=JSON.parse(datePoll);

    console.log(jsonDati);

    for(var i=0;i<jsonDati.optionPoll.length;i++){
      var text=jsonDati.optionPoll[i];
      var value=jsonDati.valueOption[text];

      if(value>0){
        value-=Math.round((1/countPeopleInLive)*100);
        jsonDati.valueOption[text]=value;
      }
    }
    console.log(jsonDati);
    
    datePoll=JSON.stringify(jsonDati);
  }
}*/
