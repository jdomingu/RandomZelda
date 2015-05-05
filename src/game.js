/*jshint globalstrict: true*/
/*jshint browser:true */
'use strict';

var RZ = RZ || {};

RZ.Game = {
    init: function (id, seed) {
        RZ.Screen.init(id); // Set up game canvases 
        RZ.Keyboard.init();

        this.dungeon = new RZ.Dungeon(RZ.Screen.width, RZ.Screen.height, seed);
        this.rooms = this.dungeon.generate();
        this.map = new RZ.Map(this.dungeon, RZ.Screen.map);
        this.map.draw(this.dungeon.grid, this.rooms);

        this.player = new RZ.Player(RZ.Screen.fg);
        RZ.Assets.init(RZ.Game.player.init); // Load images

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
