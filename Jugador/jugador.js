class jugador extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        scene.add.existing(this)
        scene.physics.add.existing(this, false)
        scene.physics.add.collider(this, this.scene.layer);
        //Se cambia el tamaño al hitbox del personaje así como tambien la posición
        this.body.setSize(10,10);
        this.body.setOffset(45, 70);
        this.lastMoveTime = 0;
        this.velocity = 500;
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
    
    updatePlayerMovement() {
        this.setVelocityX(0);
        this.setVelocityY(0);

        this.teclas = this.scene.input.keyboard.addKeys("W,A,S,D");
        if (this.teclas.S.isDown) {
                this.setVelocityY(350)
                console.log(this.x, this.y)
                this.play(this.animationNames["walk_down"], true);
        }
        else if (this.teclas.W.isDown) {

                this.setVelocityY(-350);
                this.play(this.animationNames["walk_up"], true);
            
        }
        if (this.teclas.A.isDown) {
                this.setVelocityX(-350)
                this.play(this.animationNames["walk_left"], true);
            
        }
        else if (this.teclas.D.isDown) {
                this.play(this.animationNames["walk_right"], true);
                this.setVelocityX(350)
            
        }

        if(!this.teclas.S.isDown && !this.teclas.W.isDown && !this.teclas.A.isDown && !this.teclas.D.isDown){
            this.play(this.animationNames["Idle_Down"], true);
        }

    }
}