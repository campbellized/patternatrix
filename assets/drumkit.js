var jsDrum = (function(window){
    var local = true;
    var sequencer;
    var ui;

    WebMidi.enable(function(err){
        if(err){
            console.log("WebMidi could not be enabled.", err);
        }
    });

    /* Enable the virtual keyboard to send MIDI events */
    var pads = document.getElementsByClassName("pads__pad");
    for(var i = 0; i < pads.length; i++){
        pads[i].addEventListener("click", function(){
            playMIDI(this.getAttribute("data-note"));
        });
    }

    function intialize(){
        sequencer = this.sequencer;
        ui = this.ui;
        // console.log("my sequencer", sequencer);
        // console.log("my ui", ui);
        sequencer.init();
    }

    function playMIDI(note){
        if(WebMidi && WebMidi.outputs.length){
            output = WebMidi.outputs[0];
            output.playNote(note);
        }
        if(local){
            playSound(note);
        }
        if(sequencer.isRecording()){
            sequencer.toggleNoteInStep(note);
        }
    }

    function playSound(note){
        var audio = document.querySelector("audio[data-tone='"+note+"']");
        audio.currentTime = 0;
        audio.play();
    }

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

    return {
        init: intialize,
        playNote: playSound
    };
})(window);

/* Sequencer module */
(function(jsDrum, window){
    var sequencer = {};
    var tempo = 120;
    var playing = false;
    var recording = false;
    var beat = 1;
    var ticksPerSecond = tempo / 60;
    var stepsPerSequence = 16;
    var sequence = new Array(stepsPerSequence);

    function incrementStep(){
        if(playing){
            document.querySelector("input[name='step']:nth-child("+beat+")").checked = true;
            playSoundsInStep(beat);
            beat %= stepsPerSequence;
            beat++;
        }
    }

    function playSoundsInStep(step){
        var sounds = Object.keys(sequence[step - 1]);

        for(i = 0; i < sounds.length; i++){
            jsDrum.playNote(sounds[i]);
        }
    }

    function toggleNoteInStep(note){
        if(sequence[beat - 1][note]){
            delete sequence[beat - 1][note];
        }else{
            sequence[beat - 1][note] = 1;
        }
        jsDrum.ui.togglePad(note);
    }

    function initialize(){
        for (var i = 0; i < stepsPerSequence; i++) {
          sequence[i] = {};
        }
        setInterval(incrementStep, 1000 / ticksPerSecond);
    }
    sequencer.tempo = function(){return tempo;};
    sequencer.isPlaying = function(){return playing;};
    sequencer.isRecording = function(){return recording;};
    sequencer.currBeat = function(){return beat;};
    sequencer.sequence = function(){return sequence;};
    sequencer.toggleNoteInStep = toggleNoteInStep;
    sequencer.init = initialize;

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
        }else if(e.srcElement.id === "record"){
            e.srcElement.classList.toggle("active");
            recording = !recording;
        }else{
            return;
        }
    });

    /* Add event listener to sequencer step indicators */
    window.addEventListener("click", function(e){
        if(e.srcElement.name !== "step") return;
        beat = e.srcElement.value;
        jsDrum.ui.deactivatePads();
        jsDrum.ui.activatePadsInStep(beat);
    });

    jsDrum.sequencer = sequencer;

    return jsDrum;
})(jsDrum, window);

/* UI module */
(function(jsDrum, document){
    var ui = {};

    function activatePad(note){
        var p = document.querySelector(".pads__pad[data-note='"+note+"']");
        p.classList.add("active");
    }

    function deactivatePad(note){
        var p = document.querySelector(".pads__pad[data-note='"+note+"']");
        p.classList.remove("active");
    }

    function togglePad(note){
        var p = document.querySelector(".pads__pad[data-note='"+note+"']");
        p.classList.toggle("active");
    }

    function activatePadsInStep(step){
        var sequence = jsDrum.sequencer.sequence();
        var pads = Object.keys(sequence[jsDrum.sequencer.currBeat() - 1]);

        for(i = 0; i < pads.length; i++){
            activatePad(pads[i]);
        }
    }

    function deactivatePads(){
        var activePads = document.querySelectorAll(".pads__pad.active");

        [].forEach.call(activePads, function(el) {
            deactivatePad(el.getAttribute("data-note"));
        });
    }

    ui.togglePad = togglePad;
    ui.activatePadsInStep = activatePadsInStep;
    ui.deactivatePads = deactivatePads;
    jsDrum.ui = ui;

    return jsDrum;
})(jsDrum, document);

jsDrum.init();
