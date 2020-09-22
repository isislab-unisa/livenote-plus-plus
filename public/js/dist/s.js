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

/***/ "./node_modules/os-browserify/browser.js":
/*!***********************************************!*\
  !*** ./node_modules/os-browserify/browser.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("exports.endianness = function () { return 'LE' };\n\nexports.hostname = function () {\n    if (typeof location !== 'undefined') {\n        return location.hostname\n    }\n    else return '';\n};\n\nexports.loadavg = function () { return [] };\n\nexports.uptime = function () { return 0 };\n\nexports.freemem = function () {\n    return Number.MAX_VALUE;\n};\n\nexports.totalmem = function () {\n    return Number.MAX_VALUE;\n};\n\nexports.cpus = function () { return [] };\n\nexports.type = function () { return 'Browser' };\n\nexports.release = function () {\n    if (typeof navigator !== 'undefined') {\n        return navigator.appVersion;\n    }\n    return '';\n};\n\nexports.networkInterfaces\n= exports.getNetworkInterfaces\n= function () { return {} };\n\nexports.arch = function () { return 'javascript' };\n\nexports.platform = function () { return 'browser' };\n\nexports.tmpdir = exports.tmpDir = function () {\n    return '/tmp';\n};\n\nexports.EOL = '\\n';\n\nexports.homedir = function () {\n\treturn '/'\n};\n\n\n//# sourceURL=webpack:///./node_modules/os-browserify/browser.js?");

/***/ }),

