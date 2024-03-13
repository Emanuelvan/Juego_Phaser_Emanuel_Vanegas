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
    this.numGolpes = 0;
    this.vida = 3;
    this.tiempoEntreGolpes = 1000; // Tiempo en milisegundos entre golpes
    this.ultimoGolpeTiempo = 0;
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
    if (this.numGolpes < this.vida) {
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
          //this.anims.stop();
        }
      }
    }
  }
  atacarJugador() {
    if (this.numGolpes < this.vida) {
      if (!this.persiguiendoJugador) {
        const tiempoActual = Date.now();
        if (tiempoActual - this.ultimoGolpeTiempo >= this.tiempoEntreGolpes) {
          this.play(this.animationNames["attack"], true);
          this.scene.physics.overlap(
            this,
            this.scene.jugador,
            (enemigo, player) => {
              console.log("Daño recibido");
              //this.scene.jugado.recibirDamage();
            }
          );
          this.ultimoGolpeTiempo = tiempoActual;
        }
        if (this.distanciaJugador > this.rangoAtaque) {
          this.persiguiendoJugador = true;
          this.atacandoJugador = false;
          //this.anims.stop();
        }
      }
    }
  }

  recibirGolpes() {
    this.numGolpes++;
    if (this.numGolpes >= this.vida) {
      this.enemigoEliminado();
    }
  }

  enemigoEliminado() {
    this.persiguiendoJugador = false;
    this.atacandoJugador = false;
    this.anims.stop();
    this.play(this.animationNames["dead"], true);
    this.body.setVelocity(0, 0);
    var playerTileX = this.scene.mapa.worldToTileX(this.jugador.x);
    var playerTileY = this.scene.mapa.worldToTileY(this.jugador.y);
    if (Phaser.Math.Between(1, 10) <= 3) {
      const xLlave = this.scene.mapa.tileToWorldX(playerTileX + 1);
      const yLlave = this.scene.mapa.tileToWorldY(playerTileY + 1);
      const nuevaLlave = new Llave(this.scene, xLlave, yLlave, "Llave");
      this.scene.llave = nuevaLlave;
    }
  }
}
