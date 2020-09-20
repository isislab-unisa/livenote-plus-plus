/* RENDER PDF*/
let pdfDoc = null,
pageNum = 1,
pageIsRendering = false,
pageNumIsPending = null;

const scale = 2,
canvas = document.querySelector('#pdf-render'),
ctx = canvas.getContext('2d');

function resize(){
  renderPage(pageNum);
}
// Render the page
const renderPage = num => {
  pageIsRendering = true;

  // Get page
  pdfDoc.getPage(num).then(page => {

    var viewport = page.getViewport({ scale: 1, });
    var scale = Math.min((window.innerHeight / viewport.height), (window.innerWidth / viewport.width));
    //console.log(viewport.width +" "+viewport.height+" "+scale)    
    var viewport = page.getViewport({scale: scale,});
   
    canvas.height = window.innerHeight;
    canvas.width = viewport.width; 
    // canvas.height =  page.getViewport({ scale: 1, }).height;
    // canvas.width = page.getViewport({ scale: 1, }).width;
    
 
    var viewport = page.getViewport({ scale: 1, });
    if(viewport.width > viewport.height){
      var d =  window.innerWidth;
      var scale = d / viewport.width;
      var viewport = page.getViewport({ scale: scale, });
      canvas.height = viewport.height;
      canvas.width = window.innerWidth; 
    }else{
        var d =  window.innerHeight;
        var scale = d / viewport.height;
        var viewport = page.getViewport({ scale: scale, });
        canvas.height = window.innerHeight;
        canvas.width = viewport.width; 
    }

    const renderCtx = {
      canvasContext: ctx,
      viewport
    };

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    // Output current page
   
  });
};

// Check for pages rendering
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

/*END RENDER PDF*/


// Go FullScreen when clicked on the button
const goFullScreen = () => {
    //document.getElementsByTagName("body")[0].requestFullscreen();
    var elem = document.getElementsByTagName("body")[0];
  
    if ( $('#full-screen').text()=="Close"){
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
      return;
    }
  
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
    $('#full-screen').text("Close")
  };

// Close full screen
function closeFullScreen () {
  var elem = document.getElementById("full-screen")
 
  if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement){
    $(elem).text("Full-Screen") 
  }
}

// Listeners on  full screen
document.addEventListener('fullscreenchange', closeFullScreen, false);
document.addEventListener('mozfullscreenchange', closeFullScreen, false);
document.addEventListener('MSFullscreenChange', closeFullScreen, false);
document.addEventListener('webkitfullscreenchange', closeFullScreen, false);
document.querySelector('#full-screen').addEventListener('click', goFullScreen);

var pokemons =  [
  "nes-mario",
  "nes-ash",
  "nes-pokeball",
  "nes-bulbasaur",
  "nes-charmander",
  "nes-squirtle",
  "nes-kirby"]

var mypokemon = 4;

function makepokemon(){
  if(pmode == 0)
  {
    hide =$('#video-balloon').is(':hidden')
    if(!hide){
      updatepokemon(true, pokemons[mypokemon]);
      socket.emit("pokemon",true, pokemons[mypokemon]);
    
    }else {
      updatepokemon(false, pokemons[mypokemon]);
      socket.emit("pokemon",false, pokemons[mypokemon]);
    }
  }
}

function updatepokemon(status, name){
    if(status){
      $('#video-balloon').hide();
      $('#video-avatar').hide();
      $('#pokemon').removeClass();
      $('#pokemon').addClass(name);
      $('#pokemon').show();
    }else {
      $('#video-balloon').show();
      $('#video-avatar').show();
      $('#pokemon').hide()
    }
}

function changepokemon(){
  hide = $('#video-balloon').is(':hidden')
  mypokemon = (mypokemon + 1) % pokemons.length;
  if(pmode == 0 && hide)
  {
    socket.emit("pokemon", true, pokemons[mypokemon]);
    updatepokemon(true, pokemons[mypokemon]);
  }
}

