var videoNode = document.getElementById('video-balloon');
// var videoNode = document.querySelector('.wistia_responsive_padding');
if (videoNode) {
  videoNode.addEventListener('click', function(event){
    event.preventDefault();
  });
}

if (document.getElementById("vol") != undefined )
document.getElementById("vol").addEventListener('click', function(event){
  var myVideo = document.getElementsByTagName('video')[0];
  if (myVideo.muted)
     {
       myVideo.muted = false;
       $("#vol").attr("src","../img/volume.png");
       //
     } 
  else{
    myVideo.muted = true;
    $("#vol").attr("src","../img/mute.png");
    //<img src=""/>
  }
     
});
if (document.getElementById("play") != undefined )
document.getElementById("play").addEventListener('click', function(event){
  var myVideo = document.getElementsByTagName('video')[0];
  if (myVideo.paused){
      myVideo.play();
      $("#play").attr("src","../img/circled-pause.png");
  }else{
      myVideo.pause();
      $("#play").attr("src","../img/play.png");
  }
 });

 if (document.getElementById("size") != undefined )
document.getElementById("size").addEventListener('click', function(event){
  if( $("#liveperson").hasClass("big-video")){
    $("#liveperson").removeClass("big-video");
    $("#liveperson").addClass("small-video");
  
    $("#size").addClass("is-half");
  }else{
    $("#liveperson").removeClass("small-video");
    $("#liveperson").addClass("big-video");
    $("#size").removeClass("is-half");
  }

 });

import interact from 
'https://cdn.interactjs.io/v1.9.20/interactjs/index.js'

interact('.draggable')
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ],
    // enable autoScroll
    autoScroll: true,

    listeners: {
      // call this function on every dragmove event
      move: dragMoveListener,

      // call this function on every dragend event
      end (event) {
       
      }
    }
  })

function dragMoveListener (event) {
  var target = event.target
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  // translate the element
  target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)'

  // update the posiion attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

// this function is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener