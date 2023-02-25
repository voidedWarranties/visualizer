function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function hsvDist(c1, c2) {
    return Math.abs(c2.h - c1.h);
}

function getClosestColor(color, colors) {
    const sorted = colors.sort((a, b) => hsvDist(color, a) - hsvDist(color, b));
    return sorted.slice(0, 3)[Math.floor(Math.random() * 3)];
}

class TriangleContainer extends PIXI.Container {
    constructor(app, textures, factor = 2) {
        super();
        this.app = app;
        this.textures = textures;
        this.triangles = [];
        this.velocities = [];
        this.colors = bluePalette;
        this.factor = factor;

        this.sortableChildren = true;

        this.baseVelocity = 10;

        this.addTriangles();

        this.colorThief = new ColorThief();

        this.baseAlpha = 1;
    }

    get targetTriangles() {
        return Math.floor(this.app.renderer.width / this.factor);
    }

    addTriangles(randVelocity = true) {
        for (var i = this.triangles.length; i < this.targetTriangles; i++) {
            const t = new PIXI.Sprite(this.textures[Math.floor(Math.random() * this.textures.length)]);
            this.resetTriangle(t);
            this.addChild(t);

            this.triangles.push(t);
            if (randVelocity) {
                this.velocities[i] = Math.floor(Math.random() * this.app.renderer.height / 21.6); // 1080 height, 50 max velocity for all to reach top; 1080 / 50
            } else {
                this.velocities[i] = 0;
                t.x = Math.floor(Math.random() * this.app.renderer.width);
                t.y = Math.floor(Math.random() * this.app.renderer.height);
                t.alpha = 0;

                const tCurrent = { alpha: 0 };

                new TWEEN.Tween(tCurrent)
                    .to({ alpha: 1 }, 300)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onUpdate(() => {
                        t.alpha = tCurrent.alpha;
                    })
                    .start();
            }
        }
    }

    resetTriangle(t) {
        if (this.triangles.length > this.targetTriangles) {
            this.removeTriangle(t);
            return;
        }

        const factor = (Math.floor(Math.random() * 35) + 5) / 100;
        t.scale = new PIXI.Point(factor, factor);
        t.anchor.set(0.5);

        t.x = Math.floor(Math.random() * this.app.renderer.width);
        t.y = this.app.renderer.height + t.height;

        t.tint = this.colors[Math.floor(Math.random() * this.colors.length)];
        t.zIndex = Date.now(); // lol
    }

    removeTriangle(t) {
        this.removeChild(t);
        this.triangles = this.triangles.filter(t => t.parent);
    }

    setColors(colors, fade = false) {
        const colorsHSV = colors.map(c => colorsys.rgbToHsv({ r: c[0], g: c[1], b: c[2] })[0]);

        if (fade) {
            this.triangles.forEach(t => {
                const currentHSV = colorsys.hexToHsv(("00000" + t.tint.toString(16)).substr(-6));
                const targetHSV = getClosestColor(currentHSV, colorsHSV);
    
                const update = () => {
                    t.tint = parseInt(colorsys.hsvToHex(currentHSV).slice(1), 16);
                };
    
                if (Math.abs(targetHSV.h - currentHSV.h) >= 100) {
                    const tCurrent = { alpha: 1 };
                    new TWEEN.Tween(tCurrent)
                        .to({ alpha: 0 }, 300)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .onUpdate(() => {
                            t.alpha = tCurrent.alpha;
                        })
                        .onComplete(() => {
                            this.removeTriangle(t);
                        }).start();
                    return;
                }
    
                new TWEEN.Tween(currentHSV)
                    .to(targetHSV, 500)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onUpdate(update)
                    .start();
            });
        }

        this.colors = colors.map(rgbToHex);
    }

    update(dataArray, delta) {
        this.triangles.forEach((t, idx) => {
            if (delta > 0) this.velocities[idx] = Math.max(this.velocities[idx], Math.min(delta * 8 * t.scale.x, 24 * t.scale.x));

            t.y -= this.velocities[idx] + this.baseVelocity * t.scale.x;
            this.velocities[idx] *= 0.92;

            if (delta !== 0 && this.baseVelocity < 20) {
                this.baseVelocity++;
            } else if (delta === 0 && this.baseVelocity > 12) {
                this.baseVelocity--;
            }

            if (t.y < -t.height) {
                this.resetTriangle(t);
            }
        });

        if (this.triangles.length < this.targetTriangles) {
            this.addTriangles(false);
        }

        TWEEN.update();
    }
}