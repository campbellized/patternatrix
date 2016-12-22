var local = true;
var tempo = 120;
var playing = false;
var recording = true;
var beat = 1;
/* Initialize a sequence */
var sequence = new Array(16);
for (var i = 0; i < 16; i++) {
  sequence[i] = {};
}

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
    if(recording){
        toggleNoteInStep(beat, note);
    }
}

function playSound(note){
    var audio = document.querySelector("audio[data-tone='"+note+"']");

    audio.currentTime = 0;
    audio.play();
}


/* Sequencer */

var ticksPerSecond = tempo / 60;
setInterval(incrementStep, 1000 / ticksPerSecond);

function toggleNoteInStep(step, note){
    if(sequence[step - 1][note]){
        delete sequence[step - 1][note];
    }else{
        sequence[step - 1][note] = 1;
    }
}

function incrementStep(){
    if(playing){
        document.querySelector("input[name='step']:nth-child("+beat+")").checked = true;
        playSoundsInStep(beat);
        // console.log(beat);
        beat %= 16;
        beat++;
    }
}

function playSoundsInStep(step){
    var sounds = Object.keys(sequence[step - 1]);
    var audio;
    for(i = 0; i < sounds.length; i++){
        playSound(sounds[i]);
    }
}

/* Add event listener to sequencer step indicators */
window.addEventListener("click", function(e){
    if(e.srcElement.name !== "step") return;
    beat = e.srcElement.value;
});

/* Add event listener to sequencer controls */
window.addEventListener("click", function(e){
    if(e.srcElement.id === "play") {
        playing = true;
    }else if(e.srcElement.id === "stop") {
        if(playing === false) {
            document.querySelector("input[name='step']:nth-child(1)").checked = true;
            beat = 1;
        }
        playing = false;
    }else{
        return;
    }
});