/*CHAT */
var nickname = '';
function showChat(){
  if(nickname == ''){
    $('#dialog-nickname').modal('show')
      $('#enter').click( function()
        { 
          //TODO check the lenght of nickname greater then 0
          nickname =  $('#input-nickname').val();
          if(nickname.length != 0){
            socket.emit("chat-enter", nickname);
           // socket.emit("chat-ask-list");
            hide =$('#chat').is(':hidden')
            if(!hide){
              $("#chat_input").val('');
              $('#chat').hide();
            }else {
              $('#chat').show();
              $("#chat_input").focus();
              $("#chat_input").val('');
              scrollChatList();
            }
          }else {
            $('#dialog-error-nickname').modal('show')
          }
        }
      );
  }else{
    hide =$('#chat').is(':hidden')
    if(!hide){
      $("#chat_input").val('');
      $('#chat').hide();
    }else {
      $('#chat').show();
      $("#chat_input").focus();
      $("#chat_input").val('');
      scrollChatList();
    }
  }
}
function scrollChatList(){
  var wtf    = $('#chat-list');
    var height = wtf[0].scrollHeight;
    wtf.scrollTop(height);
}
function addNewMessage(name, message){
   if($('#chat-list').children().length == 0){
      sside = '-right'
      side = 'from-right toright'
   }else{
      sside = $('#chat-list').children('.message').last().hasClass("-right")? '-left':'-right';
      side = sside == '-left'? 'from-left toleft':'from-right toright';
   }
   ptext = $('<p>', {
    text: name + ": "+ message
   });
   div = $('<div>', {
    class: 'nes-balloon '
   });
   ptext.appendTo(div);
   section = $('<section>', {
    class: 'message '
   }).appendTo('#chat-list');
   div.appendTo(section);
   scrollChatList();
}

var colors =  [
  "#000000", //black
  "#FF0000", //red
  "#008000" //verde
]
var mycolor = 0;

function changeColor(){
  if(pmode == 0) {
    mycolor = (mycolor + 1) % colors.length;
    ctx.strokeStyle = colors[mycolor];
    socket.emit("color", colors[mycolor]);
  }
}

function updateColor(data){
  if(pmode == 1) {
    ctx.strokeStyle = data;
  }
}

var myLineWidth = 1;

function changeLineWidth(){
  if(pmode == 0) {
    myLineWidth = (myLineWidth + 1) % 5;
    ctx.lineWidth = myLineWidth;
    socket.emit("line", myLineWidth);
  }
}

function updateLine(data){
  if(pmode == 1) {
    ctx.lineWidth = data;
  }
}

function initServices(mysocket){

  socket = mysocket;

  $(document).keydown(function(e){
   
    if(e.ctrlKey && e.altKey && e.keyCode == 79){
      showChat();
       //CTRL + ALT + t keydown combo
    }else if(e.ctrlKey && e.altKey && e.keyCode == 80){
      makepokemon();
       //CTRL + ALT + p keydown combo
    }else if(e.ctrlKey && e.altKey && e.keyCode == 77){
      hidecontrol();
       //CTRL + ALT + m keydown combo
    } else if(e.ctrlKey && e.altKey && e.keyCode == 65){
      changepokemon();
       //CTRL + ALT + A keydown combo
    } else if(e.ctrlKey && e.altKey && e.keyCode == 87){
      changeLineWidth();
       //CTRL + ALT + w keydown combo
    } else if(e.ctrlKey && e.altKey && e.keyCode == 81){
      changeColor();
       //CTRL + ALT + q keydown combo
    }
  });
 
  socket.on("chat-list", (list) => {
    if(list == undefined) return;
    $("#ul-users").empty();
    for (var k in list) {
      $("#ul-users").append('<li>'+list[k]+'</li>');
    }
    $("#nusers").text(Object.keys(list).length)
  });
  socket.on("chat-message", (name, message) => {
    addNewMessage(name, message);
  });
  $(document).keyup(function(event) {
    if ($("#chat_input").is(":focus") && event.key == "Enter") {
      message = $("#chat_input").val()
      socket.emit("chat-message", nickname, message);
      $("#chat_input").val('');
      addNewMessage(nickname, message);
    }
  });
}
/*END CHAT */

