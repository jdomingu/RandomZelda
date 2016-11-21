var test = require('tape');
var Dungeon = require('../src/dungeon.js');

test('Create 2D grid', function (t) {
    t.equal(JSON.stringify(Dungeon.prototype.make2DGrid(5, 5)), '[[],[],[],[],[]]');
    t.end();
});
