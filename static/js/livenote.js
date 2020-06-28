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
    // Set scale
    // console.log(page);
    
 //  const viewport = page.getViewport({ scale });
   

   var desiredWidth = $(window).width();
   var viewport = page.getViewport({ scale: 1, });
   var scale = desiredWidth / viewport.width;
   var viewport = page.getViewport({ scale: scale, });

   canvas.height = viewport.height;
   canvas.width = viewport.width;

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
    document.querySelector('#page-num').textContent = num;
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

// Show Prev Page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
 (pmode == 0) && sendMasterStatus(pageNum);
  queueRenderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  (pmode == 0) && sendMasterStatus(pageNum);
  queueRenderPage(pageNum);
};
function sendMasterStatus(pageNum){
  status.nslide = pageNum;
  socket.emit("event:master", JSON.stringify(status), function (data) {      
    console.log('Message next page sent! '+ status.nslide);
  });
}
// Go FullScreen when clicked on the button
const goFullScreen = () => {
  document.getElementById("pdf-render").requestFullscreen();
};

// Close full screen
function closeFullScreen () {
  if ( document.exitFullscreen) {
    document.exitFullscreen();
  }
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
document.querySelector('#full-screen').addEventListener('click', goFullScreen);


var mousePressed = false;
var lastX, lastY;
var socket = undefined;
var pID = window.location.pathname.split('/')[1];
let status = { "nslide":1 };  
let pmode = -1;

function loadStatus(s){
  status = s
  queueRenderPage(s.nslide);
}
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
    console.log(nwidth+ " "+nheight+" "+s.width+" "+s.height)
  }
}

function InitThis(mode, path, slide) {
    socket = io('ws://'+window.location.host+'/'+pID, { reconnect: true, transports: ['websocket'], 'force new connection': true });
    pmode = mode;
  
    socket.on('connect', function(){
    //socket.emit("event:enter", "userSessionID")
     console.log("client connected to "+pID)
      if (mode == 1) {
        socket.on( "event:start", function (msg) {
          s = JSON.parse(msg)
          console.log("Presentation start "+msg); 
        });
        socket.on( "event:slide", function (msg) {
          console.log("Presentation Change "+msg); 
          s = JSON.parse(msg)
          loadStatus(s);
        });
        socket.on( "event:slide:shape", function (msg) {
          console.log("NEW SHAPE BABY"); 
          s = JSON.parse(msg)
          loadShape(s)
        });
    }});

    $('#pdf-render').mousedown(function (e) {
        mousePressed = true;
        x =  e.pageX - $(this).offset().left
        y =  e.pageY - $(this).offset().top
        Draw(x, y, false);
    });

    $('#pdf-render').mousemove(function (e) {
        if (mousePressed) {
          x =  e.pageX - $(this).offset().left
          y =  e.pageY - $(this).offset().top
          Draw(x, y, true);
          shape['data'].push({"x":x, "y":y});
        }
    });

    $('#pdf-render').mouseup(function (e) {
        mousePressed = false;
        socket.emit("event:master:shape", JSON.stringify(shape), function (data) {      
          console.log('Message shape sent! ');
        });
        shape = {"data":[], "width":$(window).width() , "height": $(window).height()}
    });
	  $('#pdf-render').mouseleave(function (e) {
        mousePressed = false;
        socket.emit("event:master:shape", JSON.stringify(shape), function (data) {      
          console.log('Message shape sent! ');
        });
        shape = {"data":[], "width":$(window).width() , "height": $(window).height()}
    });
    var shape = {"data":[], "width":$(window).width() , "height": $(window).height()}
    // Get Document
    pdfjsLib
    .getDocument(path)
    .promise.then(pdfDoc_ => {
      pdfDoc = pdfDoc_;

      document.querySelector('#page-count').textContent = pdfDoc.numPages;

      renderPage(slide);
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