class slime extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this, false);
    scene.physics.add.collider(this, this.scene.layer);
    scene.physics.add.collider(this, this.scene.jugador);
    this.body.setSize(16, 16);
    this.body.immovable = true;
    this.setScale(0.7);
  }
  update() {
    this.seguirJugador();
  }
  animationEnemigo(animationNames) {
    this.animationNames = {};
    for (let name of animationNames) {
      this.animationNames[name] = "slime_" + name;
      this.scene.anims.create({
        key: "slime_" + name,
        frames: this.scene.anims.generateFrameNames("EnemyAnimation", {
          start: 1,
          end: 9,
          prefix: "slime_" + name + "_",
        }),
        frameRate: 15,
      });
    }
  }

  seguirJugador() {
    this.scene.physics.moveToObject(this, this.scene.jugador, 30);
    this.play(this.animationNames["move"], true);
    if (this.x > this.scene.jugador.x) {
      this.setFlipX(false);
    } else {
      this.setFlipX(true);
    }
  }
  atacarJugador() {
    this.scene.physics.overlap(this, this.scene.jugador, () => {
      this.anims.stop();
      this.play(this.animationNames["attack"], true);
      console.log("Ataque Loli");
    });
  }
}
