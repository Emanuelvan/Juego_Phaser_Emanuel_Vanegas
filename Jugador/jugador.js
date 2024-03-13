class jugador extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this, false);
    scene.physics.add.collider(this, this.scene.layer);
    scene.physics.add.collider(this);
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
    this.pickKey = false;
    this.vidasJugador = 3;
    this.numGolpes = 0;
    // Se crea una hitbox para el ataque
    this.attackHitbox = scene.physics.add.sprite(0, 0, "key_texture");
    this.attackHitbox.setSize(16, 16);
    this.attackHitbox.setVisible(false);
    this.attackHitbox.alpha = 0;
    scene.physics.add.collider(
      this.attackHitbox,
      this.handleAttackCollision,
      null,
      this
    );
  }
  update() {
    this.updatePlayerMovement();
    this.scene.physics.overlap(this, this.scene.llave, (player, llave) => {
      llave.destroy();
      this.pickKey = true;
    });
  }
  recibirDamage() {
    this.numGolpes++;
    if (this.numGolpes >= this.vidasJugador) {
      this.scene.start("Menu_Inicio", Menu_Inicio, true);
      this.scene.stop();
      this.BackgroundMusic.stop();
    }
  }

  //Funcion para rotar constantemente la camara cada vez que el jugador se mueve
  rotacionCamara() {
    var min = -0.045;
    var max = 0.045;
    var VelocidadCamRo = 0.005; //0.004
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
      this.direccion = "left";
    } else if (this.teclas.D.isDown) {
      this.anims.play(this.animationNames["walk_right"], true);
      this.direccion = "right";
    } else if (this.teclas.W.isDown) {
      this.anims.play(this.animationNames["walk_up"], true);
      this.direccion = "up";
    } else if (this.teclas.S.isDown) {
      this.anims.play(this.animationNames["walk_down"], true);
      this.direccion = "down";
    } else if (this.teclas.SPACE.isDown) {
      this.attack();
    } else {
      this.attackHitbox.setVisible(false);
      this.anims.play(this.animationNames["Idle_Down"], true);
      this.PlayerMove = false;
    }
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
  attack() {
    if (!this.isAttacking) {
      //Dependiendo de la ultima direccion ejecuta una animacion
      if (this.direccion) {
        this.isAttacking = true;
        this.play(this.animationNames["attack_" + this.direccion], true);
        this.on(
          "animationcomplete-" +
            this.animationNames["attack_" + this.direccion],
          () => {
            if (!this.attackHitbox.visible) return; // Evitar múltiples detecciones de colisión
            this.scene.physics.overlap(
              this.attackHitbox,
              this.scene.enemigosGroup,
              (attackHitbox, enemy) => {
                this.handleAttackCollision(attackHitbox, enemy);
              }
            );
            this.isAttacking = false;
            this.attackHitbox.x = 1000;
            this.attackHitbox.y = 1000;
            this.attackHitbox.setVisible(false);
          }
        );
        if (this.direccion === "down") {
          this.attackHitbox.x = this.x;
          this.attackHitbox.y = this.y + 15;
        } else if (this.direccion === "left") {
          this.attackHitbox.x = this.x - 10;
          this.attackHitbox.y = this.y + 5;
        } else if (this.direccion === "right") {
          this.attackHitbox.x = this.x + 10;
          this.attackHitbox.y = this.y + 5;
        } else if (this.direccion === "up") {
          this.attackHitbox.x = this.x;
          this.attackHitbox.y = this.y - 15;
        }
        this.attackHitbox.setVisible(true);
      }
    }
    this.isAttacking = false;
  }
  // Función para manejar la colisión con la hitbox de ataque
  handleAttackCollision(attackHitbox, enemy) {
    // Lógica para manejar la colisión con el enemigo
    // Puedes hacer lo que necesites aquí, como dañar al enemigo, etc.
    enemy.recibirGolpes();
  }
}
