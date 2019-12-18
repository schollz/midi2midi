var midi1 = null;
var midi2 = null;
var outputMidi = null;
var addOption = function(dropdownid, text) {
    var optn = document.createElement("OPTION");
    optn.text = text;
    optn.value = text;
    document.getElementById(dropdownid).options.add(optn);
}
var checkOption = function(e) {
    console.log(e);
    if (e.target.id == "controller")
        midi1 = document.getElementById("controller").value;
    if (e.target.id == "controllee")
        midi2 = document.getElementById("controllee").value;
    if (midi1 == midi2) {
        alert("cannot be the same")
        return;
    }
    if (midi1 != null && midi2 != null) {
        console.log("setting up")
        var inputs = midiAccess.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            if (input.value.name == midi1)
                input.value.onmidimessage = MIDIMessageEventHandler;
        }
        var outputs = midiAccess.outputs.values();
        for (var output = outputs.next(); output && !output.done; output = outputs.next()) {
            console.log(output);
            if (midi2 == output.value.name)
                outputMidi = midiAccess.outputs.get(output.value.id);
        }
        document.getElementById("connected").innerText = "connected";
    }
}
var midiAccess = null;
window.addEventListener('load', function() {
    if (navigator.requestMIDIAccess)
        navigator.requestMIDIAccess().then(onMIDIInit, onMIDIReject);
    else {
        document.getElementById("connected").innerText = "No MIDI support present in your browser."
        document.getElementById("connectioninfo").style.display = "none";
        return;
    }
    document.getElementsByTagName('select')[0].onchange = checkOption
    document.getElementsByTagName('select')[1].onchange = checkOption
});

function onMIDIInit(midi) {
    midiAccess = midi;
    var haveAtLeastOneDevice = false;
    var inputs = midiAccess.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        console.log(input);
        addOption("controller", input.value.name)
        haveAtLeastOneDevice = true;
    }
    var outputs = midiAccess.outputs.values();
    for (var output = outputs.next(); output && !output.done; output = outputs.next()) {
        console.log(output);
        addOption("controllee", output.value.name)
    }
    if (!haveAtLeastOneDevice) {
        document.getElementById("connected").innerText = "No MIDI input devices present.";
        document.getElementById("connectioninfo").style.display = "none";
    }
}

function onMIDIReject(err) {
    document.getElementById("connected").innerText = "The MIDI system failed to start.";
    document.getElementById("connectioninfo").style.display = "none";
}

function MIDIMessageEventHandler(event) {
    // Mask off the lower nibble (MIDI channel, which we don't care about)
    switch (event.data[0] & 0xf0) {
        case 0x90:
            if (event.data[2] != 0) { // if velocity != 0, this is a note-on message
                noteOn(event.data);
                return;
            }
            // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
        case 0x80:
            noteOff(event.data);
            return;
    }
}

function noteOn(e) {
    if (outputMidi != null)
        outputMidi.send(e);
}

function noteOff(e) {
    if (outputMidi != null)
        outputMidi.send(e);
}