
function hidecontrol(){
  $(".control").each(function (index, element) {
    hide = $(element).is(':hidden');

    if($(element).attr('id') =="select-audio" || $(element).attr('id') =="select-video")
    {
      if($("#startlive").hasClass('nes-logo')){
        $(element).hide()     
      }
    } else{
      if(!hide){
        $(element).hide()     
      }else {
        $(element).show()
      }
    }
  });
}

// Show Prev Page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  (pmode == 0) && sendMasterStatus(pageNum);
  queueRenderPage(pageNum);
  document.getElementById("progress-bar").setAttribute("value", pageNum);
};

// Show Next Page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  (pmode == 0) && sendMasterStatus(pageNum);
  queueRenderPage(pageNum);
  document.getElementById("progress-bar").setAttribute("value", pageNum);

};

function sendMasterStatus(pageNum){
  status.nslide = pageNum;
  console.log(socket);
  socket.emit("master", JSON.stringify(status), function (data) {      
    console.log('Message next page sent! '+ status.nslide);
  }); 
}

//switch page with arrow keys
document.onkeydown = function(e) {
  switch (e.keyCode) {
    //left arrow
    case 37:
      showPrevPage();
      break;
    //up arrow
    case 38:
      break;
    //right arrow
    case 39:
      showNextPage();
      break;
    //down arrow
    case 40:
      break;
  }
}

// Button Events
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);

document.querySelector("#addOptionMultiple").addEventListener("click",addOptionMultiple);

function loadStatus(s){
  status = s
  queueRenderPage(s.nslide);
}

/*AUDIO VIDEO*/
const peerConnections = {};
const config = {
  iceServers: [
    {
      urls: [
      "stun:isiswork01.di.unisa.it"]
    }
  ]
};

window.onunload = window.onbeforeunload = () => {
  console.log("Close socket")
  socket.close();
};

if (document.getElementById("video") != undefined )
document.getElementById("video").addEventListener('click', function(event){
//<img src="https://img.icons8.com/color/48/000000/record.png"/>  
//<img src="https://img.icons8.com/color/48/000000/stop.png"/>   
});
if (document.getElementById("audio") != undefined )
document.getElementById("audio").addEventListener('click', function(event){
//https://img.icons8.com/color/48/000000/play-record.png
//<img src="https://img.icons8.com/color/48/000000/block-microphone.png"/>  
});

var socket;

