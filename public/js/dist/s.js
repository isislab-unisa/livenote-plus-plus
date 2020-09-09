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
/******/ 	return __webpack_require__(__webpack_require__.s = "./public/slave/livenote-client.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./public/slave/livenote-client.js":
/*!*****************************************!*\
  !*** ./public/slave/livenote-client.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Hide elements on the view\nfunction hidecontrol(){\n  $(\".control\").each(function (index, element) {\n    hide = $(element).is(':hidden');\n    if(!hide){\n      $(element).hide()     \n    }else {\n      $(element).show()\n    }\n});\n}\n\n// Render the current page\nfunction loadStatus(s){\n  status = s\n  queueRenderPage(s.nslide);\n  pageNum = s.nslide\n  document.getElementById(\"progress-bar\").setAttribute(\"value\", s.nslide);\n}\n\n/*\nAUDIO VIDEO\nManage the connection audio/video for client/master\n*/\nlet peerConnection;\nconst config = {\n  iceServers: [\n    {\n      urls: [\n      \"stun:isiswork01.di.unisa.it\"]\n    }\n  ]\n};\n\nvar socket;\n\n/*\nFunction called on load of html page\nSet the connection to the socket with with right name\nSee the description on server.js for the different messages on socket\n*/\nmodule.exports = {\n  initclient: function (namespace) {\n    socket = io.connect(window.location.origin+namespace, {\n      reconnection: true,\n      reconnectionDelay: 1000,\n      reconnectionDelayMax : 5000,\n      reconnectionAttempts: 99999\n    });\n  \n    // counting \n    socket.emit(\"connection\", true);\n  \n    socket.on(\"counter_update\", (data) => {\n      console.log('updating counter')\n      document.getElementById(\"counter\").innerHTML = data;      \n    });\n    \n    socket.on( \"slidechanged\", function (msg) {\n      console.log(\"Presentation Change \"+msg); \n      s = JSON.parse(msg)\n      loadStatus(s);\n    });\n    socket.on( \"pokemon-update\", function (status, name) {\n      updatepokemon(status,name)\n    });  \n    //TODO BUG quando un client si collega se il video è in modalità pokemon può vederlo, lo stesso, quando si collega deve chiedere il permesso del video\n  \n    socket.on(\"offer\", (id, description) => {\n      console.log(id)\n      console.log(description)\n      \n      peerConnection = new RTCPeerConnection(config);\n      peerConnection\n        .setRemoteDescription(description)\n        .then(() => peerConnection.createAnswer())\n        .then(sdp => peerConnection.setLocalDescription(sdp))\n        .then(() => {\n          $('#liveperson').show();\n          socket.emit(\"answer\", id, peerConnection.localDescription);\n        });\n      peerConnection.ontrack = event => {\n        video.srcObject = event.streams[0];\n      };\n      peerConnection.onicecandidate = event => {\n        if (event.candidate) {\n          socket.emit(\"candidate\", id, event.candidate);\n        }\n      };\n    });\n    socket.on(\"candidate\", (id, candidate) => {\n      peerConnection\n        .addIceCandidate(new RTCIceCandidate(candidate))\n        .catch(e => console.error(e));\n    });\n    \n    socket.on(\"connect\", () => {\n      socket.emit(\"watcher\");\n    });\n    \n    socket.on(\"broadcaster\", () => {\n      socket.emit(\"watcher\");\n    });\n    \n    socket.on(\"disconnectPeer\", () => {\n      peerConnection.close();\n    });\n  \n    initServices(socket);  \n  }\n};\n\n/*\nfunction initclient(namespace) {\n  socket = io.connect(window.location.origin+namespace, {\n    reconnection: true,\n    reconnectionDelay: 1000,\n    reconnectionDelayMax : 5000,\n    reconnectionAttempts: 99999\n  });\n\n  // counting \n  socket.emit(\"connection\", true);\n\n  \n  socket.on( \"slidechanged\", function (msg) {\n    console.log(\"Presentation Change \"+msg); \n    s = JSON.parse(msg)\n    loadStatus(s);\n  });\n  socket.on( \"pokemon-update\", function (status, name) {\n    updatepokemon(status,name)\n  });  \n  //TODO BUG quando un client si collega se il video è in modalità pokemon può vederlo, lo stesso, quando si collega deve chiedere il permesso del video\n\n  socket.on(\"offer\", (id, description) => {\n    console.log(id)\n    console.log(description)\n    \n    peerConnection = new RTCPeerConnection(config);\n    peerConnection\n      .setRemoteDescription(description)\n      .then(() => peerConnection.createAnswer())\n      .then(sdp => peerConnection.setLocalDescription(sdp))\n      .then(() => {\n        $('#liveperson').show();\n        socket.emit(\"answer\", id, peerConnection.localDescription);\n      });\n    peerConnection.ontrack = event => {\n      video.srcObject = event.streams[0];\n    };\n    peerConnection.onicecandidate = event => {\n      if (event.candidate) {\n        socket.emit(\"candidate\", id, event.candidate);\n      }\n    };\n  });\n  socket.on(\"candidate\", (id, candidate) => {\n    peerConnection\n      .addIceCandidate(new RTCIceCandidate(candidate))\n      .catch(e => console.error(e));\n  });\n  \n  socket.on(\"connect\", () => {\n    socket.emit(\"watcher\");\n  });\n  \n  socket.on(\"broadcaster\", () => {\n    socket.emit(\"watcher\");\n  });\n  \n  socket.on(\"disconnectPeer\", () => {\n    peerConnection.close();\n  });\n\n  initServices(socket);\n\n}\n*/\nconst video = document.querySelector(\"video\");\n\nwindow.onunload = window.onbeforeunload = () => {\n  socket.close();\n};\n\n\n//# sourceURL=webpack:///./public/slave/livenote-client.js?");

/***/ })

/******/ });
});