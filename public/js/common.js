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
    var viewport = page.getViewport({scale: scale,});
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // risoluzione del tablet in modalità landscape
    if(window.innerWidth>=768 && window.innerWidth<=1366 && window.matchMedia("(orientation: landscape)").matches) {  
      var viewport = page.getViewport({scale: scale/1.23,});
      canvas.height = viewport.height;
      canvas.width = viewport.width;
    }
    /* OLD math calculation

    canvas.height = window.innerHeight;
    canvas.width = viewport.width;
    var viewport = page.getViewport({ scale: 1, });
    if(viewport.width > viewport.height){
      var d =  window.innerWidth;
      var scale = d/viewport.width;
      var viewport = page.getViewport({ scale: scale, });
      canvas.height = viewport.height;
      canvas.width = window.innerWidth;
    }else{
        var d =  window.innerHeight;
        var scale = d / viewport.height;
        var viewport = page.getViewport({ scale: scale, });
        canvas.height =window.innerHeight;
        canvas.width = viewport.width;
    }
    */

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

var booleanBlack=false;
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

      booleanBlack=false;
      changeNavbarInWhite();
      changeSidebarChatInWhite();
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
    booleanBlack=true;
    changeNavbarInBlack();
    changeSidebarChatInBlack();

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

var player;

// manage the creation of Youtube video Iframe
function loadVideoYt(){
  //console.log("carico il video");
    // Load the IFrame Player API code asynchronously.
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var wid = window.innerWidth/2;
    var hei = window.innerHeight/2;

    if(pmode==0){
      ytid = getLinkYoutube();
      //$('#input-ytvideo').val();
      if (ytid.length != 0) {
        // Replace the 'ytplayer' element with an <iframe> and
        // YouTube player after the API code downloads.
        socket.emit("ytvid", ytid);
        onYouTubePlayerAPIReady();
          
      
        function onYouTubePlayerAPIReady() {
          player = new window.YT.Player('ytplayer', {
            height: hei,
            width: wid,
            videoId: ytid,
            playerVars: {
              enablejsapi: 1,
              rel: 0,
              modestbranding: 1,
              origin: 'https://isiswork00.di.unisa.it/',
            },
            events: {
              'onStateChange': onPlayerStateChange
            }
          });
        }
        
        $("#mySidenav").removeClass("animation");
        $("#ytframe").css("display","inline-block");
        $("#handle").show();
        // $('#deleteYT').show()
      }
    } else {
      if (ytiden.length != 0) {
        onYouTubePlayerAPIReady();
    
        function onYouTubePlayerAPIReady() {
          player = new window.YT.Player('ytplayer', {
            height: hei,
            width: wid,
            videoId: ytiden,
            playerVars: {
              disablekb: 1,
              controls: 0,
              enablejsapi: 1,
              rel: 0,
              modestbranding: 1,
              origin: 'https://isiswork00.di.unisa.it/',
            },
            events: {
              'onStateChange': onPlayerStateChange
            }
          });
        }
        $("#ytframe").css("display","inline-grid");
        $("#handle").show();
      }
    }

    //here jquery
    //$("#ytframe").width(wid);
    //$("#ytframe").heigth(hei);


    /* work in progress */
    function onPlayerStateChange(event) {
      if (pmode==0) {
        var second;
        if (event.data == YT.PlayerState.PLAYING) {
          second = event.target.getCurrentTime();
          socket.emit("yt_start", second);
          //player.stopVideo();
        } else if (event.data == YT.PlayerState.PAUSED){
          second = event.target.getCurrentTime();
          socket.emit("yt_stop", second);
          //player.playVideo();
        }
      }
    }
}

