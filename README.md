# midi2midi

Go to this webpage to connect two MIDI devices: https://schollz.github.com/midi2midi

Amazingly, you can have [websites that fully interop with MIDI specs](https://www.w3.org/TR/webmidi/) (though [not compatiable on all browsers still](https://developer.mozilla.org/en-US/docs/Web/API/MIDIAccess)). I had attempted this kind of thing before using [Go + PortMidi](https://github.com/schollz/pianoai) but it was always tricky getting it to work on different operating systems. Since Chrome is easy to install everywhere, you can actually have chrome everywhere supporting your MIDI devices, with just a little Javascript code.

## License

MIT
