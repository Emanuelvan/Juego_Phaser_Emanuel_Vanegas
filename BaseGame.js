const debug = false;

const TILES = {
    TOP_LEFT_WALL: 0,
    TOP_RIGHT_WALL: 2,
    BOTTOM_RIGHT_WALL: 50,
    BOTTOM_LEFT_WALL: 48,
    TOP_WALL: [
        { index: 1, weight: 4 },
        { index: 170, weight: 1 },
        { index: 169, weight: 1 },
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
};

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

    preload() {
        this.load.spritesheet("personaje", "Assets/Personaje/knight1.png", {
            frameWidth: 72,
            frameHeight: 72,
        });
        this.load.image("tiles", "Assets/Tiles_Map/dungeon_sheet.png");
        this.load.atlas(
            "PlayerAnimation",
            "Jugador/Animaciones/Animacion_Knight.png",
            "Jugador/Animaciones/Animacion_Knight.json"
        );
        this.load.audio(
            "Ambiente",
            "Audio/Music/Old RuneScape Soundtrack Crystal Sword.mp3"
        );
    }

    create() {
        this.mazmorra = new Dungeon({
            width: 50,
            height: 50,
            cuartos: {
                width: { min: 2, max: 4, onlyOdd: true },
                height: { min: 2, max: 4, onlyOdd: true },
            },
        });
        this.mapa = this.make.tilemap({
            tileWidth: 16,
            tileHeight: 16,
            width: this.mazmorra.width,
            height: this.mazmorra.height,
        });
        var tileset = this.mapa.addTilesetImage("tiles", "tiles", 16, 16);
        this.layer = this.mapa.createBlankLayer("Layer 1", tileset).setPipeline('Light2D');;
        this.BackgroundMusic = this.sound.add("Ambiente");
        this.BackgroundMusic.play({ loop: true, volume: 0.0 }); //Volumen del audio
        if (!debug) {
            this.layer.setScale(5);
        }
        this.layer.fill(2);


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

            // Pone objetos de forma aleatoria en los cuartos
            var rand = Math.random();
            if (rand <= 0.25) {
                this.layer.putTileAt(154, cx, cy); // Cubo de Liz en la mitad del cuarto
            } else if (rand <= 0.25) {
                this.layer.putTileAt(182, cx, cy); // Caja xd
            } else if (rand <= 0.4) {
                this.layer.putTileAt(211, cx, cy); // Armadura
            } else if (rand <= 0.6) {
                if (cuarto.height >= 9) {
                    // Crea torres de forma aleatoria en el centro de los cuartos
                    this.layer.putTilesAt([[74], [98]], cx - 1, cy + 1);

                    this.layer.putTilesAt([[74], [98]], cx + 1, cy + 1);

                    this.layer.putTilesAt([[74], [98]], cx - 1, cy - 2);

                    this.layer.putTilesAt([[74], [98]], cx + 1, cy - 2);
                } else {
                    this.layer.putTilesAt([[74], [98]], cx - 1, cy - 1);

                    this.layer.putTilesAt([[74], [98]], cx + 1, cy - 1);
                }
            }
        }, this);

        this.layer.setCollisionByExclusion([25, 207, 183, 184, 185, 186]);
        if (!debug) {
            this.layer.forEachTile(function (tile) {
                tile.alpha = 0;
            });
        }
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
        var playerRoom = this.mazmorra.rooms[0];

        //Se crea al jugador
        this.jugador = new jugador(
            this,
            this.mapa.tileToWorldX(playerRoom.x + 2),
            this.mapa.tileToWorldY(playerRoom.y + 2),
            "personaje"
        ).setPipeline('Light2D');
        this.jugador.animationCharacter(playerList);


        this.luces = this.lights.addLight(this.jugador.x, this.jugador.y, 200,0xffffff,2);
        this.lights.enable();

        if (!debug) {
            this.setRoomAlpha(playerRoom, 1); // Muestra la primera habitación
        }

        this.cam = this.cameras.main;
        this.cam
            .setBounds(
                0,
                0,
                this.layer.width * this.layer.scaleX,
                this.layer.height * this.layer.scaleY
            )
            .setName("Camara Principal");
        this.cam.scrollX = this.jugador.x - this.cam.width * 0.5;
        this.cam.scrollY = this.jugador.y - this.cam.height * 0.5;

        this.info = this.add.text(
            300,
            16,
            "Usa WASD para moverte y ESPACIO para atacar",
            {
                padding: { x: 5, y: 5 },
                backgroundColor: "#ffffff",
                fill: "#000000",
            }
        );
        this.info.setScrollFactor(0);

        //Se crea el minimapa
        this.minimap = new Minimap(800, 30, 200, 200)
            .setZoom(0.1)
            .setName("miniMap");
        this.cameras.addExisting(this.minimap);
        this.minimap.ignore(this.info);
        //this.minimap.ignore();
        console.log(this.luces);
    }
    update(time) {
        
        
        this.luces.x = this.jugador.x
        this.luces.y = this.jugador.y
        //Crear una luz para el jugador;
        //Se actualiza la posicion en el minimapa
        this.minimap.actulizarPosMinimap(this.jugador);
        //Se actuliza la posisición del jugador
        this.jugador.updatePlayerMovement(time);
        var playerTileX = this.mapa.worldToTileX(this.jugador.x);
        var playerTileY = this.mapa.worldToTileY(this.jugador.y);
        //Un metodo que ayuda a generar las habitaciones creando el cuarto al momento que el jugador entra a la habitación
        var room = this.mazmorra.getRoomAt(playerTileX, playerTileY);

        if (room && this.activeRoom && this.activeRoom !== room) {
            //Hace que el cuarto anterior se oscurezca
            if (!debug) {
                this.setRoomAlpha(room, 1);
                this.setRoomAlpha(this.activeRoom, 0.5);
            }
        }

        this.activeRoom = room;
        // La camara sigue al jugador
        this.cameras.main.startFollow(this.jugador, false, 0.2, 0.2);
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
        // nonNull = true, don't return null for empty tiles. This means null will be returned only for
        // tiles outside of the bounds of the mapa.
        var tile = this.mapa.getTileAtWorldXY(worldX, worldY, true);
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
    scene: Juego_Principal,
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
        },
    },
};

const game = new Phaser.Game(config);
