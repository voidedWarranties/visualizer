class DebugContainer extends PIXI.Container {
    constructor(app, bufferLength) {
        super();

        this.app = app;
        this.bars = [];

        this.barWidth = app.renderer.width / bufferLength / 2;

        this.addBars(bufferLength);
    }

    addBars(bufferLength) {
        for (var i = 0; i < bufferLength; i++) {
            const bar = new PIXI.Sprite(PIXI.Texture.WHITE);

            bar.anchor.set(0.5, 1);
            bar.height = 0;
            bar.width = this.barWidth;

            bar.x = i * this.barWidth;
            bar.y = this.app.renderer.height;

            bar.alpha = 0.7;
            bar.tint = i % (bufferLength / 8) === 0 ? 0xffffff : 0x0000ff;

            this.addChild(bar);
            this.bars.push(bar);
        }
    }

    updateBars() {
        this.barWidth = this.app.renderer.width / bufferLength / 2;

        this.bars.forEach((b, idx) => {
            b.width = this.barWidth;
            b.x = idx * this.barWidth;
            b.y = this.app.renderer.height;
        });
    }

    update(dataArray) {
        this.bars.forEach((b, idx) => {
            b.height = 5 + (dataArray[idx] / 255) * this.app.renderer.height / 4;
        });
    }
}