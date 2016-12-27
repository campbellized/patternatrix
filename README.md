# Patternatrix
A MIDI enabled drum machine paired with a 16 step sequencer enables you to make the hottest of beats right within your browser. You can play the drum machine with your QWERTY keyboard by using the keys labeled on the drum pads. If you have MIDI I/O devices connected to your computer, Patternatrix will send and receive notes on channel 10. 

Recording sequences is easy. If the record button is activated, any notes that are played will be recorded to the current step. Pressing play starts the playing the sequence and pressing stop ends playback. The sequncer is currently locked to 120 BPM.

## Requirements
This project uses [WebMidi](https://github.com/cotejp/webmidi) to send and receive MIDI. You can install WebMidi using NPM:
```
npm install webmidi
```
If you install WebMidi using an alternative method then you may have to update the src of the `<script>` tag in `index.html`.
