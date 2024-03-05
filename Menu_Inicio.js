class Menu_Inicio extends Phaser.Scene {
  constructor() {
    super({ key: "Menu_Inicio" });
  }
  TiempoMenu;
  BotonIniciar;
  preload() {
    this.load.bitmapFont(
      "P2_Font",
      "Assets/Fonts/P2_Font.png",
      "Assets/Fonts/P2_Font.fnt"
    );
    this.load.image("Fondo Inicio", "Assets/Fondos/Menu_Inicio_Background.jpg");
    this.load.image("Espada Opcion", "Assets/Botones/Espada.png");
    this.load.image("Boton Inicio", "Assets/Botones/Iniciar_Boton.png");
    this.load.audio(
      "Ambiente",
      "Audio/Music/Old RuneScape Soundtrack Crystal Sword.mp3"
    );
  }
  crearMenuInicio() {
    this.OpcionEspada = this.add
      .image(10, 10, "Espada Opcion")
      .setDepth(1)
      .setScale(0.065)
      .setVisible(false)
      .setRotation(Math.PI);
    //Boton de inicio y Titulo
    //Boton
    this.BotonIniciar = this.add
      .image(250, 480, "Boton Inicio")
      .setDepth(1)
      .setScale(0.075);
    //FuncionBoton
    this.BotonIniciar.setInteractive();
    this.BotonIniciar.on("pointerover", () => {
      this.OpcionEspada.setVisible(true);
      this.OpcionEspada.x = this.BotonIniciar.x * 0.15 + 50;
      this.OpcionEspada.y = this.BotonIniciar.y;
    });
    this.BotonIniciar.on("pointerout", () => {
      this.OpcionEspada.setVisible(false);
    });
    this.BotonIniciar.on("pointerup", () => {
      this.scene.start("Juego_Principal", Juego_Principal, true);
      this.scene.stop();
      this.BackgroundMusic.stop();
    });
    //Titulo
    this.TituloTexto = this.add
      .bitmapText(
        this.game.renderer.height * 0.05,
        this.game.renderer.width / 4,
        "P2_Font",
        "Knight\nSurvivor",
        62
      )
      .setDepth(1);
    //Titulo Efectos
    this.add.tween({
      targets: this.TituloTexto,
      scale: 1.05,
      duration: 750,
      yoyo: true,
      repeat: -1,
    });
    this.BackgroundMusic.play({ loop: true, volume: 0.0 });
  }

  create() {
    //Musica del menu
    this.BackgroundMusic = this.sound.add("Ambiente");
    this.timeEvent = this.time.delayedCall(
      2000,
      this.crearMenuInicio,
      [],
      this
    );

    //Efectos Boton Inicio
    /*     Boton_Inicio.setAngle(-5);
    this.add.tween({
      targets: Boton_Inicio,
      angle: "+=10",
      duration: 500,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    }); */
    //
    const TiempoMenu = this.time.now + 1000;
    const FondoInicio = this.add
      .image(-175, 10, "Fondo Inicio")
      .setOrigin(0)
      .setScale(0.9)
      .setDepth(0);
    //Blur Fondo Inicio
    const fxFondo = FondoInicio.preFX.addPixelate(10);
    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.tweens.addCounter({
          from: 10,
          to: 2,
          duration: 1500,
          yoyo: false,
          repeat: 0,
          onUpdate: (value) => {
            fxFondo.amount = value.getValue();
          },
        });
      },
    });
    /*    if (TiempoMenu > this.time.now) {
      return;
    } */

    //const fxShadow = TituloTexto.preFX.addShadow(0, 0, 0.006, 2, 0x333333, 10);
  }
}
