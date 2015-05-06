/*jshint globalstrict: true*/
/*jshint browser:true */
'use strict';

var RZ = RZ || {};

RZ.Game = {
    init: function (id, seed) {
        var map, rooms;
        
        var startDrawing = function () {
            map.draw(RZ.Game.dungeon.grid, rooms);
            RZ.Game.currentRoom.draw(RZ.Screen.bgCanvas);
            RZ.Game.player.init();
        }; 
        
        RZ.Screen.init(id); // Set up canvases
        RZ.Keyboard.init(); // Start keyboard events
        RZ.Assets.init(startDrawing); // Load images, then call the startDrawing callback

        this.dungeon = new RZ.Dungeon(RZ.Screen.width, RZ.Screen.height, seed); // Create dungeon object
        rooms = this.dungeon.generate(); // Generate random dungeon
        map = new RZ.Map(this.dungeon, RZ.Screen.map);
        this.currentRoom = this.dungeon.startRoom;
        this.player = new RZ.Player(RZ.Screen.fg);

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