var mousePressed = false;
var touchPressed = false;
var lastX, lastY;
var socket = undefined;
var pID = window.location.pathname.split('/')[1];
let status = { "nslide":1 };  
let pmode = -1;

function loadStatus(s){
  status = s
  queueRenderPage(s.nslide);
  pageNum = s.nslide
  document.getElementById("progress-bar").setAttribute("value", s.nslide);
}

function initThis(mode, path, slide) {
  pmode = mode;
  if (mode == 1) {
    socket.on( "slidechanged", function (msg) {
      //console.log("Presentation Change "+msg); 
      s = JSON.parse(msg);
      loadStatus(s);
    });
    socket.on( "pokemon", function (status, name) {
      updatepokemon(status,name)
    });
    //shape
    socket.on( "shapechanged", function (msg) {
      //console.log("shape arrived"); 
      s = JSON.parse(msg)
      loadShape(s)
    });
    socket.on("colorchanged", function (data) {
      updateColor(data)
    });
    socket.on("linechanged", function (data) {
      updateLine(data)
    });
  }

  if (mode == 0) {
  document.querySelector('#pdf-render').addEventListener('touchstart', function(e){
    touchPressed = true;
    var x =  e.pageX - $(this).offset().left
    var y =  e.pageY - $(this).offset().top
    Draw(x, y, false);
  });

  document.querySelector('#pdf-render').addEventListener('touchmove', function(e){
    if (touchPressed) {
      var x =  e.pageX - $(this).offset().left
      var y =  e.pageY - $(this).offset().top
      Draw(x, y, true);
      shape['data'].push({"x":x, "y":y});
    }
  });

  document.querySelector('#pdf-render').addEventListener('touchend', function(e){
    touchPressed = false;
    shape = {"data":[], "width":$(window).width() , "height": $(window).height()}
  });

  document.querySelector('#pdf-render').addEventListener('touchcancel', function(e){
    touchPressed = false;
    shape = {"data":[], "width":$(window).width() , "height": $(window).height()}
  });

  $('#pdf-render').mousedown(function (e) {
    mousePressed = true;
    var x =  e.pageX - $(this).offset().left
    var y =  e.pageY - $(this).offset().top
    Draw(x, y, false);
  });

  $('#pdf-render').mousemove(function (e) {
    if (mousePressed) {
      var x =  e.pageX - $(this).offset().left
      var y =  e.pageY - $(this).offset().top
      Draw(x, y, true);
      shape['data'].push({"x":x, "y":y});
    }
  });

  $('#pdf-render').mouseup(function (e) {
      mousePressed = false;
      socket.emit("shape", JSON.stringify(shape), function (data) {      
        console.log('Message shape sent! ');
      });
      shape = {"data":[], "width":$(window).width() , "height": $(window).height()}
  });
  $('#pdf-render').mouseleave(function (e) {
      mousePressed = false;
      socket.emit("shape", JSON.stringify(shape), function (data) {      
        console.log('Message shape sent! ');
      });
      shape = {"data":[], "width":$(window).width() , "height": $(window).height()}
  });

  var shape = {"data":[], "width":$(window).width() , "height": $(window).height()}
}
  // Get Document

  pdfjsLib
  .getDocument(path)
  .promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    document.getElementById("progress-bar").setAttribute("max", pdfDoc.numPages);
    renderPage(slide);
    /*
    $('#info').click( function()
    {
      document.getElementById('dialog-info').showModal();
      //$('#dialog-nickname').modal('show')
    });
    */
  })
  .catch(err => {
    // Display error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);
    // Remove top bar
    document.querySelector('.top-bar').style.display = 'none';
  });

}

/* DRAWING */