// Delete youtube video
if (document.getElementById("trashYT") != undefined )
  document.getElementById("trashYT").addEventListener('click', function(event){
    player.destroy();
    socket.emit("yt_destroy", true);
    $('#ytframe').hide()
    // $('#deleteYT').hide()
    $("#handle").hide();
  });

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


    var divNavbar=document.createElement("div");
    divNavbar.setAttribute("class","divNavbar");
    divNavbar.setAttribute("onclick","changeAvatarNavbar()");
    divNavbar.setAttribute("id","changeAvatar");

    var text=document.createElement("span");
    text.setAttribute("class","textNavbar");
    text.appendChild(document.createTextNode("Change avatar"));

    divNavbar.appendChild(text);

    $(divNavbar).insertAfter('#startlive');
    
    }else {
      updatepokemon(false, pokemons[mypokemon]);
      socket.emit("pokemon",false, pokemons[mypokemon]);

      $('#changeAvatar').remove();
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
          var resBoolean=validateNickname();
          if(resBoolean){
            $('#dialog-nickname').modal("hide");
            socket.emit("chat-enter", nickname);
           // socket.emit("chat-ask-list");
            // hide =$('#chat').is(':hidden')
            if(!$("#mysidenavChat").width()==0){
              $("#chatLogo").attr("src","../img/chat.png");

              if( window.innerHeight>320 && window.innerWidth<479 ){
                $("#mysidenavChat").css({
                  width            : "0%",
                  right            : "-3%"
                  });
                 
              }else{
                $("#mysidenavChat").css({
                  width            : "0%",
                  right            : "-1%"
                });

                $("#progress-bar").css("margin-left","0%");
                $("#next-page").css("margin-right","0.5%");
                $("#pdf-render").css("margin-left","0%");
                $("#container").css("margin-right","0px");
              }
              $("#chat-input").val('');
            }else {

              $("#chatLogo").attr("src","../img/close.png");

              if(window.innerWidth<479 && window.innerHeight>320){
                $("#mysidenavChat").css({
                  width            : "100%",
                  right            : "0%"
                  });

              }
              else{
                $("#mysidenavChat").css({
                width            : "23%",
                right            : "0%"
                });
               

              $("#progress-bar").css("margin-left","-11%");
              $("#next-page").css("margin-right","23.5%");
              $("#pdf-render").css("margin-left","-12%");
              $("#container").css("margin-right","23%");         
              

              
              }
              scrollChatList();
            }
          }
        }
      );
  }else{

    if(!($("#mysidenavChat").width()==0)){
      $("#chatLogo").attr("src","../img/chat.png");
      
      if(window.innerWidth<479 && window.innerHeight>320){
        $("#mysidenavChat").css({
          width            : "0%",
          right            : "-3%"
        });
      }else{
          $("#mysidenavChat").css({
            width            : "0%",
            right            : "-1%"
          });

        $("#progress-bar").css("margin-left","0%");  
        $("#next-page").css("margin-right","0.5%");
        $("#pdf-render").css("margin-left","0%");
        $("#container").css("margin-right","0px");
      }
      $("#chat-input").val('');
    }else {
      $("#chatLogo").attr("src","../img/close.png");
      if(window.innerWidth<479 && window.innerHeight>320){
        $("#mysidenavChat").css({
          width            : "100%",
          right            : "0%"
          });

      }else{
        $("#mysidenavChat").css({
        width            : "23%",
        right            : "0%"
        });

      $("#progress-bar").css("margin-left","-11%");
      $("#next-page").css("margin-right","23.5%");
      $("#pdf-render").css("margin-left","-12%");
      $("#container").css("margin-right","23%");      
      // $('#chat').show();
      $("#chat-input").focus();
      $("#chat-input").val('');
      // scrollChatList();
      }
    }
  }
}

function scrollChatList(){
  var wtf    = $('#chat-list');
    var height = wtf[0].scrollHeight;
    wtf.scrollTop(height);
}

var colorTMP=getRandomColor();
var color;
function addNewMessage(name, message,mode,colorFrom){
  var colorBalloon="";
    if(booleanBlack)
      colorBalloon="is-dark";
  
   if(mode==1){ // When the attribute mode is equal one, it means that the box balloon will position at the right of chat list. Otherwise, at the left of chat list
    sectionPosition = '-right';
    divPosition = 'from-right';
    color=colorTMP;
    //console.log("il master ha il colore: "+ color);
   }else if(mode==0){
      sectionPosition='-left';
      divPosition='from-left';
      color=colorFrom;
      //console.log("il slave ha il colore: "+ color);
      // sside = $('#chat-list').children('.message').last().hasClass("-right")? '-left':'-right';
      // side = sside == '-left'? 'from-left':'from-right';
   }
   pNametext = $('<p>', {
    text: name,
    class: 'message_p',
    style: "color:"+color
   });
   pText=$('<p>', {
    text: message,
    class: 'message_p',
   });
   div = $('<div>', {
    class: 'nes-balloon '+ divPosition +" " + colorBalloon
   });
   pNametext.appendTo(div);
   pText.appendTo(div);
   section = $('<section>', {
    class: 'message '+ sectionPosition 
   }).appendTo('#chat-list');
   div.appendTo(section);
   scrollChatList();
}

