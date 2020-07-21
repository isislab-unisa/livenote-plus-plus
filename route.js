var express = require('express');
var router = express.Router();
var path = require('path');
const fileUpload = require('express-fileupload');
var fs = require( 'fs' );
var shortid = require('shortid');
let ejs = require('ejs');


var cookieSession = require('cookie-session');
const { StringDecoder } = require('string_decoder');

router.use(express.static(__dirname + "/public"));
router.use(express.static(__dirname + '/public/sessions'));

router.use(fileUpload({
  limits: {fileSize: 50 * 1024 * 1024},
}));

router.use(cookieSession({
  id:'',
  links: [],
  ids: [],
  keys: ['livenote','++']
}))

router.get('/', function(req, res) {
  var sess = req.session;
  //res.sendFile(path.join(__dirname + '/index.html'));
  res.render('index.ejs', {element: sess.id +"/"+sess.ids[0]});

});


//GET
router.get('/:session_id/:file_id', function(req, res) {
  sid = req.params.session_id;
  fid = req.params.file_id;
  var sess = req.session;
  if (sess.isNew || sess.id != sid){
    //SLAVE CODE
    //res.render('slave.ejs');
    res.sendFile(path.join(__dirname + '/public/slave.html'))
  }else{
      //MASTER CODE
  /*   res.render('master.ejs', {
      id: sess.id, 
      links: sess.links
    }); */
    res.sendFile(path.join(__dirname + '/public/master.html'))
  }
  //res.sendFile(path.join(__dirname + '/public/upload.html'))
})

//POST
router.post('/', function(req, res) {
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
  console.log(sess);
  res.redirect(301, 'back');
})


module.exports = router;