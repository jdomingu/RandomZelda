/*jshint globalstrict: true*/
/*jshint browser:true */
'use strict';

var RZ = RZ || {};

RZ.Game = function (id, seed) {
    var canvas = document.getElementById(id),
        context = canvas.getContext('2d'),
        width = canvas.clientWidth, // Get the width of the canvas element
        height = canvas.clientHeight, // Same for the height
        dungeon = new RZ.Dungeon(width, height, seed),
        rooms = dungeon.generate(),
        map = new RZ.Map(dungeon, context);

    return map.draw(dungeon.grid, rooms);
};
