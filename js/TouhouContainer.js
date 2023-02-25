class TouhouContainer extends PIXI.Container {
    constructor(app) {
        super();
        this.app = app;

        this.bullets = [];

        this.swipes = 0;
        this.lastSwipe = 0;
    }

    update(dataArray, delta) {
        if (delta / 255 > 0.1) {
            const angles = getPolygonAngles(Math.random() * 2 * Math.PI, Math.floor(delta / 255 * 5) + 3, 40);

            for (const angle of angles) {
                const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
                sprite.x = this.app.renderer.width / 2;
                sprite.y = this.app.renderer.height / 2;
                sprite.tint = 0x3366ff;
                this.addChild(sprite);

                this.bullets.push({
                    sprite,
                    angle,
                    velocity: (delta / 255) * 30
                });
            }
        }

        if (delta / 255 > 0.2 && Date.now() - this.lastSwipe >= 1000) {
            const bullets = 80;

            var angle = Math.PI * 3 / 2;

            for (let i = 0; i < bullets; i++) {
                angle += (this.swipes % 2 === 0 ? -1 : 1) * (Math.PI * 3 / 2) / bullets;

                const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
                sprite.x = this.app.renderer.width / 2;
                sprite.y = this.app.renderer.height / 2;
                sprite.tint = 0x800813;
                this.addChild(sprite);

                this.bullets.push({
                    sprite,
                    angle: [Math.cos(angle), Math.sin(angle)],
                    velocity: 12,
                    start: Date.now() + (i / bullets) * 300
                });
            }

            this.swipes = (this.swipes + 1) % 2;
            this.lastSwipe = Date.now();
        }

        this.bullets.forEach(b => {
            if (b.start > Date.now()) return;

            b.sprite.x += b.angle[0] * b.velocity;
            b.sprite.y += b.angle[1] * b.velocity;

            b.velocity *= 0.97;

            if (b.velocity < 5 && !b.tween) {
                const bCurrent = { alpha: 1 };

                b.tween = new TWEEN.Tween(bCurrent)
                    .to({ alpha: 0 }, 750)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onUpdate(() => {
                        b.sprite.alpha = bCurrent.alpha;
                    })
                    .onComplete(() => {
                        this.removeChild(b.sprite);
                        this.bullets = this.bullets.filter(b => b.sprite.parent);
                    })
                    .start();
            }
        });
    }
}