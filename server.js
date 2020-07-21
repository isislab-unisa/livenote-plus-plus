const express = require("express");
const app = express();
const fileUpload = require('express-fileupload');
const https = require("https");
var fs = require( 'fs' );
var path = require('path');
var shortid = require('shortid');
var cookieSession = require('cookie-session');
let ejs = require('ejs');

//Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let broadcaster;
const port = 443;

/*
Create https server with certificate
*/
const server = https.createServer({ 
  key: fs.readFileSync("/etc/letsencrypt/live/isiswork00.di.unisa.it/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/isiswork00.di.unisa.it/fullchain.pem") 
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
      
      sess.links = [];
      sess.ids = [];
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
  nm.on("error", e => console.log(e));
  nm.on("connection", socket => makeitlive(socket));
}

/*
Load a session for each file on the server
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
    socket.broadcast.emit("chat-list", chat_users_for_namespaces[socket.nsp.name]);
    socket.emit("chat-list", chat_users_for_namespaces[socket.nsp.name]);
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
}
var chat_users_for_namespaces = {}

loadSessions()
server.listen(port, () => console.log(`Server is running on port ${port}`));