function loadShape(s){
  nwidth = $(window).width()
  nheight = $(window).height()
  if (s.data.length == 0) return 
  lastX = (s.data[0].x * nwidth) / s.width;
  lastY = (s.data[0].y * nheight) / s.height;
  for (point in s.data) {
    ctx.beginPath();
    ctx.strokeStyle = $('#selColor').val();
    ctx.lineWidth = $('#selWidth').val();
    ctx.lineJoin = "round";
    ctx.moveTo(lastX, lastY);
    x = (s.data[point].x * nwidth) / s.width;
    y = (s.data[point].y * nheight) / s.height;
    ctx.lineTo(x,y);
    ctx.closePath();
    ctx.stroke();
    lastX = x;
    lastY = y;
    //console.log(nwidth+ " "+nheight+" "+s.width+" "+s.height)
  }
}

function Draw(x, y, isDown) {
  if (isDown) {
      ctx.beginPath();
      ctx.strokeStyle = $('#selColor').val();
      ctx.lineWidth = $('#selWidth').val();
      ctx.lineJoin = "round";
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
  }
  lastX = x; lastY = y;
}
    
function clearArea() {
  // Use the identity matrix while clearing the canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/* END DRAWING */


//creazione della view del sondaggio, sia per il master che client
//var jsonProgressOption={}; //{b1=0,b2=0..} per ogni opzione del sondaggio
var jsonDatiPoll;
function getPollDynamicalMultiple(data,countPeopleInLive){
  
  $("#viewPollDynamical").css("display","inline");
  //console.log("JSON: "+data);
  jsonDatiPoll=JSON.parse(data);

  $("#pollTitleDynamical").text("Poll multiple");

  var pollTitleDynamical=document.getElementById("pollTitleDynamical");

  var textCountPeople=document.createElement("h4");
  textCountPeople.setAttribute("style","text-align:center");
  

  var spanCountPersonAnswer=document.createElement("span");
  spanCountPersonAnswer.setAttribute("id","countPersonAnswered");

  var textSlash=document.createElement("span");
  textSlash.appendChild(document.createTextNode("\\"));

  var spanCountPersonsTotal=document.createElement("span");
  spanCountPersonsTotal.setAttribute("id","countPersonTotal");

  var textPersons=document.createElement("span");
  textPersons.appendChild(document.createTextNode(" persons answered"));

  textCountPeople.appendChild(spanCountPersonAnswer);
  textCountPeople.appendChild(textSlash);
  textCountPeople.appendChild(spanCountPersonsTotal);
  textCountPeople.appendChild(textPersons);

  pollTitleDynamical.appendChild(textCountPeople);

  var pollTable=document.getElementById("pollDynamical");

  var titleQuestion=document.createElement("h4");
  titleQuestion.appendChild(document.createTextNode("Question:"));

  var textQuestion=document.createElement("h4");
  textQuestion.appendChild(document.createTextNode(jsonDatiPoll.namePoll))
  textQuestion.setAttribute("style","margin-bottom:20px");

  pollTable.appendChild(titleQuestion);
  pollTable.appendChild(textQuestion);

  var valuePersonsAnswerTotal=0;

  for(var i=0;i<jsonDatiPoll.optionPoll.length;i++){
    var valore=jsonDatiPoll.optionPoll[i];

    var divProgress=document.createElement("div");
    divProgress.style.position="relative";
    
    var spanProgresso=document.createElement("span");
    spanProgresso.setAttribute("id",`${valore}Span`)

    var stringProgess=`0 persons answered: ${valore}`;
    
    
    var progressBar=document.createElement("progress");
    progressBar.setAttribute("id",valore);
    progressBar.setAttribute("class","nes-progress");
    progressBar.setAttribute("value","0");
    progressBar.setAttribute("max",countPeopleInLive);


    //console.log(jsonDatiPoll);
    // nel caso in cui il master fa aggiornamento della pagina
    if(jsonDatiPoll.valueOption[valore]!=0){
      var valueOption=jsonDatiPoll.valueOption[valore]

      valuePersonsAnswerTotal+=valueOption;

      var stringProgess=`${valueOption} persons answered: ${valore}`;

      progressBar.value=valueOption

      
    }

    spanProgresso.appendChild(document.createTextNode(stringProgess));

    divProgress.appendChild(spanProgresso);
    divProgress.appendChild(progressBar)

    pollTable.appendChild(divProgress);
  } 

  spanCountPersonAnswer.appendChild(document.createTextNode(valuePersonsAnswerTotal));
  spanCountPersonsTotal.appendChild(document.createTextNode(countPeopleInLive));
  
}




function getPollDynamicalRanking(data){
  var countDivSpecificRank=5; // per costruire 4 righe di immagini
  $("#viewPollDynamical").css("display","inline");
  
  jsonDatiPoll=JSON.parse(data);
  console.log(jsonDatiPoll);

  var tableRanking=document.getElementById("pollDynamical");

  $("#pollTitleDynamical").text("Ranking");
  $("#pollTitleDynamical").css("text-align","center");

  var pollTitleDynamical=document.getElementById("pollTitleDynamical");
  
  
  countTagHR=0;
  var valueCountAnswerTotal=0;
  for(var tmp in jsonDatiPoll.questions_rightanswer){

    var divRanking=document.createElement("div");
    divRanking.style.position="relative";

    if(countTagHR==1){
      var hr=document.createElement("hr");
      divRanking.appendChild(hr);
    }

    spanQuestion=document.createElement("span");
    spanQuestion.appendChild(document.createTextNode("Question:"));


    spanTextQuestion=document.createElement("span");
    spanTextQuestion.appendChild(document.createTextNode(jsonDatiPoll.questions_rightanswer[tmp].question));

    divRanking.appendChild(spanQuestion);
    divRanking.appendChild(document.createElement("br"));
    divRanking.appendChild(spanTextQuestion);
    divRanking.appendChild(document.createElement("br"));
  

    var countRow=1; // per costruire le 4 colonne di immagini

    for(var i=1;i<countDivSpecificRank;i++){
      var divSpecificRank=document.createElement("div");
      divSpecificRank.setAttribute("style","margin-top:15px");
      
      
      for(var z=1;z<countRow+1;z++){
        var img=document.createElement("img");
        img.setAttribute("src",`../img/rankIcon/${jsonDatiPoll.questions_rightanswer[tmp].select_rankIMG}.png`);
        img.setAttribute("class","rankIconFinal");

        divSpecificRank.appendChild(img);
        
      }

      var stringID=`${jsonDatiPoll.questions_rightanswer[tmp].select_rank}_${i}`;
      var valueRank=jsonDatiPoll.value_question_rank[stringID];
      valueCountAnswerTotal+=valueRank;

      var spanCountVote=document.createElement("span");
      spanCountVote.setAttribute("class","countVoteRanking");
      spanCountVote.setAttribute("id",`vote_${stringID}`)
      spanCountVote.appendChild(document.createTextNode(valueRank));

      divSpecificRank.appendChild(spanCountVote);

      if(countRow<countDivSpecificRank)
        countRow++;

      divRanking.appendChild(divSpecificRank);
      countTagHR=1; 
    }
    tableRanking.appendChild(divRanking);
  }
}

function updatePollMultipleDynamical(progressId,progressValue,countPersonAnswered){
  document.getElementById("countPersonAnswered").innerHTML=""+countPersonAnswered;

  document.getElementById(`${progressId}`).value=progressValue;
  // document.getElementById(`${progressId}Span`).textContent=progressValue+"%";
  document.getElementById(`${progressId}Span`).innerHTML=`${progressValue} persons answered: ${progressId}`;



}

function updatePollRankingDynamical(jsonVote,callLocal){
  if(callLocal){
    objectVote=jsonVote
  }
  else{
    objectVote=JSON.parse(jsonVote);
  }
  
  for(tmp in objectVote.arrayVote){
    $(`#vote_${objectVote.arrayVote[tmp].id}`).text(objectVote.arrayVote[tmp].vote);
  }
}

function updateVoteMaxPollMultiple(counter){
  document.getElementById("countPersonTotal").innerHTML=""+counter;

  $("progress").map(function(){
    $(this).attr("max",counter);
  });
}