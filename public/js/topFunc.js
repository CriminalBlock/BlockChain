// When the user clicks on the button, scroll to the top of the document
function topFunc() {

var location = document.getElementById("topBtn");
window.scrollTop ({ top: 'top', left: 0, behavior: 'smooth' }); = 0;
}
var topBtn = $('#topBtn')
var delay = 500;
topBtn.on('click', function(){
  $('html,body').stop().animate({scrollTop:0}, delay);
});

function topBtn() {
  // var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += "responsive";
  } else {
    x.className = "topnav";
  }
}