var colors =  [
  "#000000", //black
  "#FF0000", //red
  "#008000" //green
]
var mycolor = 0;

function changeColor(){
  if(pmode == 0) {
    mycolor = (mycolor + 1) % colors.length;
    ctx.strokeStyle = colors[mycolor];
    socket.emit("color", colors[mycolor]);
    return colors[mycolor];
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
    if(myLineWidth==0)
      myLineWidth=5;
    ctx.lineWidth = myLineWidth;
    socket.emit("line", myLineWidth);
    return myLineWidth;
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

  socket.on("chat-message", (name, message,mode,color) => {
    addNewMessage(name, message,mode,color);
  });

  $("#chat-input").keyup(function(event) {
    if ($("#chat-input").is(":focus") && event.key == "Enter") {
      //console.log($("#chat-input").val());
      if(!($("#chat-input").val()==="\n")){
        message = $("#chat-input").val()
        $("#chat-input").val('');
        socket.emit("chat-message", nickname, message,0,colorTMP);
        //console.log("mando il colore: " + colorTMP);
        addNewMessage(nickname, message,1,colorTMP);
      }
      $("#chat-input").val('');
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
var ytiden;

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
    socket.on( "ytvideoid", function (id) {
      //console.log(id)
      ytiden = id;
      loadVideoYt();
    });
    socket.on("ytstarting", function (data) {
      player.seekTo(data, true);
      player.playVideo();
    });
    socket.on("ytstopping", function (data) {
      player.seekTo(data, true);
      player.pauseVideo();
    });
    socket.on("ytdestroying", function (data) {
      //console.log("DISTRUGGERE")
      player.destroy();
      $("#ytframe").hide();
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
        //console.log('Message shape sent! ');
      });
      shape = {"data":[], "width":$(window).width() , "height": $(window).height()}
  });
  $('#pdf-render').mouseleave(function (e) {
      mousePressed = false;
      socket.emit("shape", JSON.stringify(shape), function (data) {      
        //console.log('Message shape sent! ');
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
  //console.log(jsonDatiPoll);

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

function changeNavbarInBlack(){
  $(".sidenav").attr("class","sidenavBlack");
  $("#titleNavbar").css("color","white");
}

function changeNavbarInWhite(){
  $(".sidenavBlack").attr("class","sidenav");
  $("#titleNavbar").css("color","black");
}

function changeSidebarChatInWhite(){
  $("#mysidenavChat").css({
    "background-color":"silver",
    "border-color" : "black"
  });

  $(".nes-balloon").each(function(){
    $(this).removeClass("is-dark");
  });

  $("#chat-input").attr("class","nes-textarea");
}

function changeSidebarChatInBlack(){
  $("#mysidenavChat").css({
    "background-color":"#212529",
    "border-color" : "#636363"
  });

  $(".nes-balloon").each(function(){
    $(this).addClass("is-dark");
  });

  $("#chat-input").attr("class","nes-textarea is-dark");
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function validateNickname(){
  var res=true;
  nickname=$("#input-nickname").val();
  if(nickname===""){
    $("#input-nickname").addClass("is-error");
    $("#input-nickname").next().css("display","block");
    res=false;
  }
  else if($("#input-nickname").hasClass("is-error")){
    $("#input-nickname").removeClass("is-error").next().hide();
  }
  return res;
}

function getLinkYoutube(){
  var linkYoutube=$('#input-ytvideo').val();

  var countStart=linkYoutube.indexOf("=")+1;
  var countEnd=linkYoutube.indexOf("&");
  
  if(countEnd!=-1){
    return linkYoutube.substring(countStart,countEnd);
  }
  else{
    return linkYoutube.substr(countStart);
  }
}