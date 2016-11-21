var Assets = require('./assets');
var Coord = require('./coord');
var Dungeon = require('./dungeon');
var Keyboard = require('./keyboard');
var Maps = require('./map');
var Player = require('./player');
var Screen = require('./screen');

var Game = {
    init: function (id, seed) {
        var rooms, map;
        Screen.init(id); // Set up canvases

        this.dungeon = new Dungeon(Screen.map.width, Screen.map.height, seed); // Create dungeon object
        rooms = this.dungeon.generate(); // Generate random dungeon
        map = new Maps(this.dungeon, Screen.map);
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
