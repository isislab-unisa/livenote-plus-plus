
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
  socket.on("createPollMultiple",(data,countPeople)=>{
    createPollMultiple(data);
    getPollDynamicalMultiple(data,countPeople); 
  });

  socket.on("createPollRanking",(data,countPeopleInLive)=>{
    createPollRanking(data); 
    getPollDynamicalRanking(data,countPeopleInLive); 
  });
  
// Quando un utente partecipa al canale in ritardo o aggiorna la pagina relativa, prende i dati del sondaggio
  socket.on("getPollMultiple",(datePoll,countPeople)=>{
    //getNotice();
    createPollMultiple(datePoll);
    getPollDynamicalMultiple(datePoll,countPeople);
  });


  socket.on("getPollRanking",(data,countPeople)=>{
    createPollRanking(data); 
    getPollDynamicalRanking(data,countPeople); 
  });

  socket.on("closePoll",(typePoll)=>{
    countPersonAnswer=0;
    createNotice(typePoll);
  });

  socket.on("updatingPoll",(optionPoll,countPersonAnswered)=>{
    updatePollOpenDynamical(optionPoll.optionChecked,optionPoll.value,countPersonAnswered);
  });

  socket.on("updatingPollRanking",(vote,countPersonAnswered)=>{
    updatePollRankingDynamical(vote,countPersonAnswered);
  });

  initServices(socket);

}

// Crea il sondaggio a risposte multiple
function createPollMultiple(data){
  //visualizzo il bottone sondaggio
  
  $("#click-poll").css("display", "inline");

  $("#sendVotePoll").html("Send");

  cleanPoll();

  //creazione titolo sondaggio
  var jsonData=JSON.parse(data);

  $("#titlePoll").text(jsonData.namePoll);
  $("#titlePoll").css("text-align","start");

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
  
  $("#sendVotePoll").html("Send");

  var jsonDate=JSON.parse(date);

  $("#titlePoll").text("Select a rank");
  $("#titlePoll").css("text-align","center");

  cleanPoll();

  var tableOptionPoll=document.getElementById("pollsTable");
  var countHR=0;
  for(var tmp in jsonDate.questions_rightanswer){

    if(countHR==1){
      var hr=document.createElement("hr");
      tableOptionPoll.appendChild(hr);
    }

    var spanQuestionText=document.createElement("h4");
    spanQuestionText.appendChild(document.createTextNode("Question:"));
    spanQuestionText.setAttribute("class","questionRanking");

    var spanQuestion=document.createElement("span");
    spanQuestion.appendChild(document.createTextNode(`${jsonDate.questions_rightanswer[tmp].question}`));

    tableOptionPoll.appendChild(spanQuestionText); 
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

      countHR=1;
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

  document.getElementById("click-poll").style.display="none";
  socket.emit("updatingPollRanking",arrayValueRank);
};


const video = document.querySelector("video");

function cleanPoll(){
  $("#pollsTable").empty();
  $("#pollDynamical").empty();
}

function createNotice(typePoll){
  document.getElementById("viewPollDynamical").style.display="none";
  document.getElementById("click-poll").style.display="none";
  var button=document.querySelector("#sendVotePoll");
  button.innerHTML="OK";

  console.log("tipo:"+typePoll);

  if(typePoll==1){
    button.removeEventListener("click",sendVotePollRanking);
  }
  else if(typePoll==0){
    button.removeEventListener("click",sendVotePollMultiple);
  }

  cleanPoll();

  var pollsTable=document.getElementById("pollsTable");
  var pollDynamical=document.getElementById("pollDynamical");

  var notice=document.createElement("h4");
  notice.setAttribute("class","nes-text is-error");
  notice.appendChild(document.createTextNode("The poll is closed. Click OK"))

  var noticeAnother=document.createElement("h4");
  noticeAnother.setAttribute("class","nes-text is-error");
  noticeAnother.appendChild(document.createTextNode("The poll is closed. Click X"))

  pollsTable.appendChild(notice);
  pollDynamical.appendChild(noticeAnother);
}


window.onunload = window.onbeforeunload = () => {
  socket.close();
};


