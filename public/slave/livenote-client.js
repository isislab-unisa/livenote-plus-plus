// Hide elements on the view
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

// Render the current page
function loadStatus(s){
  status = s
  queueRenderPage(s.nslide);
  pageNum = s.nslide
  document.getElementById("progress-bar").setAttribute("value", s.nslide);
}

/*
AUDIO VIDEO
Manage the connection audio/video for client/master
*/
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
var counter=0;

/*
Function called on load of html page
Set the connection to the socket with with right name
See the description on server.js for the different messages on socket
*/
module.exports = {
  initclient: function (namespace) {
    socket = io.connect(window.location.origin+namespace, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax : 5000,
      reconnectionAttempts: 99999
    });
  
    // counting 
    socket.emit("connection", true);
  
    socket.on("client_connected", (status) => {
      if(status) {
        counter++
        document.getElementById("counter").innerHTML = counter;
      }
    });
  
    socket.on("client_disconnected", (status) => {
      if(status) {
        counter--
        document.getElementById("counter").innerHTML = counter;
      }
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
  
    initServices(socket);  
  }
};

/*
function initclient(namespace) {
  socket = io.connect(window.location.origin+namespace, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: 99999
  });

  // counting 
  socket.emit("connection", true);

  
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

  initServices(socket);

}
*/
const video = document.querySelector("video");

window.onunload = window.onbeforeunload = () => {
  socket.close();
};
