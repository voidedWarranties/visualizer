function updateVideo(wind, url) {
    if (url.includes("youtube.com/watch?")) {
        wind.setVideoURL(url);
    }
}

function start(stream, gUM = false) {
    var wind;

    chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
        chrome.tabs.onUpdated.addListener((id, changeInfo) => {
            if (id === tabs[0].id && changeInfo.url && wind) {
                updateVideo(wind, changeInfo.url);
                chrome.tabs.sendMessage(tabs[0].id, "hide");
            }
        });

        wind = window.open("ext/popup.html", "_blank", "width=1920,height=1080");

        chrome.tabs.sendMessage(tabs[0].id, "hide");

        wind.addEventListener("load", () => {
            wind.onPlayerReady(stream, gUM);
            updateVideo(wind, tabs[0].url);
        });

        wind.addEventListener("beforeunload", () => {
            stream.getTracks().forEach(t => t.stop());
        });
    });
}

chrome.runtime.onMessage.addListener(req => {
    if (req === "start") {
        chrome.tabCapture.capture({ video: true, audio: true }, start);
    } else if (req === "startDesktop") {
        chrome.desktopCapture.chooseDesktopMedia(["screen", "window", "tab", "audio"], (streamId, options) => {
            if (!options.canRequestAudioTrack) return;

            navigator.mediaDevices.getUserMedia({
                audio: {
                    mandatory: {
                        chromeMediaSource: "desktop",
                        chromeMediaSourceId: streamId
                    }
                },
                video: {
                    mandatory: {
                        chromeMediaSource: "desktop",
                        chromeMediaSourceId: streamId
                    }
                }
            }).then(stream => {
                start(stream, true);
            });
        });
    }
});