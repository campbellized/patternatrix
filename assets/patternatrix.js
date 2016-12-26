/**
 * This is the sound module. It is the main module and handles MIDI IO as well
 * as sound playback.
 */
var Patternatrix = (function(window){
    /**
     * If local is disabled, no sound will be generated. If a MIDI output is
     * available, MIDI notes will still be sent.
     */
    var sequencer;
    var ui;
    var local = true;
    var midiChannel = 10;
    var midiIn;
    var midiOut;

    WebMidi.enable(function(err){
        if(err){
            console.log("WebMidi could not be enabled.", err);
        }else{
            midiIn = WebMidi.inputs[0];
            midiOut = WebMidi.outputs[0];
        }
    });

    /**
     * Enable the buttons in the DOM to send MIDI events
     */
    var pads = document.getElementsByClassName("pads__pad");
    for(var i = 0; i < pads.length; i++){
        pads[i].addEventListener("click", function(){
            playMIDI(this.getAttribute("data-note"));
        });
    }

    /**
     *  Initializes the drum machine and its sequencer.
     */
    function intialize(){
        sequencer = this.sequencer;
        ui = this.ui;
        sequencer.init();
    }

    /**
     *  A midi note will be sent out on all channels. If local is enabled,
     *  the drum machine will also play a sound. If the sequencer is set to
     *  record, then a note will be added to the pattern at the current step.
     *  If a note already exists, it will be deleted from the current step.
     */
    function playMIDI(note){
        if(WebMidi && midiOut){
            output.playNote(note, midiChannel);
        }

        if(local){
            playSound(note);
        }

        if(sequencer.isRecording()){
            sequencer.toggleNoteInStep(note);
        }
    }

    /**
     *  Play the <audio> tag associated with a note.
     */
    function playSound(note){
        var audio = document.querySelector("audio[data-tone='"+note+"']");

        if(audio){
            audio.currentTime = 0;
            audio.play();
        }
    }

    /* Capture QWERTY events and generate the appropriate MIDI note. */
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

    if(midiIn){
        input.addListener('noteon', midiChannel,
          function (e) {
            playMIDI(e.note.name + e.note.octave);
          }
        );
    }

    return {
        init: intialize,
        playNote: playSound
    };
})(window);

/**
 * This is the sequencer module. It keeps tempo, and enables the app to record
 * or playback notes in a pattern.
 */
(function(app, window, document){
    var sequencer = {};
    var tempo = 120;
    var playing = false;
    var recording = false;
    var beat = 1;
    var ticksPerSecond = tempo / 60;
    var stepsPerSequence = 16;
    var sequence = new Array(stepsPerSequence);

    /**
     * Go to the next step in the pattern and play its contents.
     */
    function incrementStep(){
        if(playing){
            document.querySelector("input[name='step']:nth-of-type("+beat+")").checked = true;
            playSoundsInStep(beat);
            beat %= stepsPerSequence;
            beat++;
        }
    }

    /**
     * Play each note in this step of the pattern.
     */
    function playSoundsInStep(step){
        var sounds = Object.keys(sequence[step - 1]);

        for(i = 0; i < sounds.length; i++){
            app.playNote(sounds[i]);
        }
    }

    /**
     * Add a note to the current step of the pattern. If the note already
     * exists, delete it.
     */
    function toggleNoteInStep(note){
        if(sequence[beat - 1][note]){
            delete sequence[beat - 1][note];
        }else{
            sequence[beat - 1][note] = 1;
        }
        app.ui.togglePad(note);
    }

    /**
     * Create an empty pattern and start the clock.
     */
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


    /**
     * Add event listeners to the sequencer controls
     */
    window.addEventListener("click", function(e){
        if(e.srcElement.id === "play") {
            playing = true;
        }else if(e.srcElement.id === "stop") {
            if(playing === false) {
                document.querySelector("input[name='step']:nth-of-type(1)").checked = true;
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

    /**
     * Add event listener to sequencer step indicators. The sequencer can be
     * advanced manually by clicking on the step indicators.
     */
    window.addEventListener("click", function(e){
        if(e.srcElement.name !== "step") return;
        beat = e.srcElement.value;
        app.ui.deactivatePads();
        app.ui.activatePadsInStep(beat);
    });

    app.sequencer = sequencer;

    return app;
})(Patternatrix, window, document);

/**
 * This is the UI module for the drum machine. It handles tasks such as
 * highlighting active elements on the UI, or selecting settings.
 */
(function(app, document){
    var ui = {};

    /**
     * Highlight a single pad on the DOM keyboard.
     */
    function activatePad(note){
        var p = document.querySelector(".pads__pad[data-note='"+note+"']");
        p.classList.add("active");
    }

    /**
     * Remove any highlighting from a single pad on the DOM keyboard.
     */
    function deactivatePad(note){
        var p = document.querySelector(".pads__pad[data-note='"+note+"']");
        p.classList.remove("active");
    }

    /**
     *  Toggle any highlighting on a single pad on the DOM keyboard.
     */
    function togglePad(note){
        var p = document.querySelector(".pads__pad[data-note='"+note+"']");
        p.classList.toggle("active");
    }

    /**
     * For each note in the current step, highlight its pad on the DOM keyboard.
     */
    function activatePadsInStep(step){
        var sequence = app.sequencer.sequence();
        var pads = Object.keys(sequence[app.sequencer.currBeat() - 1]);

        for(i = 0; i < pads.length; i++){
            activatePad(pads[i]);
        }
    }

    /**
     * Remove highlighting from all pads on the DOM keyboard.
     */
    function deactivatePads(){
        var activePads = document.querySelectorAll(".pads__pad.active");

        [].forEach.call(activePads, function(el) {
            deactivatePad(el.getAttribute("data-note"));
        });
    }

    ui.togglePad = togglePad;
    ui.activatePadsInStep = activatePadsInStep;
    ui.deactivatePads = deactivatePads;
    app.ui = ui;

    return app;
})(Patternatrix, document);

Patternatrix.init();