function initmaster(namespace){
  console.log("Connect to "+window.location.origin+namespace)
  socket = io.connect(window.location.origin+namespace, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: 99999
  });

  socket.on("answer", (id, description) => {
    peerConnections[id].setRemoteDescription(description);
  });
  
  socket.on("watcher", id => {
    const peerConnection = new RTCPeerConnection(config);
    peerConnections[id] = peerConnection;
  
    let stream = videoElement.srcObject;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };
  
    peerConnection
      .createOffer()
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("offer", id, peerConnection.localDescription);
      });
  });
  
  socket.on("candidate", (id, candidate) => {
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  });
  
  socket.on("disconnectPeer", id => {
    peerConnections[id].close();
    delete peerConnections[id];
  });

  // se il master aggiorna la relativa pagina, controlla se il sondaggio è stato creato. In caso
  // affermativo il pulsante click poll viene nascosto e messo in vista la view poll
  socket.on("getPollMultiple",(datePoll,countPeople)=>{
    hideBottonCreatePoll();
    getPollDynamicalMultiple(datePoll,countPeople);
  });

  
  
  //aggiornamento sondaggio 
  socket.on("updatingPoll",(optionPoll)=>{
  updatePollDynamical(optionPoll.optionChecked,optionPoll.value);
  });

  socket.on("updatingPollRanking",(vote)=>{
    updatePollRankingDynamical(vote);
  });

    // Get camera and microphone
  const videoElement = document.querySelector("video");
  const audioSelect = document.querySelector("select#audioSource");
  const videoSelect = document.querySelector("select#videoSource");

  audioSelect.onchange = getStream;
  videoSelect.onchange = getStream;

    function gotDevices(deviceInfos) {
      window.deviceInfos = deviceInfos;
      for (const deviceInfo of deviceInfos) {
        const option = document.createElement("option");
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === "audioinput") {
          option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
          audioSelect.appendChild(option);
        } else if (deviceInfo.kind === "videoinput") {
          option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
          videoSelect.appendChild(option);
        }
      }
    }
    
    function getStream() {
      if (window.stream) {
        window.stream.getTracks().forEach(track => {
          track.stop();
        });
      }
      const audioSource = audioSelect.value;
      const videoSource = videoSelect.value;
      const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
        video: { deviceId: videoSource ? { exact: videoSource } : undefined }
      };
      return navigator.mediaDevices
        .getUserMedia(constraints)
        .then(gotStream)
        .catch(handleError);
    }
    
    function gotStream(stream) {
      window.stream = stream;
      audioSelect.selectedIndex = [...audioSelect.options].findIndex(
        option => option.text === stream.getAudioTracks()[0].label
      );
      videoSelect.selectedIndex = [...videoSelect.options].findIndex(
        option => option.text === stream.getVideoTracks()[0].label
      );
      videoElement.srcObject = stream;
      socket.emit("broadcaster");
    }
  
   
    function handleError(error) {
      console.error("Error: ", error);
    }

    function startLive(){
      var dial = document.getElementById('dialog-play')
      if (typeof dial.showModal === "function") {
        dial.showModal();
      } else {
        alert("The <dialog> API is not supported by this browser");
      }
      //document.getElementById('dialog-play').showModal();
          $('#play').click( function()
            { 
              getStream()
              .then(getDevices)
              .then(gotDevices);
              function getDevices() {
                $('#startlive').removeClass("nes-logo");
                $('#liveperson').show();
                $('#select-audio').show();
                $('#select-video').show();
               
               // $('#startlive').addClass("nes-mario");
                return navigator.mediaDevices.enumerateDevices();
              }
            }
          );
    }
    $('#startlive').click( function()
    {
      startLive();
    });
    
    $(document).keydown(function(e){
      if(e.ctrlKey && e.altKey && e.keyCode == 76){
        startLive();
         //CTRL + ALT + l keydown combo
      }
    });
    initServices(socket);

    

    

    // manda il sondagggio ai slave quando il master clicca il bottone send poll
    $('#createPoll').click(function(){
      $("#create-poll").css("display","none");      

      if($('input[name="choicePoll"]:checked').val()=="multiple")
        createJSONPollMultiple();
      else
        createJSONRanking();
    });

    $("#close-poll").click(function(){
      document.getElementById("create-poll").style.display="inline";
      document.getElementById("viewPollDynamical").style.display="none";

      $("#pollDynamical").empty();

      socket.emit("closePoll");
    });

}

function hideBottonCreatePoll(){
  document.getElementById("create-poll").style.display="none";
}

function deleteOption(element){
  var testo=element.id+"DIV";

  var divOptionRemove=document.getElementById(`${testo}`);

  divOptionRemove.remove();
}


function changeQuestions(element){
  var question=element.value;

  if(question=="raking"){
    idOption=1;
    createRaking();
  }
  else if(question=="multiple"){
    idOption=1;
    createMultipleQuestions();
  }
}

//Crea sondaggi a risposte multiple
function createMultipleQuestions(){
  var divOptionPoll=document.getElementById("sondaggio");

  while(divOptionPoll.lastElementChild){
    divOptionPoll.removeChild(divOptionPoll.lastElementChild);
  }
  
  var titleQuestion=document.createElement("h5");
  titleQuestion.setAttribute("class","modal-title");
  titleQuestion.setAttribute("style","style='text-align: center;'");
  var textQuestion=document.createTextNode("Create a question");
  titleQuestion.appendChild(textQuestion);

  var inputQuestion=document.createElement("input");
  inputQuestion.setAttribute("type","text");
  inputQuestion.setAttribute("class","nes-input");
  inputQuestion.setAttribute("name","namePoll");
  inputQuestion.setAttribute("placeholder","Insert a question");
  
  var hrTag=document.createElement("hr");

  var titleOption=document.createElement("h5");
  titleOption.setAttribute("class","modal-title");
  titleOption.setAttribute("style","style='text-align: center;'");
  var textOption=document.createTextNode("Create some options");
  titleOption.appendChild(textOption);



  var divDeletePoll=document.createElement("div");
  divDeletePoll.setAttribute("class","div-delete-option");
  divDeletePoll.setAttribute("id","option1DIV");

  var inputOptionPoll=document.createElement("input");
  inputOptionPoll.setAttribute("type","text");
  inputOptionPoll.setAttribute("name","pollOption");
  inputOptionPoll.setAttribute("class","nes-input");
  inputOptionPoll.setAttribute("placeholder","Insert an option");


  var brTag=document.createElement("br");

  var buttonAdd=document.createElement("button");
  buttonAdd.setAttribute("type","button");
  buttonAdd.setAttribute("class","nes-btn");
  buttonAdd.setAttribute("id","addOptionMultiple");

  var textNode=document.createTextNode("Add an option");

  buttonAdd.addEventListener("click",addOptionMultiple);

  buttonAdd.appendChild(textNode);

  divDeletePoll.appendChild(inputOptionPoll);

  divOptionPoll.appendChild(titleQuestion);
  divOptionPoll.appendChild(inputQuestion);
  divOptionPoll.appendChild(hrTag);
  divOptionPoll.appendChild(titleOption);

  divOptionPoll.appendChild(divDeletePoll);
  divOptionPoll.appendChild(brTag);
  divOptionPoll.appendChild(buttonAdd);
}

