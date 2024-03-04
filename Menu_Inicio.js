class Menu_Inicio extends Phaser.Scene {
  constructor() {
    super({ key: "Menu_Inicio" });
  }
  preload() {
    this.load.bitmapFont(
      "P2_Font",
      "Assets/Fonts/P2_Font.png",
      "Assets/Fonts/P2_Font.fnt"
    );
    this.load.image("Fondo Inicio", "Assets/Fondos/Menu_Inicio_Background.jpg");
  }

  create() {
    const TiempoMenu = this.time.now + 1000;
    const FondoInicio = this.add
      .image(-175, 10, "Fondo Inicio")
      .setOrigin(0)
      .setScale(0.9)
      .setDepth(0);

    /*    if (TiempoMenu > this.time.now) {
      return;
    } */
    const TituloTexto = this.add
      .bitmapText(
        this.game.renderer.height * 0.05,
        this.game.renderer.width / 4,
        "P2_Font",
        "Knight\nSurvivor",
        62,
        { align: "center" }
      )
      .setDepth(1);
    //const fxShadow = TituloTexto.preFX.addShadow(0, 0, 0.006, 2, 0x333333, 10);

    //Titulo Efectos

    this.add.tween({
      targets: TituloTexto,
      scale: 1.05,
      duration: 750,
      yoyo: true,
      repeat: -1,
    });

    //Blur Camara
    const fx = FondoInicio.preFX.addBlur();
    this.tweens.add({
      targets: fx,
      strength: 0,
      duration: 1500,
      yoyo: false,
      repeat: 0,
    });
    this.input.once(
      "pointerdown",
      function () {
        this.scene.start("Juego_Principal", Juego_Principal, true);
        this.scene.stop();
      },
      this
    );
  }
}
