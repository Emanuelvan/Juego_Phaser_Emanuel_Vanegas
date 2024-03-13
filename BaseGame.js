const debug = false;

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
  BLANK: 210,
};

class Juego_Principal extends Phaser.Scene {
  activeRoom;
  mazmorra;
  mapa;
  jugador;
  teclas;
  cam;
  layer;
  puertaSalida;
  BackgroundMusic;
  minimap;
  info;
  luces;
  cuarto;
  cuartoInicio;
  cuartoFinal;
  otrosCuartos;
  escalaresEncontras = false;
  enemigo;
  habitacionesConEnemigos;

  constructor() {
    super({ key: "Juego_Principal" });
    this.nivel = 0;
    this.habitacionesConEnemigos = new Map();
  }

  preload() {
    this.load.spritesheet("personaje", "Assets/Personaje/knight1.png", {
      frameWidth: 72,
      frameHeight: 72,
    });
    this.load.spritesheet(
      "Enemigo",
      "Assets/Enemigos/Slime/Animaciones/Animacion_Slime.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.atlas(
      "EnemyAnimation",
      "Assets/Enemigos/Slime/Animaciones/Animacion_Slime.png",
      "Assets/Enemigos/Slime/Animaciones/Animacion_Slime.json"
    );
    this.load.image("Llave", "Assets/Llave/Llave.png");
    this.load.image(
      "Puerta_Cerrada",
      "Assets/Puerta_Salida/Puerta_Salida_Cerrada.png"
    );
    this.load.image("tiles", "Assets/Tiles_Map/dungeon_sheet.png");
    this.load.atlas(
      "PlayerAnimation",
      "Jugador/Animaciones/Animacion_Knight.png",
      "Jugador/Animaciones/Animacion_Knight.json"
    );
    this.load.audio("Gameplay", "Audio/Music/Cave Background.mp3");
  }

  create() {
    this.nivel++;
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
    this.enemyList = ["Idle", "move", "attack", "dead"];
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

    //Se crea la Tile para la salida
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

    //Se crea la puerta cerrada
    var posX = this.mapa.tileToWorldX(this.cuartoFinal.centerX + 0.5);
    var posY = this.mapa.tileToWorldX(this.cuartoFinal.centerY) + 8;
    this.puertaSalida = this.physics.add.sprite(posX, posY, "Puerta_Cerrada");
    this.puertaSalida.setVisible(false);

    //Se crea al jugador
    this.jugador = new jugador(
      this,
      this.mapa.tileToWorldX(playerRoom.x + 2),
      this.mapa.tileToWorldY(playerRoom.y + 2),
      "personaje"
    ).setPipeline("Light2D");
    this.jugador.animationCharacter(playerList);
    //Se crea el enemigo
    this.enemigosGroup = this.add.group({
      classType: slime,
      key: "Enemigo",
      maxSize: 50,
      repeat: 50,
      active: false,
      visible: false,
      runChildUpdate: true,
    });
    //Creamos la llave

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

    //Texto guia de botones
    this.info = this.add.text(
      this.game.renderer.width / 2.4,
      325,

      `Usa WASD para moverte y ESPACIO para atacar\nNivel Actual: ${this.nivel}`,
      {
        padding: { x: 5, y: 5 },
        backgroundColor: "#ffffff",
        fill: "#000000",
        fontSize: "18px",
      }
    );
    this.info.setScrollFactor(0);
    this.info.setScale(0.25);

    //Se crea el minimapa
    this.minimap = new Minimap(750, 30, 250, 250)
      .setZoom(0.75)
      .setName("miniMap")
      .setBackgroundColor("#6f7e87");
    this.cameras.addExisting(this.minimap);
    this.minimap.ignore(this.info);
  }

