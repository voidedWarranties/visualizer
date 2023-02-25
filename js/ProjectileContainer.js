class ProjectileContainer extends PIXI.Container {
    constructor(app, texture) {
        super();
        this.app = app;
        this.texture = texture;

        this.lastData = [];

        this.projectiles = [];

        this.colors = bluePalette;
    }

    createSprite(x, y, angleX, angleY, velocity, color, rotation = 0, gravity = 0) {
        const p = new PIXI.Sprite(this.texture);
        p.width = 32;
        p.height = 32;
        p.x = x;
        p.y = y;
        p.tint = color;

        p.pivot = new PIXI.Point(p.width / 2, p.height / 2);
        p.angle = rotation;

        this.addChild(p);
        this.projectiles.push({ p, angle: { x: angleX, y: angleY }, velocity, gravity });
    }

    update(dataArray) {
        const poly = true;

        dataArray = Array.from(dataArray);

        const deltas = dataArray.map((val, i) => val - this.lastData[i]);
        const deltaFiltered = deltas.slice(0, deltas.length * 0.75).map(d => d / 255).filter(d => d > 0.03);

        const originX = Math.random() * this.app.renderer.width;
        const originY = Math.random() * this.app.renderer.height;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];

        if (poly && deltaFiltered.length > 5) {
            const avg = deltaFiltered.reduce((acc, curr) => acc + curr, 0) / deltaFiltered.length;
            const sides = Math.floor(8 * deltaFiltered.length / deltas.length) + 3;

            const angles = getPolygonAngles(Math.random() * 2 * Math.PI, sides, Math.min(deltaFiltered.length, 100));

            for (let i = 0; i < angles.length; i++) {
                const angle = angles[i];
                const velocity = ((200 * avg) + 5) / 2;

                this.createSprite(originX, originY, angle[0], angle[1], velocity, color);
            }
        } else {
            const offset = Math.random() * 2 * Math.PI;

            for (var i = 0; i < dataArray.length * 0.75; i++) {
                const delta = deltas[i];
                const ratio = delta / 255;

                if (ratio > 0.03) {
                    const angle = ((i / (dataArray.length * 0.75)) * 2 * Math.PI) + offset;
                    const velocity = ((200 * ratio) + 5) / 2;

                    this.createSprite(originX, originY, Math.cos(angle), Math.sin(angle), velocity, color, angle, 5);
                }
            }
        }

        this.projectiles.forEach(p => {
            p.p.x += p.angle.x * p.velocity;
            p.p.y += p.angle.y * p.velocity;
            p.p.y += p.gravity;

            p.gravity += 0.01;

            p.velocity *= 0.97;

            if (p.velocity < 5 && !p.tween) {
                const pCurrent = { alpha: 1 };

                p.tween = new TWEEN.Tween(pCurrent)
                    .to({ alpha: 0 }, 750)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onUpdate(() => {
                        p.p.alpha = pCurrent.alpha;
                    })
                    .onComplete(() => {
                        this.removeChild(p.p);
                        this.projectiles = this.projectiles.filter(p => p.p.parent);
                    })
                    .start();
            }
        });

        this.lastData = dataArray;
    }
}