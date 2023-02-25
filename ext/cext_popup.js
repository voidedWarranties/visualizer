document.getElementById("open").onclick = () => send("start");
document.getElementById("open-desktop").onclick = () => send("startDesktop");

function send(req) {
    chrome.runtime.sendMessage(req);
}

function sendActive(req) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, req);
    });
}
