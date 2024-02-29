class Minimap extends Phaser.Cameras.Scene2D.Camera {
  constructor(x, y, width, height) {
    super(x, y, width, height);
  }

  actulizarPosMinimap(jugador) {
    this.scrollX = jugador.x - this.width * 0.5;
    this.scrollY = jugador.y - this.height * 0.5;
  }
}
