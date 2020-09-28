const { functionsIn } = require("lodash");

console.log('%cAre you looking for bugs? Join us on https://discord.gg/BTt5fUp', 'color: red; font-size: x-large');

// hide elements on the view
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

// Move to prev page of presentation
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  (pmode == 0) && sendMasterStatus(pageNum);
  queueRenderPage(pageNum);
  document.getElementById("progress-bar").setAttribute("value", pageNum);
};

// Move to next page of presentation
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  (pmode == 0) && sendMasterStatus(pageNum);
  queueRenderPage(pageNum);
  document.getElementById("progress-bar").setAttribute("value", pageNum);

};

// Notify all client that page of presentation has changed
function sendMasterStatus(pageNum){
  status.nslide = pageNum;
  //console.log(socket);
  socket.emit("master", JSON.stringify(status), function (data) {      
    console.log('Message next page sent! '+ status.nslide);
  }); 
}

// Switch page with arrow keys
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

// Render the current page
function loadStatus(s){
  status = s
  queueRenderPage(s.nslide);
}

/*
AUDIO VIDEO
Manage the connection audio/video for client/master
Turn server
*/
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
var counter=0;
var countFilesIMGMaster=0;

/*
Function called on load of html page
Set the connection to the socket with with right name
See the description on server.js for the different messages on socket
the export is needed for the webpack module
*/
module.exports = {
  initmaster: function (namespace) {
    //console.log("Connect to "+window.location.origin+namespace)
    socket = io.connect(window.location.origin+namespace, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax : 5000,
      reconnectionAttempts: 99999
    });
  
    socket.on("client_connected", (status,idSocket) => {
      if(status) {
        counter++
        document.getElementById("counter").innerHTML = counter;
        socket.emit("counter", counter);
      }

      if(jsonPollObject){
        console.log("jsonPollObject: "+jsonPollObject);
        socket.emit("updateVoteMaxPollMultiple",counter);
        socket.emit("waitGetPoll",idSocket);
        updateVoteMaxPollMultiple(counter);
      }
    });
  
    socket.on("client_disconnected", (status) => {
      if(status) {
        if (counter > 0)
          counter--
        document.getElementById("counter").innerHTML = counter;
        socket.emit("counter", counter);
      }
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

    

    socket.on("increaseValueOption",(optionChecked)=>{
      countPeopleAnswered++;
      var countOption=updatingOptionValue(optionChecked,countPeopleAnswered);
      socket.emit("updatingPollMultiple",optionChecked,countOption,countPeopleAnswered);
    })

    socket.on("increaseValueRanking",(dateSelectRank)=>{
    var jsonVote=updatingValueRanking(dateSelectRank);
    socket.emit("updatingPollRanking",jsonVote);
    });


    // socket.on("updatingPollRanking",(vote,countPersonAnswered)=>{
    //   updatePollRankingDynamical(vote,countPersonAnswered);
    // });

    socket.on("getCountFiles",(countFilesIMG)=>{
      countFilesIMGMaster=countFilesIMG;
    });
    
    socket.on("getPollRanking",(datePoll,countPeople)=>{
      hideBottonCreatePoll();
      getPollDynamicalRanking(datePoll,countPeople);
    });

    socket.on("getPollMultiple",(datePoll,countPeople)=>{
      hideBottonCreatePoll();
      getPollDynamicalMultiple(datePoll,countPeople);
    });

    socket.on("getPoll",(idSocket)=>{
      if(jsonPollObject){
        var jsonString=JSON.stringify(jsonPollObject);
        if(jsonPollObject.typePoll==0){
          socket.emit("getPollMultiple",idSocket,jsonString,counter);
        } 
        else if(jsonPollObject.typePoll==1){
          socket.emit("getPollRanking",idSocket,jsonString);
        }
      }
    });

    socket.emit("getFileIMG");
    
    

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

    //DETACH AUDIO
    const stopaudioButton = document.getElementById('vol');
    var openaudio = true;
    stopaudioButton.addEventListener('click', function() {
        if (openaudio) {
          navigator.mediaDevices.getUserMedia({ audio: false, video: true })
            .then(gotStreamNoAudio)
            .catch(err=>{ 
              console.log(err) 
            })
          openaudio = false;
        } else {
          getStream()
          .then(getDevices)
          openaudio = true;
          function getDevices() {
            $('#startlive').removeClass("nes-logo");
            $('#liveperson').show();
            $('#select-audio').show();
            $('#select-video').show();
            
            // $('#startlive').addClass("nes-mario");
            return navigator.mediaDevices.enumerateDevices();
          }
        }
    });

    function gotStreamNoAudio(stream) {
      window.stream = stream;
      videoSelect.selectedIndex = [...videoSelect.options].findIndex(
        option => option.text === stream.getVideoTracks()[0].label
      );
      videoElement.srcObject = stream;
      socket.emit("broadcaster");
    }

    //DETACH VIDEO
    const stopvideoButton = document.getElementById('playvideo');
    var openvideo = true;
    stopvideoButton.addEventListener('click', function() {
      if (openvideo) {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          .then(gotStreamNoVideo)
          .catch(err=>{ 
            console.log(err) 
          })
        openvideo = false;
      } else {
        getStream()
        .then(getDevices)
        openvideo = true;
        function getDevices() {
          $('#startlive').removeClass("nes-logo");
          $('#liveperson').show();
          $('#select-audio').show();
          $('#select-video').show();
          // $('#startlive').addClass("nes-mario");
          return navigator.mediaDevices.enumerateDevices();
        }
      }
    });

    function gotStreamNoVideo(stream) {
      window.stream = stream;
      audioSelect.selectedIndex = [...audioSelect.options].findIndex(
        option => option.text === stream.getAudioTracks()[0].label
      );
      videoElement.srcObject = stream;
      /*const tracks = stream.getTracks();
      tracks.forEach(function(track) {
        track.stop();
        console.log('stopping')
      })*/
      socket.emit("broadcaster");
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
      /*var dial = document.getElementById('dialog-play')
      if (typeof dial.showModal === "function") {
        dial.showModal();
      } else {
        alert("The <dialog> API is not supported by this browser");
      }
      */
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
            
            $('#video-audio').text("Hide video");
            $('#startlive').attr("onclick","hideVideoNavbar()").removeAttr("data-toggle").removeAttr("data-target");
            
           
            // $('#startlive').addClass("nes-mario");
            return navigator.mediaDevices.enumerateDevices();
          }
        }
      );
    }
  
    $('#startlive').click( function() {
      startLive();
    });
      
    $(document).keydown(function(e){
      if(e.ctrlKey && e.altKey && e.keyCode == 76){
        startLive();
          //CTRL + ALT + l keydown combo
      }
    });
  
    // When the master click il botton send, the poll is sent to server. After that, the server will send at the other users
    $('#createPoll').click(function(){
      var selectPoll=$('input[name="choicePoll"]:checked').val();
      var res;
      if(selectPoll=="multiple"){
        // poll ranking
        res=validatePoll();
        
      }
      else if(selectPoll=="ranking"){
        //poll multiple
        res=validatePoll();
      }
      $("#create-poll").css("display","none");

      if(res==true){
        $('#dialog-sondaggio').modal("hide");

        if(selectPoll=="multiple")
          createJSONPollMultiple();
        else if(selectPoll=="ranking")
          createJSONRanking();
      }

      
    });

    // When the master click il botton close poll, the server will notifier at the other users that the poll has been closed
    $("#close-poll").click(function(){
      document.getElementById("create-poll").style.display="inline";
      document.getElementById("viewPollDynamical").style.display="none";
      // countPersonAnswer=0;

      $("#pollDynamical").empty();
      jsonPollObject=0;

      socket.emit("closePoll",jsonPollObject.typePoll);
      $("#create-poll").css("display","block");
    });

    initServices(socket);
  },
  
  //Creation dynamical of the poll, based on the poll mode selection
  changeQuestions:function(element){
    var question=element.value;

    if(question=="ranking"){
      idOption=1;
      createRanking();
    }
    else if(question=="multiple"){
      idOption=1;
      createMultipleQuestions();
    }
  },

  // Delete an option specified
  deleteOption:function(element){
    var testo=element.id+"DIV";

  var divOptionRemove=document.getElementById(`${testo}`);

  divOptionRemove.remove();
  },

  toggleHamburger:function(){
    $("#mySidenav").toggleClass("animation");
  },
  
  changeDrawingColor:function(){
    var color=changeColor();
    if(color==="#000000"){
      $("#colorDraw").text(" black");
      $("#colorDraw").css("color","black");
    }
    else if(color==="#FF0000"){
      $("#colorDraw").text(" red");
      $("#colorDraw").css("color","red");
    }
    else if(color==="#008000"){
      $("#colorDraw").text(" green"); 
      $("#colorDraw").css("color","green");
    }
  },

  changeWidthDrawing:function(){
    var size=changeLineWidth();
    $("#widthDraw").text(size);
  },

  showChatLogo:function(){
    showChat();
  },

  hideVideoNavbar:function(){
    makepokemon();
  },

  changeAvatarNavbar:function(){
    changepokemon();
  }
};

