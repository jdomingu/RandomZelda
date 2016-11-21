/*jshint globalstrict: true*/
/*jshint browser:true */
'use strict';

var RZ = RZ || {};

RZ.Game = {
    init: function (id, seed) {
        var rooms, map;

        RZ.Screen.init(id); // Set up canvases

        this.dungeon = new RZ.Dungeon(RZ.Screen.map.width, RZ.Screen.map.height, seed); // Create dungeon object
        rooms = this.dungeon.generate(); // Generate random dungeon
        map = new RZ.Map(this.dungeon, RZ.Screen.map);
        this.currentRoom = this.dungeon.startRoom;
		this.currentRoom.accessibleCoords = this.currentRoom.generateAccessibleCoords();
        this.color = this.dungeon.color;
        this.player = new RZ.Player(RZ.Screen.main);

        return [this.dungeon.grid, rooms, map];
    },

    run: function (obj) {
        var grid = obj[0],
            rooms = obj[1],
            map = obj[2];

        var startDrawing = function () {
            map.draw(grid, rooms);
            RZ.Game.currentRoom.draw(RZ.Screen.bg, RZ.Screen.fg);
            RZ.Game.player.drawOnce();
        };

        RZ.Assets.init(startDrawing); // Load images, then call the startDrawing callback
        RZ.Keyboard.init(); // Start keyboard events

        this.main();
    },

    locked: false,

    paused: false,

    main: function () {
        window.requestAnimationFrame(RZ.Game.main);

        if (RZ.Game.locked === false) {   // Do not accept input during screen transitions
            RZ.Keyboard.checkMapToggle();

			if (RZ.Game.paused === false && // Do not respond to player movement when paused
				RZ.Keyboard.areMovementKeysDown() === true) { // Only update when the player moves
					RZ.Game.player.update();
            }
        }
    }

};
