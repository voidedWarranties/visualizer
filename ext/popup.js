// GLOBALS
//////////

// Secondary Window
const graph = document.getElementById("graph");
const ctx = graph.getContext("2d");
clearCanvas(graph, ctx);

// Web Audio
var analyser, video, song;

function onPlayerReady(stream, gUM) {
    video = document.getElementById("background");
    video.srcObject = stream;

    const context = new AudioContext();
    const src = stream ? context.createMediaStreamSource(stream) : context.createMediaElementSource(video);
    analyser = context.createAnalyser();

    src.connect(analyser);
    if (!gUM) {
        analyser.connect(context.destination);
    }

    song = new stasilo.BeatDetector(context, src, {
        sens: 5.0,
        visualizerFFTSize: 256,
        analyserFFTSize: 256,
        passFreq: 600
    });

    analyser.fftSize = fftSize;
}

function animate() {
    commonAnimate(video);
}