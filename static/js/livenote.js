let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

let status = { "nslide":1 };  

const scale = 2,
  canvas = document.querySelector('#pdf-render'),
  ctx = canvas.getContext('2d');

// Render the page
const renderPage = num => {
  pageIsRendering = true;

  // Get page
  pdfDoc.getPage(num).then(page => {
    // Set scale
    // console.log(page);
    const viewport = page.getViewport({ scale });
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
  queueRenderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  status.nslide = pageNum;

  socket.emit("event:master", JSON.stringify(status), function (data) {      
    console.log('Message next page sent! '+ status.nslide);
  });
  
  queueRenderPage(pageNum);

};

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


// draw on canvas 
var mousePressed = false;
var lastX, lastY;
var socket = io.connect('ws://127.0.0.1:8080', { transports: ['websocket'] });
var pID = -1;

function loadStatus(s){
  status = s
  
  queueRenderPage(s.nslide);
}

function InitThis(mode, path, slide) {
    var info = window.location.pathname.split('/')[1].split("-");
    pID = info[1];
    socket.on('connect', function(){
      socket.emit("addToPresentation", pID)
      if (mode == 1) {
        socket.on( "event:start", function (msg) {
            console.log("Presentation start "+msg); 
          //  socket.emit('presentation:client',  JSON.stringify({mode:mode, sessionid: info[0], presentation:  }), function(result) {});
        });
        socket.on( "event:slide", function (msg) {
          console.log("Presentation Change "+msg); 
          loadStatus(JSON.parse(msg));
        //  socket.emit('presentation:client',  JSON.stringify({mode:mode, sessionid: info[0], presentation:  }), function(result) {});
      });
    }});
    $('#pdf-render').mousedown(function (e) {
        mousePressed = true;
        Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
    });

    $('#pdf-render').mousemove(function (e) {
        if (mousePressed) {
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
        }
    });

    $('#pdf-render').mouseup(function (e) {
        mousePressed = false;
    });
	    $('#pdf-render').mouseleave(function (e) {
        mousePressed = false;
    });

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