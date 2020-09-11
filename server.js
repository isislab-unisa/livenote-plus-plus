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
const { type } = require("os");

//Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let broadcaster;
const port = 8080;

/*
Create https server with certificate
Change with your own if you want https connection
*/
const server = http.createServer({ 
},app);

const io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + '/public/sessions'));
app.use(fileUpload({
  limits: {fileSize: 50 * 1024 * 1024},
}));

/*
Manage cookie for the session
id: unique identifier
links: unique url link for presentation
ids: unique id for the presentation
keys: parameters needed for generate unique cookies
TODO: links and ids are array, but now for easy of use is managed just one id/link
*/
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
    //console.log('file uploaded successfull in folder');
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
  //console.log("New live at "+name)
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
There are different messages that could arrive on socket:
broadcaster: emit message when master start streaming
watcher: a client who connect to streaming
offer: a master offer connection to watcher
answer: a client response to offer
candidate: candidate for IceConnection
disconnect: when a user disconnect from session
master: when master change slide, send messages to all client with correct page number
chat-message: when a use write a message in the chat
chat-enter: when a user enter in the chat
pokemon: change the pokemon view of the ballon
shape: send the draw of master
color: change color of draw line
line: change widht of draw line
connection: when an user connect to the presentation
counter: keep track of number of partecipants
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
    socket.broadcast.emit("client_disconnected", true);
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
  socket.on("connection", (status) => {
    socket.broadcast.emit("client_connected", status);
  });
  socket.on("counter", (data) => {
    socket.broadcast.emit("counter_update", data);

  // creazione sondaggio
  

  socket.on("createPollMultiple",(data)=>{
    countPeopleFixed=countPeopleInLive;
    datePoll=data;
    countPersonAnswer=0;

    socket.broadcast.emit("createPollMultiple",data,countPeopleInLive);
    socket.emit("createPollMultiple",data,countPeopleInLive);
  });

  socket.on("createPollRanking",(data)=>{
    countPeopleFixed=countPeopleInLive;
    datePoll=data;
    countPersonAnswer=0;

    socket.broadcast.emit("createPollRanking",data,countPeopleInLive);
    socket.emit("createPollRanking",data,countPeopleInLive);
  });

  //aggiornamento sondaggio
  

  socket.on("updatingPoll",(optionChecked)=>{
    countPersonAnswer++;
    console.log(countPersonAnswer);
    var value=updatingOptionValue(optionChecked);

    socket.broadcast.emit("updatingPoll",{"optionChecked":optionChecked,"value":value},countPersonAnswer);
    socket.emit("updatingPoll",{"optionChecked":optionChecked,"value":value},countPersonAnswer);
   
  });

  socket.on("updatingPollRanking",(dateSelectRank)=>{
    countPersonAnswer++;
    jsonVote=updatingRanking(dateSelectRank);
    
    console.log("countPerson:"+countPersonAnswer);

    socket.broadcast.emit("updatingPollRanking",jsonVote,countPersonAnswer);
    socket.emit("updatingPollRanking",jsonVote,countPersonAnswer);
  });

  //funzione asincrona
  // quando riceve il conteggio delle immagini presenti nella directory rankICon,manda tale conteggio al master
  getCountFilesIMG(function(count){
    socket.emit("getCountFiles",count);
  });


// avviso i slave che il sondaggio è chiuso. Setto a 0 datePoll cosicchè un nuovo utente che entra saprà che non ci sarà nessun sondaggio
  socket.on("closePoll",()=>{
    var typePoll=(JSON.parse(datePoll).typePoll);

    datePoll=0;

    socket.broadcast.emit("closePoll",typePoll);
  });

  
  // un nuovo utente che si connette prende i dati del sondaggio
  if(datePoll){// se il sondaggio è stato creato, l'utente prende altrimenti no
    objectJSON=JSON.parse(datePoll);
    if(objectJSON.typePoll===0){
      socket.emit("getPollMultiple",datePoll,countPeopleFixed);
    }
    else if(objectJSON.typePoll===1){
      socket.emit("getPollRanking",datePoll,countPeopleFixed);
    }
  }

  socket.on("disconnect",()=>{
    countPeopleInLive--;
  });

}

var countPersonAnswer;
var countPeopleFixed;
var countPeopleInLive=-1;
var chat_users_for_namespaces = {}
var datePoll=0;

loadSessions()
server.listen(port, () => console.log(`Server is running on port ${port}`));


// calcolo il valore della percentuale di una determinata opzione in base alle persone che stanno 
// partecipando al sondaggio e al conteggio del selezionamento di una determinata opzione
function updatingOptionValue(optionChecked){
  
  
  
  var jsonDati=JSON.parse(datePoll);

  var countAnswer=jsonDati.valueOption[optionChecked];
  countAnswer++;

  jsonDati.valueOption[optionChecked]=countAnswer;

  datePoll=JSON.stringify(jsonDati);

  console.log("datePoll: "+datePoll);

  return countAnswer;
}

function updatingRanking(dateSelectRank){

  jsonVote={
    arrayVote:[]
  };
  
  var jsonDate=JSON.parse(datePoll);

  dateSelectRank.map(function(rank){

    jsonDate.value_question_rank[rank]++;

    jsonVote.arrayVote.push({"id":rank,"vote":jsonDate.value_question_rank[rank]});
  });

  datePoll=JSON.stringify(jsonDate);

  return JSON.stringify(jsonVote);
}

function getCountFilesIMG(emitSocket){
  var countFilesIMG=0;

    fs.readdir(__dirname+"/public/img/rankIcon", function (err, files) {
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      } 
      countFilesIMG=files.length;
      console.log("countFiles:"+countFilesIMG);
       emitSocket(countFilesIMG);      
  });


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
