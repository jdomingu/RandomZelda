var Assets = require('./assets');
var Coord = require('./coord');
var Dungeon = require('./dungeon');
var Keyboard = require('./keyboard');
var Maps = require('./map');
var Player = require('./player');
var Screen = require('./screen');

var Game = {
    init: function (id, seed) {
        var rooms, map, width, height, rows, cols,
            room_size = 24,
            num_rooms = 25;

        Screen.init(id); // Set up canvases
        width = Screen.map.width / 2;
        height = Screen.map.height / 3;
        rows = Math.floor(height / room_size);
        cols = Math.floor(width / room_size);

        this.dungeon = new Dungeon(cols, rows, num_rooms, seed); // Create dungeon object
        rooms = this.dungeon.generate(); // Generate random dungeon
        map = new Maps(room_size, width, height, Screen.map);
        this.currentRoom = this.dungeon.startRoom;
		this.currentRoom.accessibleCoords = this.currentRoom.generateAccessibleCoords();
        this.color = this.dungeon.color;
        this.player = new Player(Screen.main);

        return [this.dungeon.grid, rooms, map];
    },

    run: function (obj) {
        var grid = obj[0],
            rooms = obj[1],
            map = obj[2];

        var startDrawing = function () {
            map.draw(grid, rooms);
            Game.currentRoom.draw(Screen.bg, Screen.fg);
            Game.player.drawOnce();
        };

        Assets.init(startDrawing); // Load images, then call the startDrawing callback
        Keyboard.init(); // Start keyboard events

        this.main();
    },

    locked: false,

    paused: false,

    main: function () {
        window.requestAnimationFrame(Game.main);

        if (Game.locked === false) {   // Do not accept input during screen transitions
            Keyboard.checkMapToggle();

			if (Game.paused === false && // Do not respond to player movement when paused
				Keyboard.areMovementKeysDown() === true) { // Only update when the player moves
					Game.player.update();
            }
        }
    }

};

module.exports = Game;
