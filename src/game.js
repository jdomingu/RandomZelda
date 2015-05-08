/*jshint globalstrict: true*/
/*jshint browser:true */
'use strict';

var RZ = RZ || {};

RZ.Game = {
    init: function (id, seed) {
        var dungeon, rooms, map;
        
        RZ.Screen.init(id); // Set up canvases

        dungeon = new RZ.Dungeon(RZ.Screen.width, RZ.Screen.height, seed); // Create dungeon object
        rooms = dungeon.generate(); // Generate random dungeon
        map = new RZ.Map(dungeon, RZ.Screen.map);
        this.currentRoom = dungeon.startRoom;
        this.player = new RZ.Player(RZ.Screen.fg);

        return [dungeon.grid, rooms, map];
    }, 

    run: function (obj) {
        var grid = obj[0],
            rooms = obj[1],
            map = obj[2];

        var startDrawing = function () {
            map.draw(grid, rooms);
            RZ.Game.currentRoom.draw(RZ.Screen.bg);
            RZ.Game.player.drawOnce();
        }; 

        RZ.Assets.init(startDrawing); // Load images, then call the startDrawing callback
        RZ.Keyboard.init(); // Start keyboard events
        
        this.main();
    },

    paused: false,

    main: function () {
        window.requestAnimationFrame(RZ.Game.main);

        RZ.Keyboard.checkMapToggle();

        if (RZ.Game.paused === false) {
            if (RZ.Keyboard.areMovementKeysDown()) {
                RZ.Game.player.update();
            }
        }
    }

};