// Check if the fields are empty. If so, it will view a messagge of error.
function validatePoll(){
  
  var res=true;
  $("#sondaggio").find("input").each(function(){
    if($(this).val()==""){
      $(this).attr("class","nes-input is-error"); 
      $(this).next().css("display","block");
      res=false;
    }
    else if($(this).hasClass("nes-input is-error")){
      $(this).attr("class","nes-input").next().hide(); 
    }
  });

  return res;
}

//Hide the button of createPoll when the master click the button send. 
function hideBottonCreatePoll(){
  document.getElementById("create-poll").style.display="none";
}


// create a poll multiple
function createMultipleQuestions(){
  
  var divOptionPoll=document.getElementById("sondaggio");

  while(divOptionPoll.lastElementChild){
    divOptionPoll.removeChild(divOptionPoll.lastElementChild);
  }
  
   

  var titleQuestion=document.createElement("h5");
  titleQuestion.setAttribute("class","modal-title");
  var textQuestion=document.createTextNode("Create a question");
  titleQuestion.appendChild(textQuestion);

  var inputQuestion=document.createElement("input");
  inputQuestion.setAttribute("type","text");
  inputQuestion.setAttribute("class","nes-input");
  inputQuestion.setAttribute("name","namePoll");
  inputQuestion.setAttribute("placeholder","Insert a question");

  var spanErrorQuestion=document.createElement("span");
  spanErrorQuestion.appendChild(document.createTextNode("You haven't inserted a question"));
  spanErrorQuestion.setAttribute("class","errorPoll");
  
  var hrTag=document.createElement("hr");

  var tableDiv=document.createElement("div");
  tableDiv.setAttribute("id","tableOption");

  var titleOption=document.createElement("h5");
  titleOption.setAttribute("class","modal-title");
  var textOption=document.createTextNode("Create some options");
  titleOption.appendChild(textOption);



  var divOtherOption=document.createElement("div");
  divOtherOption.setAttribute("class","div-delete-option");
  divOtherOption.setAttribute("id","option1DIV");

  var inputOptionPoll=document.createElement("input");
  inputOptionPoll.setAttribute("type","text");
  inputOptionPoll.setAttribute("name","pollOption");
  inputOptionPoll.setAttribute("class","nes-input");
  inputOptionPoll.setAttribute("placeholder","Insert an option");

  var spanErrorOption=document.createElement("span");
  spanErrorOption.appendChild(document.createTextNode("You haven't inserted an option"));
  spanErrorOption.setAttribute("class","errorPoll");




  var buttonAdd=document.createElement("button");
  buttonAdd.setAttribute("type","button");
  buttonAdd.setAttribute("class","nes-btn");
  buttonAdd.setAttribute("id","addOptionMultiple");

  var textNode=document.createTextNode("Add an option");

  buttonAdd.addEventListener("click",addOptionMultiple);

  buttonAdd.appendChild(textNode);

  divOtherOption.appendChild(inputOptionPoll);
  divOtherOption.appendChild(spanErrorOption);

  tableDiv.appendChild(divOtherOption);

  divOptionPoll.appendChild(titleQuestion);
  divOptionPoll.appendChild(inputQuestion);
  divOptionPoll.appendChild(spanErrorQuestion);

  divOptionPoll.appendChild(hrTag);

  divOptionPoll.appendChild(titleOption);

  divOptionPoll.appendChild(tableDiv);
  divOptionPoll.appendChild(buttonAdd);

}

