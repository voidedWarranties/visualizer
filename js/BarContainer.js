class BarContainer extends PIXI.Container {
    constructor(app, bufferLength) {
        super();

        this.app = app;
        this.bars = [];

        this.currentColor = { h: 0, s: 0, v: 100 };

        this.barWidth = 8;

        this.addBars(bufferLength);
    }

    addBars(bufferLength) {
        for (var i = 0; i < bufferLength; i++) {
            const bar = new PIXI.Sprite(PIXI.Texture.WHITE);

            bar.anchor.set(0.5);
            bar.height = 0;
            bar.width = this.barWidth;

            bar.x = this.app.renderer.width;
            bar.y = this.app.renderer.height;

            bar.alpha = 0.33;

            bar.pivot = new PIXI.Point(this.barWidth / 2, 0);

            const wrap = 20;
            bar.angle = -(90 * wrap / bufferLength) * (i % (bufferLength / wrap));

            this.addChild(bar);
            this.bars.push(bar);
        }
    }

    updateBars() {
        this.bars.forEach(b => {
            b.x = this.app.renderer.width;
            b.y = this.app.renderer.height;
            b.pivot = new PIXI.Point(this.barWidth / 2, 0);
        });
    }

    update(dataArray, delta) {
        this.bars.forEach((b, idx) => {
            b.height = (dataArray[idx] / 255) * this.app.renderer.height;
        });
    }

    updateColor(colors) {
        const hsvColors = colors.map(c => colorsys.rgbToHsv({ r: c[0], g: c[1], b: c[2] })[0]);
        const target = hsvColors.sort((a, b) => Math.abs(this.currentColor.h - a.h) - Math.abs(this.currentColor.h - b.h)).find(c => c.v >= 40);

        if (!target) return;

        new TWEEN.Tween(this.currentColor)
            .to(target, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.bars.forEach(b => {
                    b.tint = parseInt(colorsys.hsvToHex(this.currentColor).slice(1), 16);
                });
            })
            .start();
    }
}