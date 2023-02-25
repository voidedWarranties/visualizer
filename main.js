const { app, BrowserWindow } = require("electron");
const http = require("http");
const fs = require("fs");
const config = require("./config.json");

const mimes = {
    js: "application/javascript",
    html: "text/html",
    png: "image/png"
};

const server = http.createServer((req, res) => {
    const file = __dirname + req.url;
    if (!fs.existsSync(file)) return res.end("404");

    const ext = req.url.split(".").slice(-1);

    res.writeHead(200, {
        "Content-Type": mimes[ext]
    });

    res.end(fs.readFileSync(file));
});

server.listen(4200);

app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

function createWindow() {
    const win = new BrowserWindow({
        width: 640,
        height: 480,
        webPreferences: {
            webSecurity: false,
            nativeWindowOpen: true,
            nodeIntegration: true,
            additionalArguments: [config.playlist]
        }
    });

    win.setMenuBarVisibility(false);

    win.maximize();

    // win.loadFile("index.html");
    win.loadURL("http://localhost:4200/index.html")
}

app.whenReady().then(createWindow);