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
    headsUpDisplayHeight: 48 * 4, 

    roomFrameSize: 48 * 2,

    draw: function (canvas) {
        var context = canvas.getContext('2d'),
            layout = this.layouts[this.roomLayout],
            rowsLen = layout.length,
            colsLen;
            
        context.fillStyle = '#000044';
        context.fillRect(0, 0, RZ.Screen.width, RZ.Screen.height);
        // Add a black background for the heads up display
        context.fillStyle = '#000000';
        context.fillRect(0, 0, RZ.Screen.width, this.headsUpDisplayHeight);

        for (var i = 0; i < rowsLen; i++) {
            colsLen = layout[i].length;

            for (var j = 0; j < colsLen; j++) {
                var x = i * this.width + this.roomFrameSize,
                    y = j * this.height + this.roomFrameSize + this.headsUpDisplayHeight;

                context.drawImage(RZ.Assets.tiles, this.tiles[layout[i][j]][1], this.tiles[layout[i][j]][0], this.width, this.height, x, y, this.width, this.height);
            }
        }
    },

    /* Tile Legend
     * 0 - Empty tile
     * 1 - Block
     * 2 - Right-facing statue
     * 3 - Left-facing statue
     * 4 - Speckled tile
     * 5 - Stairs
     */
    tiles: {
        '0': [0, 0],
        '1': [0, 48],
        '2': [0, 96],
        '3': [0, 144],
        '4': [0, 192],
        '5': [0, 240]
    },

    /* Layout Legend
     * Entrance - start room with statues
     * Empty - all blank tiles
     * One - one island of blocks in the center
     * Two- two islands of blocks on the sides
     * Four - four blocks near the corners
     * Five - five groups of blocks in an X formation
     */
    layouts: {
        'entrance': [
            [0,0,0,0,0,0,0],
            [0,2,0,2,0,2,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,2,0,2,0,2,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,3,0,3,0,3,0],
            [0,0,0,0,0,0,0],
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
        ]
    }
};
