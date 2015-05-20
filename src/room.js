RZ.Room = function (x, y) {
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
    this.x = x; // Location on the dungeon grid
    this.y = y;
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

    doorPixelCoords: {
        // Denotes the space that Link can walk into. Necessary because side doors
        // align with a half-grid
        // [[upper left x, upper left y], [lower right x, lower right y]
        left: [[0, 250], [96, 295]], // Left and right doors have narrower heights 
        up: [[360, 0], [408, 96]],  // because Link can usually overlap objects
        right: [[672, 250], [768, 295]], // to give the appearance of him walking
        down: [[360, 432], [408, 528]]  // in front of things
    }, 

   /* If Link stands in one of these zones, trigger
    * a transition to another room
    * [dest_x, dest_y, width, height] */
    doorTransitionZones: {
        // Denotes the space that Link can walk into. Necessary because side doors
        // align with a half-grid
        // [[upper left x, upper left y], [lower right x, lower right y]
        left: [[0, 235], [24, 295]],
        up: [[360, 0], [408, 24]], 
        right: [[711, 235], [768, 295]], 
        down: [[360, 476], [408, 528]] 
    }, 


    draw: function (bg, fg) {
        var bgContext = bg.getContext('2d'),
            fgContext = fg.getContext('2d'),
            layout = this.layouts[this.roomLayout],
            walls = RZ.Assets.legend.walls,
            walls_contrast = RZ.Assets.legend.walls_contrast,
            wall_frames = RZ.Assets.legend.wall_frames,
            wall_frames_contrast = RZ.Assets.legend.wall_frames_contrast,
            doors = RZ.Assets.legend.doors,
            doors_contrast = RZ.Assets.legend.doors_contrast,
            door_frames = RZ.Assets.legend.door_frames,
            door_frames_contrast = RZ.Assets.legend.door_frames_contrast,
            rowsLen = layout.length,
            colsLen;
        
        // Draw grayscale walls without doors
        bgContext.drawImage(RZ.Assets.img.tiles, walls[0], walls[1], walls[4], walls[5], walls[2], walls[3], walls[4], walls[5]);
        // Draw grayscale tiles in the center of the room
        this.drawLayer(bg, RZ.Assets.legend.tiles);

        // Draw a semi-transparent fill between layers
        bgContext.fillStyle = RZ.Game.color;
        bgContext.globalAlpha = 0.5;
        bgContext.fillRect(walls[2], walls[3], walls[4], walls[5]);
        bgContext.globalAlpha = 1.0;

        // Draw a black, high-contrast layer of the walls without doors
        bgContext.drawImage(RZ.Assets.img.tiles, walls_contrast[0], walls_contrast[1], walls_contrast[4], walls_contrast[5], walls_contrast[2], walls_contrast[3], walls_contrast[4], walls_contrast[5]);
        this.drawLayer(bg, RZ.Assets.legend.tiles_contrast);

        // Draw the doors in separate layers as well
        this.drawDoors(bgContext, doors, doors_contrast, fgContext, door_frames, door_frames_contrast);

        this.drawWallFrames(fgContext, wall_frames, wall_frames_contrast);
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


    drawWallFrames: function (context, wall_frames, wall_frames_contrast) {
        this.drawWallFrameLayer(context, wall_frames);
        this.drawWallFrameFillLayer(context, wall_frames);
        this.drawWallFrameLayer(context, wall_frames_contrast);
    },

    drawWallFrameLayer: function (context, wall_legend) {
        var sx, sy, dx, dy, width, height;

        for (var wall in wall_legend) {
            sx = wall_legend[wall][0];
            sy = wall_legend[wall][1];
            dx = wall_legend[wall][2];
            dy = wall_legend[wall][3];
            width = wall_legend[wall][4];
            height = wall_legend[wall][5];
            context.drawImage(RZ.Assets.img.tiles, sx, sy, width, height, dx, dy, width, height);
        }
    },

    drawWallFrameFillLayer: function (context, wall_legend) {
        var sx, sy, dx, dy, width, height;

        for (var wall in wall_legend) {
            sx = wall_legend[wall][0];
            sy = wall_legend[wall][1];
            dx = wall_legend[wall][2];
            dy = wall_legend[wall][3];
            width = wall_legend[wall][4];
            height = wall_legend[wall][5];

            context.fillStyle = RZ.Game.color;
            context.globalAlpha = 0.5;
            context.fillRect(dx, dy, width, height);
            context.globalAlpha = 1.0;
        }
    },

    drawDoors: function (bgContext, doors, doors_contrast, fgContext, door_frames, door_frames_contrast) {
        this.drawDoorsLayer(bgContext, doors);
        this.drawDoorsFillLayer(bgContext, doors);
        this.drawDoorsLayer(bgContext, doors_contrast);

        // Draw the door frame on a separate canvas so that Link can appear
        // to walk underneath them
        this.drawDoorsLayer(fgContext, door_frames);
        this.drawDoorsFillLayer(fgContext, door_frames);
        this.drawDoorsLayer(fgContext, door_frames_contrast);
    },

    drawDoorsLayer: function (context, doors_legend) {
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

    drawDoorsFillLayer: function (context, doors_legend) {
        var dx, dy, width, height;

        for (var door in this.door) {
            if (this.door[door] === 'open' || this.door[door] === 'locked') {
                dx = doors_legend[door][this.door[door]][2];
                dy = doors_legend[door][this.door[door]][3];
                width = doors_legend[door][this.door[door]][4];
                height = doors_legend[door][this.door[door]][5];

                context.fillStyle = RZ.Game.color;
                context.globalAlpha = 0.5;
                context.fillRect(dx, dy, width, height);
                context.globalAlpha = 1.0;
            }
        }
    },

    generateAccessibleCoords: function () {
		var accessibleCoords = JSON.parse(JSON.stringify(this.defaultAccessibleCoords)), 
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
            if (this.accessibleCoords[coords[0]][coords[1]] === 0 ||
                    this.isAccessibleDoor(x, y) === true) {
                return true;
            } 
        }

        return false;
    },

    isAccessibleDoor: function (x, y) {
        // Is this space a door that Link can walk into? Compare his coordinates
        // to the upper left and lower right door coordinates
        for (var door in this.door) {
            if (this.door[door] === 'open') {
                if (x >= this.doorPixelCoords[door][0][0] && x <= this.doorPixelCoords[door][1][0] &&
                    y >= this.doorPixelCoords[door][0][1] && y <= this.doorPixelCoords[door][1][1]) {
                    return true;
                }
            }
        }
    },

    checkDoorTransition: function (x, y) {
        // Is this space on the far edge of a door, necessitating a transition between rooms?
        for (var door in this.door) {
            if (this.door[door] === 'open') {
                if (x >= this.doorTransitionZones[door][0][0] && x <= this.doorTransitionZones[door][1][0] &&
                    y >= this.doorTransitionZones[door][0][1] && y <= this.doorTransitionZones[door][1][1]) {

                    var nextRoomX = this.x, 
                        nextRoomY = this.y,
                        nextPlayerX,
                        nextPlayerY;

                    if (door === 'left') {
                        nextPlayerX = 708;
                        nextPlayerY= 240;
                        nextRoomX -= 1;
                    } else if (door === 'right') {
                        nextPlayerX = 28;
                        nextPlayerY= 240;
                        nextRoomX += 1;
                    } else if (door === 'up') {
                        nextPlayerX= 360;
                        nextPlayerY= 472;
                        nextRoomY -= 1;
                    } else if (door === 'down') {
                        nextPlayerX= 360;
                        nextPlayerY= 28;
                        nextRoomY += 1;
                    }

                    RZ.Screen.roomTransition(nextRoomX, nextRoomY, nextPlayerX, nextPlayerY);
                    return true;
                }
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
