class jugador extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this, false);
    scene.physics.add.collider(this, this.scene.layer);
    //Se cambia el tamaño al hitbox del personaje así como tambien la posición
    this.body.setSize(10, 10);
    this.body.setOffset(45, 70);
    this.lastMoveTime = 0;
    this.velocity = 500;
    this.camaraTime = 0;
    this.direccion = "";
    this.isAttacking = false;
  }

  //Se crean las animacion para el persona, utilizando un atlas donde se determina cada animación por separado
  //unu muy tedioso pero util a futuro
  animationCharacter(animationNames) {
    this.animationNames = {};
    for (let name of animationNames) {
      this.animationNames[name] = "knight_" + name;
      this.scene.anims.create({
        key: "knight_" + name,
        frames: this.scene.anims.generateFrameNames("PlayerAnimation", {
          start: 1,
          end: 4,
          prefix: "knight_" + name + "_",
        }),
        frameRate: 6,
      });
    }
  }
  //Funcion para rotar constantemente la camara cada vez que el jugador se mueve
  rotacionCamara() {
    var min = -0.045;
    var max = 0.045;
    var VelocidadCamRo = 0.015;
    if (this.camaraTime > 2 * Math.PI) {
      this.camaraTime = 0;
    }
    this.camaraTime += VelocidadCamRo;
    var cambio = (Math.sin(this.camaraTime) + 1) / 2;
    var valor = min + cambio * (max - min);
    return valor;
  }

  updatePlayerMovement() {
    this.setVelocityX(0);
    this.setVelocityY(0);
    this.teclas = this.scene.input.keyboard.addKeys("W,A,S,D,SPACE");
    if (this.teclas.S.isDown) {
      this.setVelocityY(350);
      this.play(this.animationNames["walk_down"], true);
      this.direccion = "down";
    } else if (this.teclas.W.isDown) {
      this.setVelocityY(-350);
      this.play(this.animationNames["walk_up"], true);
      this.direccion = "up";
    }
    if (this.teclas.A.isDown) {
      this.setVelocityX(-350);
      this.play(this.animationNames["walk_left"], true);
      this.direccion = "left";
    } else if (this.teclas.D.isDown) {
      this.play(this.animationNames["walk_right"], true);
      this.setVelocityX(350);
      this.direccion = "right";
    }
    //Control de ataque
    if (this.teclas.SPACE.isDown) {
      this.attack();
    }

    if (
      !this.teclas.S.isDown &&
      !this.teclas.W.isDown &&
      !this.teclas.A.isDown &&
      !this.teclas.D.isDown &&
      !this.isAttacking
    ) {
      this.play(this.animationNames["Idle_Down"], true);
    } else {
      this.scene.cam.setRotation(this.rotacionCamara());
    }
    console.log(this.direccion);
  }
  attack() {
    //Dependiendo de la ultima direccion ejecuta una animacion
    if (this.direccion) {
      this.isAttacking = true;
      this.play(this.animationNames["attack_" + this.direccion], true);
      this.on(
        "animationcomplete-" + this.animationNames["attack_" + this.direccion],
        () => {
          this.isAttacking = false;
        }
      );
    }
  }
}