/***/ "./public/slave/livenote-client.js":
/*!*****************************************!*\
  !*** ./public/slave/livenote-client.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const { type } = __webpack_require__(/*! os */ \"./node_modules/os-browserify/browser.js\");\nconsole.log('%cAre you looking for bugs? Join us on https://discord.gg/BTt5fUp', 'color: red; font-size: x-large');\n\nfunction hidecontrol(){\n  $(\".control\").each(function (index, element) {\n    hide = $(element).is(':hidden');\n    if(!hide){\n      $(element).hide()     \n    }else {\n      $(element).show()\n    }\n});\n}\n\n// Render the current page\nmodule.exports = {\n  loadStatus: function (s) {\n    status = s\n    queueRenderPage(s.nslide);\n    pageNum = s.nslide\n    document.getElementById(\"progress-bar\").setAttribute(\"value\", s.nslide);\n  }\n};\n\n// Render the current page\nfunction loadStatus(s){\n  status = s\n  queueRenderPage(s.nslide);\n  pageNum = s.nslide\n  document.getElementById(\"progress-bar\").setAttribute(\"value\", s.nslide);\n}\n\n/*\nAUDIO VIDEO\nManage the connection audio/video for client/master\nTurn Server\n*/\nlet peerConnection;\nconst config = {\n  iceServers: [\n    {\n      urls: [\n      \"stun:isiswork01.di.unisa.it\"]\n    }\n  ]\n};\n\nvar socket;\n\n/*\nFunction called on load of html page\nSet the connection to the socket with with right name\nSee the description on server.js for the different messages on socket\n*/\nmodule.exports = {\n  initclient: function (namespace) {\n    socket = io.connect(window.location.origin+namespace, {\n      reconnection: true,\n      reconnectionDelay: 1000,\n      reconnectionDelayMax : 5000,\n      reconnectionAttempts: 99999\n    });\n  \n    // counting \n    socket.emit(\"connection\", true);\n\n  \n    socket.on(\"counter_update\", (data) => {\n      document.getElementById(\"counter\").innerHTML = data;      \n    });\n    \n    socket.on( \"slidechanged\", function (msg) {\n      console.log(\"Presentation Change \"+msg); \n      s = JSON.parse(msg)\n      loadStatus(s);\n    });\n    socket.on( \"pokemon-update\", function (status, name) {\n      updatepokemon(status,name)\n    });  \n    //TODO BUG quando un client si collega se il video è in modalità pokemon può vederlo, lo stesso, quando si collega deve chiedere il permesso del video\n  \n    socket.on(\"offer\", (id, description) => {\n      //console.log(id)\n      //console.log(description)\n      \n      peerConnection = new RTCPeerConnection(config);\n      peerConnection\n        .setRemoteDescription(description)\n        .then(() => peerConnection.createAnswer())\n        .then(sdp => peerConnection.setLocalDescription(sdp))\n        .then(() => {\n          $('#liveperson').show();\n          socket.emit(\"answer\", id, peerConnection.localDescription);\n        });\n      peerConnection.ontrack = event => {\n        video.srcObject = event.streams[0];\n      };\n      peerConnection.onicecandidate = event => {\n        if (event.candidate) {\n          socket.emit(\"candidate\", id, event.candidate);\n        }\n      };\n    });\n    socket.on(\"candidate\", (id, candidate) => {\n      peerConnection\n        .addIceCandidate(new RTCIceCandidate(candidate))\n        .catch(e => console.error(e));\n    });\n    \n    socket.on(\"connect\", () => {\n      socket.emit(\"watcher\");\n    });\n    \n    socket.on(\"broadcaster\", () => {\n      socket.emit(\"watcher\");\n    });\n    \n    socket.on(\"disconnectPeer\", () => {\n      peerConnection.close();\n    });\n  \n  //Get aggiornamento sondaggio\n  socket.on(\"createPollMultiple\",(data,countPeople)=>{\n    createPollMultiple(data);\n    getPollDynamicalMultiple(data,countPeople); \n  });\n\n  socket.on(\"createPollRanking\",(data,countPeopleInLive)=>{\n    createPollRanking(data); \n    getPollDynamicalRanking(data,countPeopleInLive); \n  });\n  \n// Quando un utente partecipa al canale in ritardo o aggiorna la pagina relativa, prende i dati del sondaggio\n  socket.on(\"getPollMultiple\",(datePoll,countPeople,vote)=>{\n    console.log(\"il voto è:\"+ vote);\n    //getNotice();\n    if(!vote)\n      createPollMultiple(datePoll);\n    getPollDynamicalMultiple(datePoll,countPeople);\n  });\n\n\n  socket.on(\"getPollRanking\",(data,vote)=>{\n    if(!vote)\n      createPollRanking(data); \n    getPollDynamicalRanking(data); \n  });\n\n  socket.on(\"closePoll\",(typePoll)=>{\n    createNotice(typePoll);\n  });\n\n  socket.on(\"updatingPollMultiple\",(id,value,countPersonAnswered)=>{\n    updatePollMultipleDynamical(id,value,countPersonAnswered);\n  });\n\n  socket.on(\"updatingPollRanking\",(vote,countPersonAnswered)=>{\n    updatePollRankingDynamical(vote,countPersonAnswered);\n  });\n\n  socket.on(\"updateVoteMaxPollMultiple\",(counter)=>{\n    updateVoteMaxPollMultiple(counter);\n  });\n  \n\n  initServices(socket);\n  }\n};\n\n// create a poll multiple\nfunction createPollMultiple(data){\n  //visualizzo il bottone sondaggio\n  \n  $(\"#click-poll\").css(\"display\", \"inline\");\n\n  $(\"#sendVotePoll\").html(\"Send\");\n\n  cleanPoll();\n\n  //creazione titolo sondaggio\n  var jsonData=JSON.parse(data);\n\n  $(\"#titlePoll\").text(jsonData.namePoll);\n  $(\"#titlePoll\").css(\"text-align\",\"start\");\n\n  //Creazione opzioni del sondaggio in base al messaggio JSON ricevuto\n  var tableOptionPoll=document.getElementById(\"pollsTable\");\n  \n  var someQuestionsH5=document.createElement(\"h5\");\n  someQuestionsH5.appendChild(document.createTextNode(\"Click one of these options\"));\n  someQuestionsH5.setAttribute(\"style\",\"margin:2%\");\n  \n  tableOptionPoll.appendChild(someQuestionsH5);\n  for(var i=0;i<jsonData.optionPoll.length;i++){\n    var label=document.createElement(\"label\");\n    label.setAttribute(\"class\",\"labelOption\");\n\n    var radioOption=document.createElement(\"input\");\n    radioOption.setAttribute(\"type\",\"radio\");\n    radioOption.setAttribute(\"name\",\"option\");\n    radioOption.setAttribute(\"value\",`${jsonData.optionPoll[i]}`);\n    radioOption.setAttribute(\"class\",\"nes-radio\");\n    \n    var spanOption=document.createElement(\"span\");\n    var text=document.createTextNode(jsonData.optionPoll[i]);\n    spanOption.appendChild(text);\n\n    label.appendChild(radioOption);\n    label.appendChild(spanOption);\n\n    var brTag=document.createElement(\"br\");\n\n    tableOptionPoll.appendChild(label);\n    tableOptionPoll.appendChild(brTag);\n\n    document.getElementById(\"sendVotePoll\").addEventListener(\"click\", sendVotePollMultiple);\n  }\n}\n\n// create a ranking poll\nfunction createPollRanking(date){\n  $(\"#click-poll\").css(\"display\", \"inline\");\n  \n  $(\"#sendVotePoll\").html(\"Send\");\n\n  var jsonDate=JSON.parse(date);\n\n  $(\"#titlePoll\").text(\"Select a rank\");\n  $(\"#titlePoll\").css(\"text-align\",\"center\");\n\n  cleanPoll();\n\n  var tableOptionPoll=document.getElementById(\"pollsTable\");\n  var countHR=0;\n  for(var tmp in jsonDate.questions_rightanswer){\n\n    if(countHR==1){\n      var hr=document.createElement(\"hr\");\n      tableOptionPoll.appendChild(hr);\n    }\n\n    var spanQuestionText=document.createElement(\"h4\");\n    spanQuestionText.appendChild(document.createTextNode(\"Question:\"));\n    spanQuestionText.setAttribute(\"class\",\"questionRanking\");\n\n    var spanQuestion=document.createElement(\"span\");\n    spanQuestion.appendChild(document.createTextNode(`${jsonDate.questions_rightanswer[tmp].question}`));\n\n    tableOptionPoll.appendChild(spanQuestionText); \n    tableOptionPoll.appendChild(spanQuestion);\n    tableOptionPoll.appendChild(document.createElement(\"br\"));\n\n    var divRank=document.createElement(\"div\");\n    divRank.setAttribute(\"class\",\"div-ranking\");\n\n    for(var i=4;i>0;i--){\n      \n      \n      var radioRank=document.createElement(\"input\");\n      var label=document.createElement(\"label\");\n\n      radioRank.setAttribute(\"type\",\"radio\");\n      radioRank.setAttribute(\"name\",\"rank\"+jsonDate.questions_rightanswer[tmp].select_rank);\n      radioRank.setAttribute(\"id\",`${jsonDate.questions_rightanswer[tmp].select_rank}_${i}`);\n      radioRank.setAttribute(\"value\",`${jsonDate.questions_rightanswer[tmp].select_rank}_${i}`);\n      radioRank.setAttribute(\"style\",\"-webkit-appearance: none;\");\n\n      label.setAttribute(\"for\",`${jsonDate.questions_rightanswer[tmp].select_rank}_${i}`);\n\n\n      var img=document.createElement(\"img\");\n      img.setAttribute(\"src\",`../img/rankIcon/${jsonDate.questions_rightanswer[tmp].select_rankIMG}.png`);\n      img.setAttribute(\"class\",\"rankIcon\");\n\n      label.appendChild(img);\n      \n      divRank.appendChild(radioRank);\n      divRank.appendChild(label);\n      \n      tableOptionPoll.appendChild(divRank);\n\n      countHR=1;\n    }\n\n    \n    \n\n    document.getElementById(\"sendVotePoll\").addEventListener(\"click\",sendVotePollRanking);\n\n  }\n}\n\n// Send the vote of the poll multiple to master\nfunction sendVotePollMultiple(){\n  var optionChecked=$(\"#pollsTable input[type='radio']:checked\").val();\n  socket.emit(\"increaseValueOption\",optionChecked);\n\n  document.getElementById(\"click-poll\").style.display=\"none\";\n};\n\n// Send the vote of the specific ranking poll to master\nfunction sendVotePollRanking(){\n  var arrayValueRank=[];\n\n  $(\".div-ranking\").map(function(){\n    var valueSelectRank=$(this).children('input[type=radio]:checked').attr(\"value\");\n    arrayValueRank.push(valueSelectRank);\n  });\n\n  document.getElementById(\"click-poll\").style.display=\"none\";\n  socket.emit(\"increaseValueRanking\",arrayValueRank);\n};\n\n// clean the tables of poll\nfunction cleanPoll(){\n  $(\"#pollsTable\").empty();\n  $(\"#pollDynamical\").empty();\n}\n\n// create a notice when the master close the poll\nfunction createNotice(typePoll){\n  document.getElementById(\"viewPollDynamical\").style.display=\"none\";\n  document.getElementById(\"click-poll\").style.display=\"none\";\n  var button=document.querySelector(\"#sendVotePoll\");\n  button.innerHTML=\"OK\";\n\n\n  if(typePoll==1){\n    button.removeEventListener(\"click\",sendVotePollRanking);\n  }\n  else if(typePoll==0){\n    button.removeEventListener(\"click\",sendVotePollMultiple);\n  }\n\n  cleanPoll();\n\n  var pollsTable=document.getElementById(\"pollsTable\");\n  var pollDynamical=document.getElementById(\"pollDynamical\");\n\n  var notice=document.createElement(\"h4\");\n  notice.setAttribute(\"class\",\"nes-text is-error\");\n  notice.appendChild(document.createTextNode(\"The poll is closed. Click OK\"))\n\n  var noticeAnother=document.createElement(\"h4\");\n  noticeAnother.setAttribute(\"class\",\"nes-text is-error\");\n  noticeAnother.appendChild(document.createTextNode(\"The poll is closed. Click X\"))\n\n  pollsTable.appendChild(notice);\n  pollDynamical.appendChild(noticeAnother);\n}\n\n\nconst video = document.querySelector(\"video\");\n\n\n\nwindow.onunload = window.onbeforeunload = () => {\n  socket.close();\n};\n\n\n\n\n//# sourceURL=webpack:///./public/slave/livenote-client.js?");

/***/ })

/******/ });
});