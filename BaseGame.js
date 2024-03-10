const TILES = {
  TOP_LEFT_WALL: 0,
  TOP_RIGHT_WALL: 2,
  BOTTOM_RIGHT_WALL: 50,
  BOTTOM_LEFT_WALL: 48,
  TOP_WALL: [
    { index: 1, weight: 4 },
    { index: 170, weight: 1 },
    { index: 1, weight: 1 },
  ],
  LEFT_WALL: [
    { index: 24, weight: 4 },
    { index: 24, weight: 1 },
    { index: 24, weight: 1 },
    { index: 24, weight: 1 },
  ],
  RIGHT_WALL: [
    { index: 26, weight: 4 },
    { index: 26, weight: 1 },
    { index: 26, weight: 1 },
    { index: 26, weight: 1 },
  ],
  BOTTOM_WALL: [
    { index: 49, weight: 4 },
    { index: 49, weight: 1 },
    { index: 49, weight: 1 },
    { index: 49, weight: 1 },
  ],
  FLOOR: [
    { index: 25, weight: 20 },
    { index: 183, weight: 1 },
    { index: 184, weight: 1 },
    { index: 185, weight: 1 },
    { index: 186, weight: 1 },
  ],
  ESCALERAS: 209,
  ESCALERAS_CERRADAS: 233,
};
const debug = false;

class Juego_Principal extends Phaser.Scene {
  activeRoom;
  mazmorra;
  mapa;
  jugador;
  teclas;
  cam;
  layer;
  BackgroundMusic;
  minimap;
  info;
  luces;
  cuarto;
  cuartoInicio;
  cuartoFinal;
  otrosCuartos;
  escalaresEncontras = false;

  constructor() {
    super({ key: "Juego_Principal" });
    this.nivel = 0;
  }

  preload() {
    this.load.spritesheet("personaje", "Assets/Personaje/knight1.png", {
      frameWidth: 72,
      frameHeight: 72,
    });
    this.load.image("Llave", "Assets/Llave/Llave.png");
    this.load.image("tiles", "Assets/Tiles_Map/dungeon_sheet.png");
    this.load.atlas(
      "PlayerAnimation",
      "Jugador/Animaciones/Animacion_Knight.png",
      "Jugador/Animaciones/Animacion_Knight.json"
    );
    this.load.audio("Gameplay", "Audio/Music/Cave Background.mp3");
  }

