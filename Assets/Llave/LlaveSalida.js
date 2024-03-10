class Llave extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this, false);
    this.setScale(0.25);
    /*     scene.physics.add.existing(this, false);
    scene.physics.add.collider(this, this.scene.layer); */
    /* this.body.setSize(32, 32);
        this.body.setOffset(35, 65); */
  }
}