  update(time, delta) {
    if (this.jugador.pickKey) {
      this.puertaSalida.destroy();
      this.layer.setTileIndexCallback(TILES.ESCALERAS, () => {
        this.layer.setTileIndexCallback(TILES.ESCALERAS, null);
        this.escalaresEncontras = true;
        const cam = this.cameras.main;
        cam.fade(500, 0, 0, 0);
        cam.once("camerafadeoutcomplete", () => {
          this.scene.restart();
        });
      });
    }
    //Crear una luz para el jugador;
    this.luces.x = this.jugador.x - this.jugador.rotacionCamara();
    this.luces.y = this.jugador.y + this.jugador.rotacionCamara();
    //Se actualiza la posicion en el minimapa
    this.minimap.actulizarPosMinimap(this.jugador);
    //Se actuliza la posisición del jugador
    this.jugador.update();
    //

    //

    var playerTileX = this.mapa.worldToTileX(this.jugador.x);
    var playerTileY = this.mapa.worldToTileY(this.jugador.y);
    //Un metodo que ayuda a generar las habitaciones creando el cuarto al momento que el jugador entra a la habitación
    var room = this.mazmorra.getRoomAt(playerTileX, playerTileY);
    this.entrarNuevaHabitacion(room);
    this.activeRoom = room;
    const coloresSlimes = ["0x3d93d9", "0x#d0e354", "0xcf3072", "0x#85db84"];
    function seleccionarColorAleatorio() {
      const indiceAleatorio = Math.floor(Math.random() * coloresSlimes.length);
      return coloresSlimes[indiceAleatorio];
    }
    if (room != this.cuartoInicio && room != this.cuartoFinal) {
      this.enemigosGroup.children.iterate((enemy) => {
        enemy.update();
        enemy.setTint(0xd0e354);
      });
    }
    /*     this.mazmorra.drawToConsole({
      empty: " ",
      emptyColor: "rgb(0, 0, 0)",
      wall: "#",
      wallColor: "rgb(255, 0, 0)",
      floor: "0",
      floorColor: "rgb(210, 210, 210)",
      door: "x",
      doorColor: "rgb(0, 0, 255)",
      fontSize: "8px",
    }); */
  }

  entrarNuevaHabitacion(room) {
    // Verificar si la habitación es diferente de la habitación actual
    if (room && this.activeRoom && this.activeRoom !== room) {
      // Establecer la habitación actual como la nueva habitación

      // Mostrar la habitación actual
      if (!debug) {
        this.setRoomAlpha(room, 1);
        if (this.activeRoom) this.setRoomAlpha(this.activeRoom, 0.3);
      }
      // Mostrar la puerta de salida si la habitación es la final
      if (room === this.cuartoFinal) {
        this.puertaSalida.setVisible(true);
      }

      // Generar enemigos si la habitación no es la de inicio o final
      if (room !== this.cuartoInicio && room !== this.cuartoFinal) {
        if (!this.habitacionesConEnemigos.has(room)) {
          // Generar enemigos y agregar la habitación al registro
          this.generarEnemigos(room);
        }
      }
    }
    this.activeRoom = room;
  }

  generarEnemigos(room) {
    // Generar enemigos en la habitación
    const numEnemies = Phaser.Math.Between(1, 1); // Generar un número aleatorio de enemigos
    // Guardar la cantidad de enemigos generados en la habitación
    this.habitacionesConEnemigos.set(room, numEnemies);

    for (let i = 0; i < numEnemies; i++) {
      const enemyX = Phaser.Math.Clamp(
        Phaser.Math.Between(room.left + 1, room.right - 1),
        room.left + 1,
        room.right - 1
      );
      const enemyY = Phaser.Math.Clamp(
        Phaser.Math.Between(room.top + 1, room.bottom - 1),
        room.top + 1,
        room.bottom - 1
      );
      const enemy = this.enemigosGroup.get(
        enemyX * 16 + 8,
        enemyY * 16 + 8,
        "Enemigo"
      );
      enemy.setActive(true);
      enemy.setVisible(true);
      this.enemigosGroup.add(enemy);
      enemy.jugador = this.jugador;
      enemy.animationEnemigo(this.enemyList);

      // Se agrega el colisionador entre el enemigo y el grupo de enemigos
      this.physics.add.collider(enemy, this.enemigosGroup);
    }
  }

  eliminarEnemigo(room) {
    // Reducir la cantidad de enemigos vivos en la habitación
    const remainingEnemies = this.habitacionesConEnemigos.get(room) - 1;
    if (remainingEnemies <= 0) {
      // Si ya no quedan enemigos vivos en la habitación, eliminar la entrada del registro
      this.habitacionesConEnemigos.delete(room);
    } else {
      // Actualizar la cantidad de enemigos vivos en la habitación
      this.habitacionesConEnemigos.set(room, remainingEnemies);
    }
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