  create() {
    let playerList = [
      "Idle_Down",
      "walk_down",
      "idle_upward",
      "walk_up",
      "idle_upward",
      "idle_left",
      "walk_left",
      "idle_right",
      "walk_right",
      "attack_down",
      "attack_up",
      "attack_left",
      "attack_right",
      "action_down",
      "action_up",
      "action_left",
      "action_right",
    ];
    this.BackgroundMusic = this.sound.add("Gameplay");
    this.BackgroundMusic.play({ loop: true, volume: 0.0 });
    this.lights.enable();
    this.mazmorra = new Dungeon({
      // El tamaño general del grid
      width: 50,
      height: 50,
      doorPadding: 1,
      rooms: {
        // Rango del ancho de las habitaciones
        rooms: {
          width: { min: 9, max: 15, onlyOdd: false },
          height: { min: 9, max: 15, onlyOdd: false },
        },
        // Cantidad maxima de cuartos
        maxRooms: 3,
      },
    });
    this.mapa = this.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: this.mazmorra.width,
      height: this.mazmorra.height,
    });
    var tileset = this.mapa.addTilesetImage("tiles", "tiles", 16, 16);
    this.layer = this.mapa.createBlankLayer("Escenario", tileset);
    /* .setPipeline("Light2D"); */
    this.layer.setScale(1);
    //this.layer.fill(2);

    //Se crea un indexes especifico para crear un final de la mazmorra
    this.cuartos = this.mazmorra.rooms.slice(); // Crea una copia del array donde se guarda las habitaciones
    this.cuartoInicio = this.cuartos.shift(); // Quita la primera posicion del array, es decir el cuarto del inicio
    this.cuartoFinal = Phaser.Utils.Array.RemoveRandomElement(this.cuartos); // Toma un elemento aleatorio del array
    this.otrosCuartos = Phaser.Utils.Array.Shuffle(this.cuartos).slice(
      // Mezcla los valores del arreglo y toma un valor de esto desde la primera posicion hasta el largo menos la ultima posicion
      0,
      this.cuartos.length * 0.9
    );

    //

    this.mazmorra.rooms.forEach(function (cuarto) {
      var x = cuarto.x;
      var y = cuarto.y;
      var w = cuarto.width;
      var h = cuarto.height;
      var cx = Math.floor(x + w / 2);
      var cy = Math.floor(y + h / 2);
      var left = x;
      var right = x + (w - 1);
      var top = y;
      var bottom = y + (h - 1);
      this.mapa.weightedRandomize(TILES.FLOOR, x, y, w, h);

      // Las tiles del borde del mapa
      this.mapa.putTileAt(TILES.TOP_LEFT_WALL, left, top);
      this.mapa.putTileAt(TILES.TOP_RIGHT_WALL, right, top);
      this.mapa.putTileAt(TILES.BOTTOM_RIGHT_WALL, right, bottom);
      this.mapa.putTileAt(TILES.BOTTOM_LEFT_WALL, left, bottom);

      // Pone de manera aleatoria las tiles de las paredes
      this.mapa.weightedRandomize(TILES.TOP_WALL, left + 1, top, w - 2, 1);
      this.mapa.weightedRandomize(
        TILES.BOTTOM_WALL,
        left + 1,
        bottom,
        w - 2,
        1
      );
      this.mapa.weightedRandomize(TILES.LEFT_WALL, left, top + 1, 1, h - 2);
      this.mapa.weightedRandomize(TILES.RIGHT_WALL, right, top + 1, 1, h - 2);

      // Crea la posición de las puertas que conecta los cuartos
      var doors = cuarto.getDoorLocations();

      for (var i = 0; i < doors.length; i++) {
        this.mapa.putTileAt(25, x + doors[i].x, y + doors[i].y);
      }
    }, this);
    this.layer.putTileAt(
      TILES.ESCALERAS,
      this.cuartoFinal.centerX,
      this.cuartoFinal.centerY
    );

    //

    this.otrosCuartos.forEach((cuarto) => {
      // Pone objetos de forma aleatoria en los cuartos
      var rand = Math.random();
      if (rand <= 0.9) {
        this.layer.putTileAt(154, cuarto.centerX, cuarto.centerY); // Cubo de Luz en la mitad del cuarto
      } else if (rand <= 0.25) {
        this.layer.putTileAt(182, cuarto.centerX, cuarto.centerY);
      } else if (rand <= 0.4) {
        this.layer.putTileAt(211, cuarto.centerX, cuarto.centerY);
      } else if (rand <= 0.6) {
        if (cuarto.height >= 9) {
          // Crea torres de forma aleatoria en el centro de los cuartos
          this.layer.putTilesAt([[74], [98]], cuarto.centerX, cuarto.centerY);

          this.layer.putTilesAt([[74], [98]], cuarto.centerX, cuarto.centerY);

          this.layer.putTilesAt([[74], [98]], cuarto.centerX, cuarto.centerY);

          this.layer.putTilesAt([[74], [98]], cuarto.centerX, cuarto.centerY);
        } else {
          this.layer.putTilesAt([[74], [98]], cuarto.centerX, cuarto.centerY);

          this.layer.putTilesAt([[74], [98]], cuarto.centerX, cuarto.centerY);
        }
      }
    });
    //Colision de las tiles
    this.layer.setCollisionByExclusion([25, 207, 183, 184, 185, 186]);

    if (!debug) {
      this.layer.forEachTile((tile) => {
        tile.alpha = 0;
      });
    }
    var playerRoom = this.cuartoInicio;

    //Se crea al jugador
    this.jugador = new jugador(
      this,
      this.mapa.tileToWorldX(playerRoom.x + 2),
      this.mapa.tileToWorldY(playerRoom.y + 2),
      "personaje"
    ).setPipeline("Light2D");

    this.jugador.animationCharacter(playerList);
    console.log(this.jugador.pickKey);
    //Creamos la llave
    this.llave = new Llave(
      this,
      this.mapa.tileToWorldX(playerRoom.x + 3),
      this.mapa.tileToWorldY(playerRoom.y + 4),
      "Llave"
    );

    //Se crea la luz
    this.luces = this.lights
      .addLight(0, 0, 200)
      .setColor(0x979fad)
      .setIntensity(10)
      .setRadius(50);
    //.setScrollFactor(0.0);

    if (!debug) {
      this.setRoomAlpha(playerRoom, 1); // Muestra la primera habitación
    }
    //Texto guia de botones

    //Se crea la camara dandole limites del tamaño maximo de la layer del mapa asi como tambien que siga al jugador
    this.cam = this.cameras.main;
    this.cam
      .setBounds(
        0,
        0,
        this.layer.width * this.layer.scaleX,
        this.layer.height * this.layer.scaleY
      )
      .setName("Camara Principal");
    this.cam = this.cameras.main.startFollow(this.jugador, false, 0.1, 0.1);
    this.cam.setZoom(5);
    this.info = this.add
      .text(300, 16, "Usa WASD para moverte y ESPACIO para atacar", {
        padding: { x: 5, y: 5 },
        backgroundColor: "#ffffff",
        fill: "#000000",
      })
      .setDepth(0);
    this.info.setScrollFactor(1);
    //Se crea el minimapa
    this.minimap = new Minimap(800, 30, 200, 200)
      .setZoom(0.5)
      .setName("miniMap")
      .setBackgroundColor("#6f7e87");
    this.cameras.addExisting(this.minimap);
    this.minimap.ignore(this.info);
    //this.minimap.ignore();
  }

  update(time, delta) {
    if (this.jugador.pickKey) {
      /*       this.layer.removeTileAt(
        this.cuartoFinal.centerX,
        this.cuartoFinal.centerY
      ); */
      /*       this.layer.putTileAt(
        TILES.ESCALERAS,
        this.cuartoFinal.centerX,
        this.cuartoFinal.centerY
      ); */
      /*       this.layer.setTileIndexCallback(TILES.ESCALERAS, () => {
        this.layer.setTileIndexCallback(TILES.ESCALERAS, null);
        this.escalaresEncontras = true;
        const cam = this.cameras.main;
        cam.fade(500, 0, 0, 0);
        cam.once("camerafadeoutcomplete", () => {
          //this.setRoomAlpha(this.mazmorra.rooms, 0);
          this.scene.restart();
        });
      }); */
    }
    //Crear una luz para el jugador;
    this.luces.x = this.jugador.x - this.jugador.rotacionCamara();
    this.luces.y = this.jugador.y + this.jugador.rotacionCamara();
    //Se actualiza la posicion en el minimapa
    this.minimap.actulizarPosMinimap(this.jugador);
    //Se actuliza la posisición del jugador
    this.jugador.update();
    //
    var playerTileX = this.mapa.worldToTileX(this.jugador.x);
    var playerTileY = this.mapa.worldToTileY(this.jugador.y);
    //Un metodo que ayuda a generar las habitaciones creando el cuarto al momento que el jugador entra a la habitación
    var room = this.mazmorra.getRoomAt(playerTileX, playerTileY);

    if (room && this.activeRoom && this.activeRoom !== room) {
      //Hace que el cuarto anterior se oscurezca
      if (!debug) {
        this.setRoomAlpha(room, 1);
        this.setRoomAlpha(this.activeRoom, 0.2);
      }
    }

    this.activeRoom = room;
  }
  setRoomAlpha(room, alpha) {
    this.mapa.forEachTile(
      function (tile) {
        tile.alpha = alpha;
      },
      this,
      room.x,
      room.y,
      room.width,
      room.height
    );
  }

  isTileOpenAt(worldX, worldY) {
    var tile = mapa.getTileAtWorldXY(worldX, worldY, true);
    if (tile && !tile.collides) {
      return true;
    } else {
      return false;
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 800,
  backgroundColor: "#2a2a55",
  parent: "Juego Dungeon Emanuel",
  pixelArt: true,
  roundPixels: true,
  scene: [/* Menu_Inicio */ Juego_Principal],
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
};

const game = new Phaser.Game(config);
