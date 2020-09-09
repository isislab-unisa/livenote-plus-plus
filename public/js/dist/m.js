(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./public/master/livenote-master.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./public/master/livenote-master.js":
/*!******************************************!*\
  !*** ./public/master/livenote-master.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// hide elements on the view\nfunction hidecontrol(){\n  $(\".control\").each(function (index, element) {\n    hide = $(element).is(':hidden');\n\n    if($(element).attr('id') ==\"select-audio\" || $(element).attr('id') ==\"select-video\")\n    {\n      if($(\"#startlive\").hasClass('nes-logo')){\n        $(element).hide()     \n      }\n    } else{\n      if(!hide){\n        $(element).hide()     \n      }else {\n        $(element).show()\n      }\n    }\n  });\n}\n\n// Move to prev page of presentation\nconst showPrevPage = () => {\n  if (pageNum <= 1) {\n    return;\n  }\n  pageNum--;\n  (pmode == 0) && sendMasterStatus(pageNum);\n  queueRenderPage(pageNum);\n  document.getElementById(\"progress-bar\").setAttribute(\"value\", pageNum);\n};\n\n// Move to next page of presentation\nconst showNextPage = () => {\n  if (pageNum >= pdfDoc.numPages) {\n    return;\n  }\n  pageNum++;\n  (pmode == 0) && sendMasterStatus(pageNum);\n  queueRenderPage(pageNum);\n  document.getElementById(\"progress-bar\").setAttribute(\"value\", pageNum);\n\n};\n\n// Notify all client that page of presentation has changed\nfunction sendMasterStatus(pageNum){\n  status.nslide = pageNum;\n  console.log(socket);\n  socket.emit(\"master\", JSON.stringify(status), function (data) {      \n    console.log('Message next page sent! '+ status.nslide);\n  }); \n}\n\n// Switch page with arrow keys\ndocument.onkeydown = function(e) {\n  switch (e.keyCode) {\n    //left arrow\n    case 37:\n      showPrevPage();\n      break;\n    //up arrow\n    case 38:\n      break;\n    //right arrow\n    case 39:\n      showNextPage();\n      break;\n    //down arrow\n    case 40:\n      break;\n  }\n}\n\n// Button Events\ndocument.querySelector('#prev-page').addEventListener('click', showPrevPage);\ndocument.querySelector('#next-page').addEventListener('click', showNextPage);\n\n// Render the current page\nfunction loadStatus(s){\n  status = s\n  queueRenderPage(s.nslide);\n}\n\n/*\nAUDIO VIDEO\nManage the connection audio/video for client/master\n*/\nconst peerConnections = {};\nconst config = {\n  iceServers: [\n    {\n      urls: [\n      \"stun:isiswork01.di.unisa.it\"]\n    }\n  ]\n};\n\nwindow.onunload = window.onbeforeunload = () => {\n  console.log(\"Close socket\")\n  socket.close();\n};\n\nif (document.getElementById(\"video\") != undefined )\ndocument.getElementById(\"video\").addEventListener('click', function(event){\n//<img src=\"https://img.icons8.com/color/48/000000/record.png\"/>  \n//<img src=\"https://img.icons8.com/color/48/000000/stop.png\"/>   \n});\nif (document.getElementById(\"audio\") != undefined )\ndocument.getElementById(\"audio\").addEventListener('click', function(event){\n//https://img.icons8.com/color/48/000000/play-record.png\n//<img src=\"https://img.icons8.com/color/48/000000/block-microphone.png\"/>  \n});\n\nvar socket;\nvar counter=0;\n\n/*\nFunction called on load of html page\nSet the connection to the socket with with right name\nSee the description on server.js for the different messages on socket\nthe export is needed for the webpack module\n*/\nmodule.exports = {\n  initmaster: function (namespace) {\n    console.log(\"Connect to \"+window.location.origin+namespace)\n    socket = io.connect(window.location.origin+namespace, {\n      reconnection: true,\n      reconnectionDelay: 1000,\n      reconnectionDelayMax : 5000,\n      reconnectionAttempts: 99999\n    });\n  \n    socket.on(\"client_connected\", (status) => {\n      if(status) {\n        counter++\n        document.getElementById(\"counter\").innerHTML = counter;\n        socket.emit(\"counter\", counter);\n      }\n    });\n  \n    socket.on(\"client_disconnected\", (status) => {\n      if(status) {\n        counter--\n        document.getElementById(\"counter\").innerHTML = counter;\n        socket.emit(\"counter\", counter);\n      }\n    });\n  \n    socket.on(\"answer\", (id, description) => {\n      peerConnections[id].setRemoteDescription(description);\n    });\n    \n    socket.on(\"watcher\", id => {\n      const peerConnection = new RTCPeerConnection(config);\n      peerConnections[id] = peerConnection;\n    \n      let stream = videoElement.srcObject;\n      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));\n    \n      peerConnection.onicecandidate = event => {\n        if (event.candidate) {\n          socket.emit(\"candidate\", id, event.candidate);\n        }\n      };\n    \n      peerConnection\n        .createOffer()\n        .then(sdp => peerConnection.setLocalDescription(sdp))\n        .then(() => {\n          socket.emit(\"offer\", id, peerConnection.localDescription);\n        });\n  \n    });\n    \n    socket.on(\"candidate\", (id, candidate) => {\n      peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));\n    });\n    \n    socket.on(\"disconnectPeer\", id => {\n      peerConnections[id].close();\n      delete peerConnections[id];\n    });\n  \n    // Get camera and microphone\n    const videoElement = document.querySelector(\"video\");\n    const audioSelect = document.querySelector(\"select#audioSource\");\n    const videoSelect = document.querySelector(\"select#videoSource\");\n  \n    audioSelect.onchange = getStream;\n    videoSelect.onchange = getStream;\n  \n    function gotDevices(deviceInfos) {\n      window.deviceInfos = deviceInfos;\n      for (const deviceInfo of deviceInfos) {\n        const option = document.createElement(\"option\");\n        option.value = deviceInfo.deviceId;\n        if (deviceInfo.kind === \"audioinput\") {\n          option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;\n          audioSelect.appendChild(option);\n        } else if (deviceInfo.kind === \"videoinput\") {\n          option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;\n          videoSelect.appendChild(option);\n        }\n      }\n    }\n      \n    function getStream() {\n      if (window.stream) {\n        window.stream.getTracks().forEach(track => {\n          track.stop();\n        });\n      }\n      const audioSource = audioSelect.value;\n      const videoSource = videoSelect.value;\n      const constraints = {\n        audio: { deviceId: audioSource ? { exact: audioSource } : undefined },\n        video: { deviceId: videoSource ? { exact: videoSource } : undefined }\n      };\n      return navigator.mediaDevices\n        .getUserMedia(constraints)\n        .then(gotStream)\n        .catch(handleError);\n    }\n      \n    function gotStream(stream) {\n      window.stream = stream;\n      audioSelect.selectedIndex = [...audioSelect.options].findIndex(\n        option => option.text === stream.getAudioTracks()[0].label\n      );\n      videoSelect.selectedIndex = [...videoSelect.options].findIndex(\n        option => option.text === stream.getVideoTracks()[0].label\n      );\n      videoElement.srcObject = stream;\n      socket.emit(\"broadcaster\");\n    }\n  \n    \n    function handleError(error) {\n      console.error(\"Error: \", error);\n    }\n  \n    function startLive(){\n      var dial = document.getElementById('dialog-play')\n      if (typeof dial.showModal === \"function\") {\n        dial.showModal();\n      } else {\n        alert(\"The <dialog> API is not supported by this browser\");\n      }\n      //document.getElementById('dialog-play').showModal();\n          $('#play').click( function()\n            { \n              getStream()\n              .then(getDevices)\n              .then(gotDevices);\n              function getDevices() {\n                $('#startlive').removeClass(\"nes-logo\");\n                $('#liveperson').show();\n                $('#select-audio').show();\n                $('#select-video').show();\n                \n                // $('#startlive').addClass(\"nes-mario\");\n                return navigator.mediaDevices.enumerateDevices();\n              }\n            }\n          );\n    }\n  \n    $('#startlive').click( function() {\n      startLive();\n    });\n      \n    $(document).keydown(function(e){\n      if(e.ctrlKey && e.altKey && e.keyCode == 76){\n        startLive();\n          //CTRL + ALT + l keydown combo\n      }\n    });\n  \n    initServices(socket);\n  }\n};\n\n/*   \nfunction initmaster(namespace){\n  console.log(\"Connect to \"+window.location.origin+namespace)\n  socket = io.connect(window.location.origin+namespace, {\n    reconnection: true,\n    reconnectionDelay: 1000,\n    reconnectionDelayMax : 5000,\n    reconnectionAttempts: 99999\n  });\n\n  socket.on(\"client_connected\", (status) => {\n    if(status) {\n      counter++\n      document.getElementById(\"counter\").innerHTML = counter;\n    }\n  });\n\n  socket.on(\"client_disconnected\", (status) => {\n    if(status) {\n      counter--\n      document.getElementById(\"counter\").innerHTML = counter;\n    }\n  });\n\n  socket.on(\"answer\", (id, description) => {\n    peerConnections[id].setRemoteDescription(description);\n  });\n  \n  socket.on(\"watcher\", id => {\n    const peerConnection = new RTCPeerConnection(config);\n    peerConnections[id] = peerConnection;\n  \n    let stream = videoElement.srcObject;\n    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));\n  \n    peerConnection.onicecandidate = event => {\n      if (event.candidate) {\n        socket.emit(\"candidate\", id, event.candidate);\n      }\n    };\n  \n    peerConnection\n      .createOffer()\n      .then(sdp => peerConnection.setLocalDescription(sdp))\n      .then(() => {\n        socket.emit(\"offer\", id, peerConnection.localDescription);\n      });\n\n  });\n  \n  socket.on(\"candidate\", (id, candidate) => {\n    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));\n  });\n  \n  socket.on(\"disconnectPeer\", id => {\n    peerConnections[id].close();\n    delete peerConnections[id];\n  });\n\n  // Get camera and microphone\n  const videoElement = document.querySelector(\"video\");\n  const audioSelect = document.querySelector(\"select#audioSource\");\n  const videoSelect = document.querySelector(\"select#videoSource\");\n\n  audioSelect.onchange = getStream;\n  videoSelect.onchange = getStream;\n\n  function gotDevices(deviceInfos) {\n    window.deviceInfos = deviceInfos;\n    for (const deviceInfo of deviceInfos) {\n      const option = document.createElement(\"option\");\n      option.value = deviceInfo.deviceId;\n      if (deviceInfo.kind === \"audioinput\") {\n        option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;\n        audioSelect.appendChild(option);\n      } else if (deviceInfo.kind === \"videoinput\") {\n        option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;\n        videoSelect.appendChild(option);\n      }\n    }\n  }\n    \n  function getStream() {\n    if (window.stream) {\n      window.stream.getTracks().forEach(track => {\n        track.stop();\n      });\n    }\n    const audioSource = audioSelect.value;\n    const videoSource = videoSelect.value;\n    const constraints = {\n      audio: { deviceId: audioSource ? { exact: audioSource } : undefined },\n      video: { deviceId: videoSource ? { exact: videoSource } : undefined }\n    };\n    return navigator.mediaDevices\n      .getUserMedia(constraints)\n      .then(gotStream)\n      .catch(handleError);\n  }\n    \n  function gotStream(stream) {\n    window.stream = stream;\n    audioSelect.selectedIndex = [...audioSelect.options].findIndex(\n      option => option.text === stream.getAudioTracks()[0].label\n    );\n    videoSelect.selectedIndex = [...videoSelect.options].findIndex(\n      option => option.text === stream.getVideoTracks()[0].label\n    );\n    videoElement.srcObject = stream;\n    socket.emit(\"broadcaster\");\n  }\n\n  \n  function handleError(error) {\n    console.error(\"Error: \", error);\n  }\n\n  function startLive(){\n    var dial = document.getElementById('dialog-play')\n    if (typeof dial.showModal === \"function\") {\n      dial.showModal();\n    } else {\n      alert(\"The <dialog> API is not supported by this browser\");\n    }\n    //document.getElementById('dialog-play').showModal();\n        $('#play').click( function()\n          { \n            getStream()\n            .then(getDevices)\n            .then(gotDevices);\n            function getDevices() {\n              $('#startlive').removeClass(\"nes-logo\");\n              $('#liveperson').show();\n              $('#select-audio').show();\n              $('#select-video').show();\n              \n              // $('#startlive').addClass(\"nes-mario\");\n              return navigator.mediaDevices.enumerateDevices();\n            }\n          }\n        );\n  }\n\n  $('#startlive').click( function() {\n    startLive();\n  });\n    \n  $(document).keydown(function(e){\n    if(e.ctrlKey && e.altKey && e.keyCode == 76){\n      startLive();\n        //CTRL + ALT + l keydown combo\n    }\n  });\n\n  initServices(socket);\n}\n*/\n\n\n\n//# sourceURL=webpack:///./public/master/livenote-master.js?");

/***/ })

/******/ });
});