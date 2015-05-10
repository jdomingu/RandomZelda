RZ.Room = function () {
    // Set default values
    this.roomType = 'seed'; // Or 'branch', 'fake', 'boss'
    this.roomLayout = 'empty'; // Or 'entrance', 'four', 'five', etc.
    this.door = {};
    this.door.up = 'none';  // Or 'open', 'locked'
    this.door.down = 'none';
    this.door.left = 'none';
    this.door.right = 'none';
    this.width = 48; // Tile width and height
    this.height = 48;
};

RZ.Room.prototype = {
    wallWidth: 96,

    defaultAccessibleCoords: [
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1]
    ],

    draw: function (canvas) {
        var context = canvas.getContext('2d'),
            layout = this.layouts[this.roomLayout],
            walls = RZ.Assets.legend.walls,
            walls_contrast = RZ.Assets.legend.walls_contrast,
            doors = RZ.Assets.legend.doors,
            doors_contrast = RZ.Assets.legend.doors_contrast,
            rowsLen = layout.length,
            colsLen;
        
        context.drawImage(RZ.Assets.img.tiles, walls[0], walls[1], canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        this.drawLayer(canvas, RZ.Assets.legend.tiles);
        this.drawDoors(context, doors);

        context.fillStyle = RZ.Screen.color;
        context.globalAlpha = 0.5;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1.0;

        this.drawLayer(canvas, RZ.Assets.legend.tiles_contrast);
        context.drawImage(RZ.Assets.img.tiles, walls_contrast[0], walls_contrast[1], canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        this.drawDoors(context, doors_contrast);
    },

    drawLayer: function (canvas, tiles) {
        var context = canvas.getContext('2d'),
            layout = this.layouts[this.roomLayout],
            rowsLen = layout.length,
            colsLen;
        
        for (var i = 0; i < rowsLen; i++) {
            colsLen = layout[i].length;

            for (var j = 0; j < colsLen; j++) {
                var x = i * this.width + this.wallWidth,
                    y = j * this.height + this.wallWidth,
                    sx = tiles[layout[i][j]][1],
                    sy = tiles[layout[i][j]][0];

                context.drawImage(RZ.Assets.img.tiles, sx, sy, this.width, this.height, x, y, this.width, this.height);
            }
        }
    },

    drawDoors: function (context, doors_legend) {
        var sx, sy, dx, dy, width, height;

        for (var door in this.door) {
            if (this.door[door] === 'open' || this.door[door] === 'locked') {
                sx = doors_legend[door][this.door[door]][0];
                sy = doors_legend[door][this.door[door]][1];
                dx = doors_legend[door][this.door[door]][2];
                dy = doors_legend[door][this.door[door]][3];
                width = doors_legend[door][this.door[door]][4];
                height = doors_legend[door][this.door[door]][5];
                context.drawImage(RZ.Assets.img.tiles, sx, sy, width, height, dx, dy, width, height);
            }
        }
    },

    generateAccessibleCoords: function () {
		var accessibleCoords = this.defaultAccessibleCoords.slice(),
			layout = this.layouts[this.roomLayout],
			rowsLen = layout.length,
			colsLen;
        
        if (this.roomLayout !== 'empty') { // If the room is empty, don't iterate
            for (var i = 0; i < rowsLen; i++) { // through the tiles
                colsLen = layout[i].length;

                for (var j = 0; j < colsLen; j++) {
                    var wallWidthInTiles = this.wallWidth / this.width,
                        accessible;

                    if (layout[i][j] === 0 || layout[i][j] === 4) {
                        accessible = 0;
                    } else {
                        accessible = 1;
                    }
                    accessibleCoords[i + 2][j + 2] = accessible;
                }
            }
        }
		return accessibleCoords;
	},

    isAccessible: function (x, y) {
        var coords = this.convertPixelsToCoords(x, y); 

        if (coords[0] >= 0 && coords[0] < this.accessibleCoords.length &&
                coords[1] >= 0 && coords[1] < this.accessibleCoords[coords[0]].length) {
            if (this.accessibleCoords[coords[0]][coords[1]] === 0) {
                return true;
            } 
        }

        return false;
    },

    convertPixelsToCoords: function (x, y) {
        var coordX = Math.floor(x / this.width),
            coordY = Math.floor(y / this.height);

        return [coordX, coordY];
    }
    
};
