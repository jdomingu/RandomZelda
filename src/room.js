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
    wallWidth: 48 * 2,

    draw: function (canvas) {
        var context = canvas.getContext('2d'),
            layout = this.layouts[this.roomLayout],
            rowsLen = layout.length,
            colsLen;
        
        context.drawImage(RZ.Assets.img.tiles, 0, 96, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        this.drawLayer(canvas, this.tiles);

        context.fillStyle = RZ.Screen.color;
        context.globalAlpha = 0.5;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1.0;

        this.drawLayer(canvas, this.tiles_contrast);
        context.drawImage(RZ.Assets.img.tiles, 0, 624, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
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

    // TO DO: Replace with empty coords except for walls, then generate 
    // correct coords from roomLayout and doors
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
        var coordX = Math.floor(x / 48),
            coordY = Math.floor(y / 48);

        return [coordX, coordY];
    },

    /* Tile Legend
     * 0 - Empty tile
     * 1 - Block
     * 2 - Right-facing statue
     * 3 - Left-facing statue
     * 4 - Speckled tile
     * 5 - Stairs
     * 6 - Water
     */
    tiles: {
        '0': [0, 0],
        '1': [0, 48],
        '2': [0, 96],
        '3': [0, 144],
        '4': [0, 192],
        '5': [0, 240],
        '6': [0, 288]
    },

    tiles_contrast: {
        '0': [48, 0],
        '1': [48, 48],
        '2': [48, 96],
        '3': [48, 144],
        '4': [48, 192],
        '5': [48, 240],
        '6': [48, 288]
    },


    /* Layout Legend
     * Entrance - start room with statues
     * Empty - all blank tiles
     * One - one island of blocks in the center
     * Two- two islands of blocks on the sides
     * Four - four blocks near the corners
     * Five - five groups of blocks in an X formation
     * Brackets - water fills two bracket shaped trenches
     */
    layouts: {
        'entrance': [
            [0,0,0,0,0,0,0],
            [0,2,0,2,0,2,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,4,4],
            [0,2,0,2,0,2,4],
            [0,0,0,0,4,4,4],
            [0,0,0,0,4,4,4],
            [0,3,0,3,0,3,4],
            [0,0,0,0,0,4,4],
            [0,0,0,0,0,0,0],
            [0,3,0,3,0,3,0],
            [0,0,0,0,0,0,0]
        ],

        'empty': [
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0]
        ],

        'one': [
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0],
            [0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0]
        ],

        'two': [
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0],
            [0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0],
            [0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0]
        ], 
        
        'four': [
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,1,0,1,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,1,0,1,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0]
        ],

        'five': [
            [0,0,0,0,0,0,0],
            [0,1,0,0,0,1,0],
            [0,1,0,0,0,1,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,1,0,0,0],
            [0,0,0,1,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,1,0,0,0,1,0],
            [0,1,0,0,0,1,0],
            [0,0,0,0,0,0,0]
        ],

        'brackets': [
            [0,0,0,0,0,0,0],
            [0,6,6,6,6,6,0],
            [0,6,0,0,0,6,0],
            [0,6,0,6,0,6,0],
            [0,0,0,6,0,0,0],
            [0,0,0,6,0,0,0],
            [0,0,0,6,0,0,0],
            [0,0,0,6,0,0,0],
            [0,6,0,6,0,6,0],
            [0,6,0,0,0,6,0],
            [0,6,6,6,6,6,0],
            [0,0,0,0,0,0,0]
        ]
    }
};
