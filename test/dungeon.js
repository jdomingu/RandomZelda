var test = require('tape');
var Dungeon = require('../src/dungeon.js');

test('End to end room generation', function (t) {
    // Should return an array of rooms that matches the preset value.
    var dungeon = new Dungeon(16, 10, 25, 707); // (cols, rows, num_rooms, seed_value)
    var roomCoordJSON = '[{"x":8,"y":5},{"x":7,"y":5},{"x":7,"y":6},{"x":7,"y":7},{"x":8,"y":7},{"x":8,"y":6},{"x":9,"y":6},{"x":9,"y":7},{"x":9,"y":8},{"x":10,"y":8},{"x":11,"y":8},{"x":11,"y":9},{"x":10,"y":9},{"x":8,"y":4},{"x":8,"y":3},{"x":9,"y":9},{"x":8,"y":9},{"x":8,"y":8},{"x":6,"y":7},{"x":6,"y":8},{"x":5,"y":8},{"x":5,"y":7},{"x":9,"y":5},{"x":10,"y":5},{"x":11,"y":5},{"x":12,"y":5}]';

    t.equal(JSON.stringify(dungeon.generate()),roomCoordJSON);

    // Should throw an error if the number of rooms is fewer than 6.
    t.throws(function () { new Dungeon(16, 10, 5, 707); });

    // Should throw an error if the number of rooms is greater than (rows * cols) / 2.
    t.throws(function () { new Dungeon(16, 10, 81, 707); });

    t.end();
});

test('Create 2D grid', function (t) {
    t.equal(JSON.stringify(Dungeon.prototype.make2DGrid(5, 5)), '[[],[],[],[],[]]');
    t.end();
});
