class Minimap extends Phaser.Cameras.Scene2D.Camera {
    constructor(x, y, width, height) {
        super(x, y, width, height);
    }

    actulizarPosMinimap(){
        this.scrollX = this.width * 32 / 2 + Math.cos(this.t) * 300
        this.scrollY = this.height * 32 / 2 + Math.sin(this.t) * 300;
        this.t += 0.025;
    }
}

