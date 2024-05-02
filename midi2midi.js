var midi1 = null;
var midi2 = null;
var outputMidi = null;
var addOption = function (dropdownid, text) {
    var optn = document.createElement("OPTION");
    optn.text = text;
    optn.value = text;
    document.getElementById(dropdownid).options.add(optn);
}
var checkOption = function (e) {
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
        console.log('listing inputs');
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            console.log(input.name, midi1.name);
            if (input.value.name == midi1) {
                input.value.onmidimessage = MIDIMessageEventHandler;
                console.log(`connected ${midi1} as input`);
            }
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
window.addEventListener('load', function () {
    if (navigator.requestMIDIAccess({ sysex: true }))
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
    if (event.data[0] == 0xf0) {
        // convert the sysex to string 
        var sysex = "";
        for (var i = 1; i < midiMessage.data.length - 1; i++) {
            sysex += String.fromCharCode(midiMessage.data[i]);
        }
        console.log(sysex);
        return;
    }
    // print the event type
    if (event.data.length == 3) {
        outputMidi.send([event.data[0], event.data[1], event.data[2]]);
    } else if (event.data.length == 2) {
        outputMidi.send([event.data[0], event.data[1]]);
    } else if (event.data.length == 1) {
        outputMidi.send([event.data[0]]);
    }
}