// create a ranking poll
function createRanking(){
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

  var spanError=document.createElement("span");  
  spanError.appendChild(document.createTextNode("You haven't inserted a question"));
  spanError.setAttribute("class","errorPoll");


  var titleRank=document.createElement("h5");
  titleRank.appendChild(document.createTextNode("Select a rank"));

  var containerSelectRank=document.createElement("div");
  containerSelectRank.setAttribute("class","container-select nes-input");

  for(var i=1;i<countFilesIMGMaster+1;i++){
    var label=document.createElement("label");
    var radioRank=document.createElement("input");
    radioRank.setAttribute("type","radio");
    radioRank.setAttribute("name","rank1");
    radioRank.setAttribute("value","rankIMG"+i)
    radioRank.setAttribute("style","-webkit-appearance: none;")

    if(i==1)
      radioRank.setAttribute("checked","checked");

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
  divDeletePoll.appendChild(spanError);
  divDeletePoll.appendChild(brTag);
  divDeletePoll.appendChild(titleRank);
  divDeletePoll.appendChild(containerSelectRank);

  
  divOptionPoll.appendChild(divDeletePoll);
  divOptionPoll.appendChild(brTag);
  divOptionPoll.appendChild(buttonAdd);

}

// insert an option in the multiple poll
var idOption=1; // variable used to set id of the div. So we know excalty which the master wants to eliminate an option 
function addOptionMultiple(){
  
  //$('#sondaggio').append('<input type="text" class="nes-input" placeholder="insert an option"/>');
  var tableDiv=document.getElementById("tableOption");
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

  var spanError=document.createElement("span");  
  spanError.appendChild(document.createTextNode("You haven't inserted a option"));
  spanError.setAttribute("class","errorPoll");

  divInput.appendChild(input);
  divInput.appendChild(spanError);
  divInput.appendChild(iconX);
  
  tableDiv.appendChild(divInput);

};

// create an anther ranking poll
function addQuestionRank(){
  
  
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

  var spanError=document.createElement("span");
  spanError.appendChild(document.createTextNode("You haven't insert a question"));
  spanError.setAttribute("class","errorPoll");

  var brTag1=document.createElement("br");

  var spanRank=document.createElement("h5");
  spanRank.appendChild(document.createTextNode("Select a rank"));

  var containerSelectRank=document.createElement("div");
  containerSelectRank.setAttribute("class","container-select nes-input");

  for(var i=1;i<countFilesIMGMaster+1;i++){
    var label=document.createElement("label");
    var radioRank=document.createElement("input");
    radioRank.setAttribute("type","radio");
    radioRank.setAttribute("name","rank"+idOption);
    radioRank.setAttribute("value","rankIMG"+i)
    radioRank.setAttribute("style","-webkit-appearance: none;")
    if(i==1)
      radioRank.setAttribute("checked","checked");

    var img=document.createElement("img");
    img.setAttribute("src",`../img/rankIcon/rankIMG${i}.png`);
    img.setAttribute("class","rankIcon");

    label.appendChild(radioRank);
    label.appendChild(img);
    

    containerSelectRank.appendChild(label);
  }

  var iconX=document.createElement("i");
  iconX.setAttribute("class","delete-option-ranking nes-icon close is-small");
  iconX.setAttribute("id",`option${idOption}`);
  iconX.setAttribute("onclick","deleteOption(this)");

  divInput.appendChild(document.createElement("hr"));
  divInput.appendChild(titleCreateQuestion);
  divInput.appendChild(inputQuestion);
  divInput.appendChild(spanError);
  divInput.appendChild(spanRank);
  divInput.appendChild(containerSelectRank);
  divInput.appendChild(iconX);

  listInput.insertBefore(divInput,listInput.childNodes[listInput.childNodes.length-2]);      
}


var jsonPollObject;
var countPeopleAnswered;
// create a JSON that containing date of the multiple poll, as a question , some options.
function createJSONPollMultiple(){
  var jsonOptionInput=[];
  var jsonValoriOption={}
  
  $('input[name="pollOption"]').map(function(){
    
    jsonOptionInput.push(this.value);
    jsonValoriOption[this.value]=0;
  });


  var jsonOptionString=JSON.stringify(jsonOptionInput);
  var jsonValoriOptionString=JSON.stringify(jsonValoriOption);
  

  var namePoll=$('input[name="namePoll"]').val();
  
  var jsonPoll=`{"namePoll":"${namePoll}","optionPoll":${jsonOptionString},"valueOption":${jsonValoriOptionString},"typePoll":0}`;

  jsonPollObject=JSON.parse(jsonPoll);

  socket.emit("createPollMultiple",jsonPoll,counter);
  countPeopleAnswered=0;
  getPollDynamicalMultiple(jsonPoll,counter);
}

// create a JSON that containing date of the ranking poll, as a question , emoticons selected
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
  jsonPollObject=JSON.parse(jsonStringPollRanking);

  countPeopleAnswered=0;
  socket.emit("createPollRanking",jsonStringPollRanking);
  getPollDynamicalRanking(jsonStringPollRanking);
}

// increases the value of the option selected, present inside of the JSON
function updatingOptionValue(optionChecked,countPeopleAnswered){

  var countOption=jsonPollObject.valueOption[optionChecked];
  countOption++;

  jsonPollObject.valueOption[optionChecked]=countOption;

  updatePollMultipleDynamical(optionChecked,countOption,countPeopleAnswered);

  return countOption;
  
}

//increase the value of the filled emoticons, present inside of the JSON
function updatingValueRanking(dateSelectRank){
  var jsonVote={
    arrayVote:[]
  }

  dateSelectRank.map(function(rank){

    jsonPollObject.value_question_rank[rank]++;

    jsonVote.arrayVote.push({"id":rank,"vote":jsonPollObject.value_question_rank[rank]});

  });

  updatePollRankingDynamical(jsonVote,true);
  console.log("jsonMaster:"+jsonVote);

  return JSON.stringify(jsonVote);
}

