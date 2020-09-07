
function hidecontrol(){
  $(".control").each(function (index, element) {
    hide = $(element).is(':hidden');
    if(!hide){
      $(element).hide()     
    }else {
      $(element).show()
    }
});
}

function loadStatus(s){
  status = s
  queueRenderPage(s.nslide);
  pageNum = s.nslide
  document.getElementById("progress-bar").setAttribute("value", s.nslide);
}

/*AUDIO VIDEO */
let peerConnection;
const config = {
  iceServers: [
    {
      urls: [
      "stun:isiswork01.di.unisa.it"]
    }
  ]
};

var socket;
function initclient(namespace) {
  socket = io.connect(window.location.origin+namespace, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: 99999
  });
  socket.on( "slidechanged", function (msg) {
    console.log("Presentation Change "+msg); 
    s = JSON.parse(msg)
    loadStatus(s);
  });
  socket.on( "pokemon-update", function (status, name) {
    updatepokemon(status,name)
  });  
  //TODO BUG quando un client si collega se il video è in modalità pokemon può vederlo, lo stesso, quando si collega deve chiedere il permesso del video

  socket.on("offer", (id, description) => {
    console.log(id)
    console.log(description)
    
    peerConnection = new RTCPeerConnection(config);
    peerConnection
      .setRemoteDescription(description)
      .then(() => peerConnection.createAnswer())
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        $('#liveperson').show();
        socket.emit("answer", id, peerConnection.localDescription);
      });
    peerConnection.ontrack = event => {
      video.srcObject = event.streams[0];
    };
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };
  });
  socket.on("candidate", (id, candidate) => {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch(e => console.error(e));
  });
  
  socket.on("connect", () => {
    socket.emit("watcher");
  });
  
  socket.on("broadcaster", () => {
    socket.emit("watcher");
  });
  
  socket.on("disconnectPeer", () => {
    peerConnection.close();
  });

  
  //Get aggiornamento sondaggio
  socket.on("pollMultiple",(data)=>{
    createPollMultiple(data);
    getPollDynamicalMultiple(data); 
  });

  socket.on("createPollRanking",(data)=>{
    createPollRanking(data); 
    getPollDynamicalRanking(data); 
  });
  
// Quando un utente partecipa al canale in ritardo, prende i dati del sondaggio
  socket.on("getPollMultiple",(datePoll,countPeople)=>{
    //getNotice();
    createPollMultiple(datePoll);
    getPollDynamicalMultiple(datePoll,countPeople);
  });

  socket.on("closePoll",()=>{
    document.getElementById("viewPollDynamical").style.display="none";
    document.getElementById("click-poll").style.display="none";

    $("#pollsTable").empty();
    $("#pollDynamical").empty();
  });

  socket.on("updatingPoll",(optionPoll)=>{
    updatePollDynamical(optionPoll.optionChecked,optionPoll.value);
  });

  socket.on("updatingPollRanking",(vote)=>{
    updatePollRankingDynamical(vote);
  });

  initServices(socket);

}

// Crea il sondaggio a risposte multiple
function createPollMultiple(data){
  //visualizzo il bottone sondaggio
  
  $("#click-poll").css("display", "inline");

  //creazione titolo sondaggio
  var jsonData=JSON.parse(data);
  $("#titlePoll").text(jsonData.namePoll);

  //Creazione opzioni del sondaggio in base al messaggio JSON ricevuto
  var tableOptionPoll=document.getElementById("pollsTable");
  
  var someQuestionsH5=document.createElement("h5");
  someQuestionsH5.appendChild(document.createTextNode("Click one of these options"));
  someQuestionsH5.setAttribute("style","margin:2%");
  
  tableOptionPoll.appendChild(someQuestionsH5);
  for(var i=0;i<jsonData.optionPoll.length;i++){
    var label=document.createElement("label");
    label.setAttribute("class","labelOption");

    var radioOption=document.createElement("input");
    radioOption.setAttribute("type","radio");
    radioOption.setAttribute("name","option");
    radioOption.setAttribute("value",`${jsonData.optionPoll[i]}`);
    radioOption.setAttribute("class","nes-radio");
    
    var spanOption=document.createElement("span");
    var text=document.createTextNode(jsonData.optionPoll[i]);
    spanOption.appendChild(text);

    label.appendChild(radioOption);
    label.appendChild(spanOption);

    var brTag=document.createElement("br");

    tableOptionPoll.appendChild(label);
    tableOptionPoll.appendChild(brTag);

    document.getElementById("sendVotePoll").addEventListener("click", sendVotePollMultiple);
  }
}

// Crea il sondaggio a tema ranking
function createPollRanking(date){
  $("#click-poll").css("display", "inline");
  
  var jsonDate=JSON.parse(date);

  var tableOptionPoll=document.getElementById("pollsTable");

  for(var tmp in jsonDate.questions_rightanswer){
    // var spanQuestionText=document.createElement("span");
    // spanQuestionText.appendChild(document.createTextNode("Question:"));

    var spanQuestion=document.createElement("span");
    spanQuestion.appendChild(document.createTextNode(`${jsonDate.questions_rightanswer[tmp].question}`));

    tableOptionPoll.appendChild(spanQuestion);
    tableOptionPoll.appendChild(document.createElement("br"));

    var divRank=document.createElement("div");
    divRank.setAttribute("class","div-ranking");

    for(var i=4;i>0;i--){
      
      
      var radioRank=document.createElement("input");
      var label=document.createElement("label");

      radioRank.setAttribute("type","radio");
      radioRank.setAttribute("name","rank"+jsonDate.questions_rightanswer[tmp].select_rank);
      radioRank.setAttribute("id",`${jsonDate.questions_rightanswer[tmp].select_rank}_${i}`);
      radioRank.setAttribute("value",`${jsonDate.questions_rightanswer[tmp].select_rank}_${i}`);
      radioRank.setAttribute("style","-webkit-appearance: none;");

      label.setAttribute("for",`${jsonDate.questions_rightanswer[tmp].select_rank}_${i}`);


      var img=document.createElement("img");
      img.setAttribute("src",`../img/rankIcon/${jsonDate.questions_rightanswer[tmp].select_rankIMG}.png`);
      img.setAttribute("class","rankIcon");

      label.appendChild(img);
      
      divRank.appendChild(radioRank);
      divRank.appendChild(label);
      
      tableOptionPoll.appendChild(divRank);
    }

    
    

    document.getElementById("sendVotePoll").addEventListener("click",sendVotePollRanking);

  }
}

function sendVotePollMultiple(){
  var optionChecked=$("#pollsTable input[type='radio']:checked").val();
  socket.emit("updatingPoll",optionChecked);

  document.getElementById("click-poll").style.display="none";
};

function sendVotePollRanking(){
  var arrayValueRank=[];

  $(".div-ranking").map(function(){
    var valueSelectRank=$(this).children('input[type=radio]:checked').attr("value");
    arrayValueRank.push(valueSelectRank);
  });

  // $('input[name="pollAnswer"]').map(function(){
  //   var valueAnswer=this.value;
  //   var rightAnswer=this.nextSibling.value;
  //   alert(ignoreCase.equals(valueAnswer,rightAnswer));
  // });

  document.getElementById("click-poll").style.display="none";
  socket.emit("updatingPollRanking",arrayValueRank);
};


const video = document.querySelector("video");

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

/*function getNotice(){
  document.getElementById("notice").style.display="block";

  $("#closeNotice").click(function(){
    document.getElementById("notice").style.display="none";
  });
}*/


