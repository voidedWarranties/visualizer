chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg === "hide") {
        document.getElementsByClassName("ytp-fullscreen-button")[0].click();
        const block = ["mouseover", "mousemove", "mouseleave"];
        block.forEach(blocked => {
            document.getElementById("movie_player").addEventListener(blocked, event => {
                event.stopPropagation();
            }, true);
        });

        var remove = [
            "ytp-gradient-top",
            "ytp-chrome-top",
            "ytp-gradient-bottom",
            "ytp-chrome-bottom",
            "ytp-player-content"
        ];

        remove.forEach(className => {
            [].forEach.call(document.getElementsByClassName(className), element => {
                element.style.display = "none";
            });
        });
    } else if(msg === "check") {
        const video = document.querySelector("video");
        if (!video) return sendResponse("die");

        const stream = video.captureStream();

        const wind = window.open("about:blank");
        wind.document.open();
        wind.document.write("<style>body { background-color: black; }</style><video id='mirror' autoplay style='width: 100%; height: 100%'></video>");
        wind.document.close();

        wind.document.getElementById("mirror").srcObject = stream;

        sendResponse("done");
    }
});