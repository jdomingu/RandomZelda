/*jshint globalstrict: true*/
/*jshint browser:true */
'use strict';

var RZ = RZ || {};

RZ.Game = function (id, seed) {
    var canvas = document.getElementById(id),
        context = canvas.getContext('2d'),
        width = canvas.clientWidth, // Get the width of the canvas element
        height = canvas.clientHeight, // Same for the height
        map = new RZ.Map(context, width, height),
        generator = new RZ.Generator(map, seed),
        graph = generator.generate(map);

    return map.draw(map.grid, graph);
};
