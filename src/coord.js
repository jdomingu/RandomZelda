var Coord = function(x, y) {
    this.x = x;
    this.y = y;
};

Coord.prototype = {
    getAdjacentCoords: function () {
        return [
            new Coord(this.x + 1, this.y),
            new Coord(this.x - 1, this.y),
            new Coord(this.x, this.y + 1),
            new Coord(this.x, this.y - 1)
        ];
    }
};

module.exports = Coord;
