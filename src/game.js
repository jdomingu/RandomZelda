/*jshint globalstrict: true*/
/*jshint browser:true */
'use strict';

var RZ = RZ || {};

RZ.Game = {
    init: function (id, seed) {
        var dungeon, rooms, map;

        RZ.Assets.init(); // Load images
        RZ.Screen.init(id); // Set up game canvases 
        RZ.Keyboard.init();

        dungeon = new RZ.Dungeon(RZ.Screen.width, RZ.Screen.height, seed);
        rooms = dungeon.generate();
        map = new RZ.Map(dungeon, RZ.Screen.bg);
        map.draw(dungeon.grid, rooms);
        this.player = new RZ.Player();

        this.main();
    }, 

    main: function () {
        window.requestAnimationFrame(RZ.Game.main);
        RZ.Game.player.update(RZ.Screen.fg);
    }

};
