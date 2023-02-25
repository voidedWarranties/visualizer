const fs = require("fs");
const { AudioContext } = require("web-audio-api"),
    context = new AudioContext;
const createBuffer = require("audio-buffer-from");
const ft = require("fourier-transform/asm");

const { spawn } = require("child_process");
const ffmpegStatic = require("ffmpeg-static");
const { createCanvas } = require("canvas");
const path = require("path");

const audioPath = path.join(__dirname, "test.mp4");
const buf = fs.readFileSync(audioPath);

const bufferSize = 1024;

const sampleRate = 44100;

const maxDecibels = -30;
const minDecibels = -50;
const smoothingTimeConstant = 0.8;

const fps = 24;

const { JSDOM } = require("jsdom");

const jsdom = new JSDOM(fs.readFileSync("index.html", "utf-8"), { runScripts: "dangerously", resources: "usable", url: "file:///" + __dirname, pretendToBeVisual: true });
const { window } = jsdom;

window.addEventListener("load", () => {
    var canvas = createCanvas(bufferSize / 2, 256);
    var ctx = canvas.getContext("2d");

    const ffmpeg = spawn(ffmpegStatic, [
        "-y",
        "-f", "image2pipe",
        "-vcodec", "png",
        "-r", fps,
        "-i", "-",
        "-i", audioPath,
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-r", fps,
        "-c:a", "copy",
        "-qscale", "5",
        path.join(__dirname, "video.mp4")
    ]);
    ffmpeg.stdout.on("data", data => console.log(data.toString()));
    ffmpeg.stderr.on("data", data => console.log(data.toString()));

    context.decodeAudioData(buf, audioBuffer => {
        const channels = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }

        const channel = createBuffer(channels, { channels: 1, sampleRate }).getChannelData(0);

        const ffts = [];
        const samples = [];

        for (let frame = 0; frame < fps * channel.length / sampleRate; frame++) {
            const timeSec = frame / fps;
            const bytePos = Math.floor(timeSec * sampleRate);

            const slice = Array.from(channel.slice(bytePos - 1024, bytePos));
            while (slice.length < bufferSize) {
                slice.push(0);
            }

            const a = 0.16;
            const a0 = (1 - a) / 2;
            const a1 = 1 / 2;
            const a2 = a / 2;
            const w = slice.map((s, n) => a0 - a1 * Math.cos(2 * Math.PI * n) / slice.length + a2 * Math.cos(4 * Math.PI * n) / slice.length);
            const windowed = slice.map((s, n) => s * w[n]);

            const prev = ffts[frame - 1] || new Float32Array(bufferSize / 2);

            const fft = ft(windowed).map((n, i) => smoothingTimeConstant * prev[i] + (1 - smoothingTimeConstant) * Math.abs(n));

            ffts.push(fft);

            const sample = Array.from(fft).map(n => (255 / (maxDecibels - minDecibels)) * (20 * Math.log10(n) - minDecibels)).map(n => Math.round(Math.min(Math.max(n, 0), 255)));

            samples.push(sample);

            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < sample.length; i++) {
                ctx.strokeStyle = "blue";
                ctx.beginPath();
                ctx.moveTo(i, canvas.height);
                ctx.lineTo(i, canvas.height - sample[i]);
                ctx.stroke();
            }

            // window.animate(sample, 0);
            // const data = new Buffer(window.document.getElementById("view").toDataURL().replace("data:image/png;base64,", ""), "base64");

            // ffmpeg.stdin.write(data);
            ffmpeg.stdin.write(canvas.toBuffer())

            console.log(frame, "OK");
        }

        ffmpeg.stdin.end();
    });
});