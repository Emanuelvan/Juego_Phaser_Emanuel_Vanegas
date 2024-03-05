class jugador extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this, false);
    scene.physics.add.collider(this, this.scene.layer);
    //Se cambia el tamaño al hitbox del personaje así como tambien la posición
    this.body.setSize(32, 32);
    this.body.setOffset(35, 65);
    this.lastMoveTime = 0;
    this.velocity = 500;
    this.camaraTime = 0;
    this.direccion = "";
    this.isAttacking = false;
    this.rotCam = 0;
    this.PlayerMove = false;
    this.setScale(0.2);
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
    var VelocidadCamRo = 0.009;
    if (this.camaraTime > 2 * Math.PI) {
      this.camaraTime = 0;
    }
    if (this.PlayerMove == true) {
      this.camaraTime += VelocidadCamRo;
    }
    var cambio = (Math.sin(this.camaraTime) + 1) / 2;
    var valor = min + cambio * (max - min);
    return (this.rotCam = valor);
  }
  updatePlayerMovement() {
    this.teclas = this.scene.input.keyboard.addKeys("W,A,S,D,SPACE");
    this.body.setVelocity(0);
    if (this.teclas.A.isDown) {
      this.body.setVelocityX(-90);
      this.PlayerMove = true;
      this.scene.cam.setRotation(this.rotacionCamara());
    } else if (this.teclas.D.isDown) {
      this.body.setVelocityX(90);
      this.PlayerMove = true;
      this.scene.cam.setRotation(this.rotacionCamara());
    }
    if (this.teclas.W.isDown) {
      this.body.setVelocityY(-90);
      this.PlayerMove = true;
      this.scene.cam.setRotation(this.rotacionCamara());
    } else if (this.teclas.S.isDown) {
      this.body.setVelocityY(90);
      this.PlayerMove = true;
      this.scene.cam.setRotation(this.rotacionCamara());
    }

    //

    if (this.teclas.A.isDown) {
      this.anims.play(this.animationNames["walk_left"], true);
    } else if (this.teclas.D.isDown) {
      this.anims.play(this.animationNames["walk_right"], true);
    } else if (this.teclas.W.isDown) {
      this.anims.play(this.animationNames["walk_up"], true);
    } else if (this.teclas.S.isDown) {
      this.anims.play(this.animationNames["walk_down"], true);
    } else {
      //this.anims.stop();
      this.anims.play(this.animationNames["Idle_Down"], true);
      this.PlayerMove = false;
    }
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

/* if (
  !this.teclas.S.isDown &&
  !this.teclas.W.isDown &&
  !this.teclas.A.isDown &&
  !this.teclas.D.isDown &&
  !this.isAttacking
) {
  this.play(this.animationNames["Idle_Down"], true);
} else {
  this.scene.cam.setRotation(this.rotacionCamara());
}  */