// Crea sondaggi a risposte aperte
function createRaking(){
  var divOptionPoll=document.getElementById("sondaggio");

  while(divOptionPoll.lastElementChild){
    divOptionPoll.removeChild(divOptionPoll.lastElementChild);
  }
  
  
  var divDeletePoll=document.createElement("div");
  divDeletePoll.setAttribute("class","div-delete-option");
  divDeletePoll.setAttribute("id","option1DIV");

  var titleCreateQuestion=document.createElement("h5");
  titleCreateQuestion.appendChild(document.createTextNode("Create a question"));
  
  var inputQuestionPoll=document.createElement("input");
  inputQuestionPoll.setAttribute("type","text");
  inputQuestionPoll.setAttribute("name","pollQuestion");
  inputQuestionPoll.setAttribute("class","nes-input");
  inputQuestionPoll.setAttribute("placeholder","Insert a question");

  var brTag=document.createElement("br");

  var titleRank=document.createElement("h5");
  titleRank.appendChild(document.createTextNode("Select a rank"));

  var containerSelectRank=document.createElement("div");
  containerSelectRank.setAttribute("class","container-select nes-input");

  for(i=1;i<5;i++){
    var label=document.createElement("label");
    var radioRank=document.createElement("input");
    radioRank.setAttribute("type","radio");
    radioRank.setAttribute("name","rank1");
    radioRank.setAttribute("value","rankIMG"+i)
    radioRank.setAttribute("style","-webkit-appearance: none;")

    var img=document.createElement("img");
    img.setAttribute("src",`../img/rankIcon/rankIMG${i}.png`);
    img.setAttribute("class","rankIcon");

    label.appendChild(radioRank);
    label.appendChild(img);
    

    containerSelectRank.appendChild(label);
  }
  var buttonAdd=document.createElement("button");
  buttonAdd.setAttribute("type","button");
  buttonAdd.setAttribute("class","nes-btn");
  buttonAdd.setAttribute("id","addQuestionRank");
  buttonAdd.addEventListener("click",addQuestionRank);
  buttonAdd.appendChild(document.createTextNode("Add a question"));

  
  divDeletePoll.appendChild(titleCreateQuestion);
  divDeletePoll.appendChild(inputQuestionPoll);
  divDeletePoll.appendChild(brTag);
  divDeletePoll.appendChild(titleRank);
  divDeletePoll.appendChild(containerSelectRank);

  
  divOptionPoll.appendChild(divDeletePoll);
  divOptionPoll.appendChild(brTag);
  divOptionPoll.appendChild(buttonAdd);

  $("input[name='rank1']").click(function(){
    this.nextSibling.style.opacity=1;
  });
}

//creazione del sondaggio con risposte multiple
var idOption=1; // attributo che serve a settare l'id dei div all'interno del Dialog. Cosi sappiamo esattamente quale il master vuole eliminare una opzione
function addOptionMultiple(){
  //$('#sondaggio').append('<input type="text" class="nes-input" placeholder="insert an option"/>');
  var listInput=document.getElementById("sondaggio");

  idOption++;

  var divInput=document.createElement("div");
  divInput.setAttribute("class","div-delete-option");
  divInput.setAttribute("id",`option${idOption}DIV`);

  var input=document.createElement("input");
  input.setAttribute("type","text");
  input.setAttribute("name","pollOption");
  input.setAttribute("placeholder","Insert an option");
  input.setAttribute("class","nes-input");

  var iconX=document.createElement("i");
  iconX.setAttribute("class","delete-option-multiple nes-icon close is-small");
  iconX.setAttribute("id",`option${idOption}`);
  iconX.setAttribute("onclick","deleteOption(this)");
  

  divInput.appendChild(input);
  divInput.appendChild(iconX);

  listInput.insertBefore(divInput,listInput.childNodes[listInput.childNodes.length-2]);      
};

