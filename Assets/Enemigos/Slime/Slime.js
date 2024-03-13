class slime extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this, false);
    scene.physics.add.collider(this, this.scene.layer);
    scene.physics.add.collider(this, this.scene.jugador);
    this.body.setSize(16, 16);
    this.body.immovable = false;
    this.setScale(0.7);
    this.rangoAtaque = 16;
    this.distanciaJugador;
    this.persiguiendoJugador = false;
    this.atacandoJugador = false;
  }
  update() {
    this.distanciaJugador = Phaser.Math.Distance.BetweenPoints(
      this.scene.jugador,
      this
    );
    if (
      this.scene.jugador.active &&
      this.scene.jugador.visible &&
      this.active
    ) {
      // Llama al método para seguir al jugador
      this.seguirJugador();
      this.atacarJugador();
    }
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
    if (!this.atacandoJugador) {
      this.persiguiendoJugador = true;
      setTimeout(() => {
        this.scene.physics.moveToObject(this, this.scene.jugador, 30);
      }, 500);

      this.play(this.animationNames["move"], true);
      if (this.x > this.scene.jugador.x) {
        this.setFlipX(false);
      } else {
        this.setFlipX(true);
      }

      if (this.distanciaJugador <= this.rangoAtaque) {
        this.persiguiendoJugador = false;
        this.atacandoJugador = true;
        console.log("Cerca para atacar");
        //this.anims.stop();
      }
    }
  }
  atacarJugador() {
    if (!this.persiguiendoJugador) {
      console.log("Atacando");
      this.play(this.animationNames["attack"], true);
      this.scene.physics.overlap(
        this,
        this.scene.jugador,
        (enemigo, player) => {
          console.log("ay mi pichula");
        }
      );
      if (this.distanciaJugador > this.rangoAtaque) {
        console.log("Dejando de atacar");
        this.persiguiendoJugador = true;
        this.atacandoJugador = false;
        //this.anims.stop();
      }
    }
  }
}
