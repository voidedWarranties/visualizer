// Expected to be defined within implementations:
// graph, ctx
// context, analyser
// song

const colorThief = new ColorThief();

// PIXI Init
var container;
var bars;
var debug;
var projectile;
var touhou;

function loadImage(url) {
    return new Promise(resolve => {
        const textImage = new Image();
        textImage.src = url;
        textImage.crossOrigin = "anonymous";

        const td = 700;
        const textCanvas = document.createElement("canvas");
        textCanvas.width = td;
        textCanvas.height = td;
        const textCtx = textCanvas.getContext("2d");

        textImage.onload = () => {
            textCtx.drawImage(textImage, 0, 0, td, textImage.height * td / textImage.width);
            resolve(textCanvas);
        }
    });
}

function loadTextures() {
    const textures = ["/triangle.png"];

    return Promise.all(textures.map(t => loadImage(t).then(im => new PIXI.Texture.from(im))));
}

const app = new PIXI.Application({
    width: 640,
    height: 480,
    transparent: true,
    resolution: window.devicePixelRatio || 1,
    view: document.getElementById("view"),
    resizeTo: window
});

app.stage.sortableChildren = true;

app.ticker.add(() => {
    if (container && bars && debug && projectile) {
        container.update(dataArray, delta);
        bars.update(dataArray, delta);
        debug.update(dataArray, delta);
        projectile.update(dataArray);
        touhou.update(dataArray, delta);
    }
});

loadImage("/firework.png").then(image => {
    projectile = new ProjectileContainer(app, new PIXI.Texture.from(image));
    projectile.zIndex = 1;
    app.stage.addChild(projectile);
});

loadTextures().then(textures => {
    container = new TriangleContainer(app, textures, 5);
    container.zIndex = 0;
    app.stage.addChild(container);
    container.alpha = container.baseAlpha;

    bars = new BarContainer(app, bufferLength);
    bars.zIndex = 2;
    app.stage.addChild(bars);

    debug = new DebugContainer(app, bufferLength);
    debug.zIndex = 3;
    app.stage.addChild(debug);
    debug.alpha = 0;

    touhou = new TouhouContainer(app);
    app.stage.addChild(touhou);
    touhou.alpha = 0;

    window.onresize = () => {
        bars.updateBars();
        debug.updateBars();
    }

    app.ticker.add(animate);
});

// Animate
// Web Audio
const fftSize = 1024;
const bufferLength = fftSize / 2;
var graphX = 0;

var lastY = 0;
var lastDelta = 0;

var actHistory = [];
var historyLimit = 10;

var dataArray = new Uint8Array(bufferLength);
var delta = 0;

var lastChanged = Date.now();

function getColors(video) {
    return new Promise(resolve => {
        const tmpCanvas = document.createElement("canvas");
        const tmpCtx = tmpCanvas.getContext("2d");
        tmpCanvas.width = 64;
        tmpCanvas.height = 64;
        tmpCtx.drawImage(video, 0, 0, 64, 64);

        const tmpImage = new Image();
        tmpImage.src = tmpCanvas.toDataURL();

        tmpImage.onload = () => {
            const colors = colorThief.getPalette(tmpImage);
            resolve(colors);
        }
    });
}

function commonAnimate(video) {
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    const active = getActiveFrequencies(dataArray);

    const graphY = graph.height - (active * graph.height / bufferLength);
    ctx.lineWidth = 5;

    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(graphX - 1, lastY);
    ctx.lineTo(graphX, graphY);
    ctx.stroke();

    if (actHistory.length > 0) delta = active - (actHistory.reduce((acc, curr) => acc + curr, 0) / actHistory.length);

    const deltaY = graph.height - (((delta / bufferLength) * graph.height) + graph.height / 2);

    ctx.strokeStyle = delta > 0 ? "green" : "red";
    ctx.beginPath();
    ctx.moveTo(graphX - 1, lastDelta);
    ctx.lineTo(graphX, deltaY);
    ctx.stroke();

    if (delta > 0) {
        ctx.fillStyle = `rgb(0, 0, ${(delta / 20) * 255})`;
        ctx.fillRect(graphX, 0, 5, 5);
    }

    lastY = graphY;
    lastDelta = deltaY;

    if (actHistory.length >= historyLimit) actHistory.shift();

    actHistory.push(active);

    if (graphX === graph.width) {
        graphX = 0;
        clearCanvas(graph, ctx);
    } else {
        graphX++;
    }

    if (song && video && song.isOnBeat() && Date.now() - lastChanged > 300) {
    // if (delta / 255 > 0.1 && Date.now() - lastChanged > 300) {
        getColors(video).then(colors => {
            container.setColors(colors);
            bars.updateColor(colors);
        });

        lastChanged = Date.now();
    }
}

// Utils
function clearCanvas(canvas, ctx) {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getActiveFrequencies(array, thresh = 128) {
    return array.filter(val => val > thresh).length;
}

// Colors
var lastVideoId;

function setVideoURL(url) {
    const vRegex = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const videoId = url.match(vRegex)[2];

    if (videoId === lastVideoId) return;

    const image = new Image();
    image.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;

    image.onload = () => {
        const colors = colorThief.getPalette(image);
        container.setColors(colors);
        bars.updateColor(colors);
        projectile.colors = colors.map(rgbToHex);
    }

    lastVideoId = videoId;
}

var options = {
    debugDisplays(close) {
        debug.alpha = close ? 0 : 1;
        graph.style.display = close ? "none" : "";
    },
    showTriangles(open) {
        container.alpha = open ? container.baseAlpha : 0;
    }
}