//creazione del sondaggio con risposte aperte
function addQuestionRank(){
  
  //$('#sondaggio').append('<input type="text" class="nes-input" placeholder="insert an option"/>');
  var listInput=document.getElementById("sondaggio");

  idOption++;

  var divInput=document.createElement("div");
  divInput.setAttribute("class","div-delete-option");
  divInput.setAttribute("id",`option${idOption}DIV`);

  var titleCreateQuestion=document.createElement("h5");
  var textCreateQuestion=document.createTextNode("Create a question");
  titleCreateQuestion.appendChild(textCreateQuestion);

  var inputQuestion=document.createElement("input");
  inputQuestion.setAttribute("type","text");
  inputQuestion.setAttribute("name",`pollQuestion`);
  inputQuestion.setAttribute("placeholder","Insert a question");
  inputQuestion.setAttribute("class","nes-input");

  var brTag1=document.createElement("br");

  var spanRank=document.createElement("span");
  spanRank.appendChild(document.createTextNode("Select a rank"));
  
  var brTag2=document.createElement("br");

  var containerSelectRank=document.createElement("div");
  containerSelectRank.setAttribute("class","container-select nes-input");

  for(var i=1;i<5;i++){
    var label=document.createElement("label");
    var radioRank=document.createElement("input");
    radioRank.setAttribute("type","radio");
    radioRank.setAttribute("name","rank"+idOption);
    radioRank.setAttribute("value","rankIMG"+i)
    radioRank.setAttribute("style","-webkit-appearance: none;")

    var img=document.createElement("img");
    img.setAttribute("src",`../img/rankIcon/rankIMG${i}.png`);
    img.setAttribute("class","rankIcon");

    label.appendChild(radioRank);
    label.appendChild(img);
    

    containerSelectRank.appendChild(label);
  }

  var iconX=document.createElement("i");
  iconX.setAttribute("class","delete-option-open nes-icon close is-small");
  iconX.setAttribute("id",`option${idOption}`);
  iconX.setAttribute("onclick","deleteOption(this)");

  divInput.appendChild(document.createElement("hr"));
  divInput.appendChild(titleCreateQuestion);
  divInput.appendChild(inputQuestion);
  divInput.appendChild(brTag1);
  divInput.appendChild(spanRank);
  divInput.appendChild(brTag2);
  divInput.appendChild(containerSelectRank);
  divInput.appendChild(iconX);

  listInput.insertBefore(divInput,listInput.childNodes[listInput.childNodes.length-2]);      
}

function createJSONPollMultiple(){
  var jsonOptionInput=[];
  var jsonValoriOption={}
  
  $('input[name="pollOption"]').map(function(){
    //dataInput.push(this.value);
    jsonOptionInput.push(this.value);
    jsonValoriOption[this.value]=0;
  });


  jsonOptionString=JSON.stringify(jsonOptionInput);
  jsonValoriOptionString=JSON.stringify(jsonValoriOption);
  console.log(jsonValoriOptionString);

  var namePoll=$('input[name="namePoll"]').val();
  
  var jsonFinalDatiString=`{"namePoll":"${namePoll}","optionPoll":${jsonOptionString},"valueOption":${jsonValoriOptionString},"typePoll":0}`;
  

  socket.emit("pollMultiple",jsonFinalDatiString);
  
  getPollDynamicalMultiple(jsonFinalDatiString);
}




function createJSONRanking(){
  var datePoll={
    questions_rightanswer:[],
    value_question_rank:{},
    typePoll:1
  };

  $(".div-delete-option").map(function(){
    var valueQuestion=$(this).children('input[name="pollQuestion"]').val();
    var selectRank=$(this).find('input[type=radio]:checked').val();

    var valueRankName=$(this).find('input[type=radio]:checked').attr("name");

    datePoll.questions_rightanswer.push({
      question: valueQuestion,
      select_rank:valueRankName,
      select_rankIMG:selectRank

    });

    for(var i=1;i<5;i++){
      datePoll.value_question_rank[`${valueRankName}_${i}`]=0;
    }

  });

  var jsonStringPollRanking=JSON.stringify(datePoll);
  console.log(jsonStringPollRanking);
  socket.emit("createPollRanking",jsonStringPollRanking);

  getPollDynamicalRanking(jsonStringPollRanking);
}

