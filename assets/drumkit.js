function playSound(e){
    const audio = document.querySelector("audio[data-key='"+e.keyCode+"']");
    if(!audio) return;

    audio.play();
}

const keys = Array.from(document.querySelectorAll(".pads__pad"));

window.addEventListener("keydown", function(e){
    playSound(e);
});
