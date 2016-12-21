var local = true;

WebMidi.enable(function(err){
    if(err){
        console.log("WebMidi could not be enabled.", err);
    }
});

/* Capture Querty events and generate the appropriate MIDI note */
window.addEventListener("keydown", function(e){
    var note;
    switch(e.keyCode){
        case 65:
            note = "C3";
            break;
        case 87:
            note = "C#3";
            break;
        case 83:
            note = "D3";
            break;
        case 69:
            note = "D#3";
            break;
        case 68:
            note = "E3";
            break;
        case 70:
            note = "F3";
            break;
        case 84:
            note = "F#3";
            break;
        case 71:
            note = "G3";
            break;
        case 89:
            note = "G#3";
            break;
        case 72:
            note = "A3";
            break;
        case 85:
            note = "A#3";
            break;
        case 74:
            note = "B3";
            break;
        default:
            return;
    }
    playMIDI(note);
});

/* Enable the virtual keyboard to send MIDI events */
var pads = document.getElementsByClassName("pads__pad");
for(var i = 0; i < pads.length; i++){
    pads[i].addEventListener("click", function(){
        playMIDI(this.getAttribute("data-note"));
    });
}

function playMIDI(note){
    if(WebMidi && WebMidi.outputs.length){
        output = WebMidi.outputs[0];
        output.playNote(note);
    }
    if(local){
        playSound(note);
    }
}

function playSound(note){
    var audio = document.querySelector("audio[data-tone='"+note+"']");
    audio.play();
}
