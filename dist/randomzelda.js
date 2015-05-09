/*jshint globalstrict: true*/
/*jshint browser:true */
'use strict';

var RZ = RZ || {};

RZ.Game = {
    init: function (id, seed) {
        var dungeon, rooms, map;
        
        RZ.Screen.init(id); // Set up canvases

        dungeon = new RZ.Dungeon(RZ.Screen.map.width, RZ.Screen.map.height, seed); // Create dungeon object
        rooms = dungeon.generate(); // Generate random dungeon
        map = new RZ.Map(dungeon, RZ.Screen.map);
        this.currentRoom = dungeon.startRoom;
        this.player = new RZ.Player(RZ.Screen.fg);

        return [dungeon.grid, rooms, map];
    }, 

    run: function (obj) {
        var grid = obj[0],
            rooms = obj[1],
            map = obj[2];

        var startDrawing = function () {
            map.draw(grid, rooms);
            RZ.Game.currentRoom.draw(RZ.Screen.bg);
            RZ.Game.player.drawOnce();
        }; 

        RZ.Assets.init(startDrawing); // Load images, then call the startDrawing callback
        RZ.Keyboard.init(); // Start keyboard events
        
        this.main();
    },

    locked: false,

    paused: false,

    main: function () {
        window.requestAnimationFrame(RZ.Game.main);

        if (RZ.Game.locked === false) {   // Do not accept input during screen transitions
            RZ.Keyboard.checkMapToggle();

			if (RZ.Game.paused === false && // Do not respond to player movement when paused
				RZ.Keyboard.areMovementKeysDown() === true) { // Only update when the player moves
					RZ.Game.player.update();
            }
        }
    }

};

RZ.Assets = {
    init: function (callback) {
        var img = [];
        this.img = img;

        var imagesToLoad = [
            ['tiles', 'img/tiles.png'],
            ['link', 'img/link.png']
        ];

        var imgLen = imagesToLoad.length;
        var loadCount = imgLen;

        var isDoneLoading = function () {
            loadCount -= 1;
            if (loadCount === 0) {
                callback();
            }
        };

        var loadImage = function (imgName, imgPath) {
            img[imgName] = new Image();
            img[imgName].onload = function () {
                isDoneLoading();
            };
            img[imgName].src = imgPath;
        };

        for (var i = 0; i < imgLen; i++) {
            loadImage(imagesToLoad[i][0], imagesToLoad[i][1]);
        }
    }
};

RZ.Coord = function(x, y) {
    this.x = x;
    this.y = y;
};

RZ.Coord.prototype = {
    getAdjacentCoords: function () {
        return [
            new RZ.Coord(this.x + 1, this.y),
            new RZ.Coord(this.x - 1, this.y),
            new RZ.Coord(this.x, this.y + 1),
            new RZ.Coord(this.x, this.y - 1)
        ];
    }
};

RZ.Dungeon = function(width, height, seed) {
    // Declare static settings
    this.WIDTH = width / 2; 
    this.HEIGHT = height / 3;
    this.ROOM_SIZE = 24; 
    this.NUM_ROOMS = 25; // The map must be a minimum of 6 rooms
    this.NUM_SEED_ROOMS = Math.ceil(this.NUM_ROOMS / 2) - 1;
    this.NUM_BRANCH_ROOMS = Math.floor(this.NUM_ROOMS / 2);
    this.NUM_ROWS = Math.floor(this.HEIGHT / this.ROOM_SIZE);
    this.NUM_COLUMNS = Math.floor(this.WIDTH / this.ROOM_SIZE);
    this.MAX_BRANCH_LEN = Math.floor(this.NUM_ROOMS / 6);
    this.START_X = Math.floor(this.NUM_COLUMNS / 2);
    this.START_Y = Math.floor(this.NUM_ROWS / 2);

    // Generate the grid
    this.grid = this.make2DGrid(this.NUM_COLUMNS, this.NUM_ROWS);
    this.startRoom = this.grid[this.START_X][this.START_Y] = new RZ.Room(); 
    this.startRoom.roomLayout = 'entrance';
    
    // For testing, use numbers generated from a seed value instead of 
    // from Math.random so that you can get repeatable results
    var seedVal = (undefined === seed) ? Date.now() : seed;
    this.random = Math.seed(seedVal);
    this.initialPosition = new RZ.Coord(this.START_X, this.START_Y);
    this.startingCoords = [this.initialPosition];
    this.edgeCoords = [this.initialPosition];
    
    // Keep track of rooms on the edge that haven't been boxed in
    // so that you can generate branches on those rooms
    this.branches = [];
};

// Patch the Math module to add a seeded PRNG
// Source: https://stackoverflow.com/a/23304189
Math.seed = function(s) {
    return function() {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
};

RZ.Dungeon.prototype = {
    generate: function() {
        var that = this;

        // Make a core set of rooms, called seed rooms, and make branches
        var existingRoomCoords = this.makeRooms(this.grid, this.startingCoords, this.initialPosition, this.NUM_SEED_ROOMS, true);
        existingRoomCoords = this.connectSeedRooms(this.grid, existingRoomCoords);
        existingRoomCoords = this.makeBranches(this.grid, existingRoomCoords, this.NUM_BRANCH_ROOMS, this.MAX_BRANCH_LEN);

        // Sort the branches in-place by distance from the start
        this.branches.sort(function (a, b) { 
            Math.sqrd = (function (x) { return x * x; });
            var distA = Math.sqrt(Math.sqrd(a[0].x - that.START_X) + Math.sqrd(a[0].y - that.START_Y)),
                distB = Math.sqrt(Math.sqrd(b[0].x - that.START_X) + Math.sqrd(b[0].y- that.START_Y));
           return distB - distA;
        }); 

        // Make a boss room at the end of the branch farthest from the start
        this.makeBossRoom(this.grid, existingRoomCoords, this.branches);

        return existingRoomCoords;
    },

    make2DGrid: function (numColumns, numRows) {
        // Make an empty 2D grid to hold rooms that get created. 
        var grid = [];

        while (numColumns > 0) {
            grid.push([]);
            numColumns = numColumns - 1;
        }
        for (var i = 0; i < numColumns; i++) {
            grid[i] = [];
            for (var j = 0; j < numRows; j++) {
                grid[i][j] = [];
            }
        }

        return grid;
    }, 
    
    makeRooms: function (grid, existingRoomCoords, coords, numRoomsRemaining, jumpsAllowed) {
    // Walk a random path, generating rooms as you go.
        var nextRoomCoord;

        if (numRoomsRemaining < 1) {
            return existingRoomCoords;
        } else {
            nextRoomCoord = this.getRandomCoords(grid, existingRoomCoords, this.edgeCoords, coords, jumpsAllowed);

            // If you get boxed in on a branch, return the existing rooms instead of jumping to 
            // another random room and continuing. This prevents discontinuous branches.
            if (nextRoomCoord !== coords) {
                grid[nextRoomCoord.x][nextRoomCoord.y] = new RZ.Room();
                existingRoomCoords.push(nextRoomCoord);
                this.edgeCoords.push(nextRoomCoord);
                this.edgeCoords = this.filterEdgeCoords(grid, this.edgeCoords);
                numRoomsRemaining = numRoomsRemaining - 1;
            } else {
                return existingRoomCoords;
            }

            return this.makeRooms(grid, existingRoomCoords, nextRoomCoord, numRoomsRemaining, jumpsAllowed);
        }
    },

    filterEdgeCoords: function (grid, edgeCoords) {
    // Filter out rooms that have been boxed in, that is, which have already have
    // four neighboring rooms
        var edgeCoordsLen = edgeCoords.length,
            filteredCoords = [],
            isEdge;

        for (var i = 0; i < edgeCoordsLen; i++) {
            if (this.isEdge(grid, edgeCoords[i])) {
                filteredCoords.push(edgeCoords[i]); 
            }   
        }

        return filteredCoords;
    },

    connectSeedRooms: function (grid, existingRoomCoords) {
    // Create open doors between all seed rooms 
    // Call this function before creating branch rooms
        var existingRoomLen = existingRoomCoords.length,
            currentCoord,
            coordsToConnect,
            adjCoords,
            validCoords,
            adjCoord,
            openDoorDir,
            x,
            y;
        
        for (var i = 0; i < existingRoomLen; i++) {
            currentCoord = existingRoomCoords[i];
            adjCoords = currentCoord.getAdjacentCoords();
            validCoords = this.getValidCoords(adjCoords);
            coordsToConnect = this.getExistingCoords(grid, validCoords);

            for (var j = 0; j < coordsToConnect.length; j++) {
                adjCoord = coordsToConnect[j];
                x = currentCoord.x;
                y = currentCoord.y;
                openDoorDir = this.getDoorDirection(currentCoord, adjCoord);
                grid[x][y].door[openDoorDir] = 'open';
            }
        }

        return existingRoomCoords;
    },

    makeBranches: function (grid, existingRoomCoords, numRoomsRemaining, absMaxBranchLen) {
    // Use branches to create locked areas on the map. Creating this after the seed
    // rooms ensures the map is always solvable. (Keys will be spawned in seed rooms only.)
        var maxBranchLen = numRoomsRemaining > absMaxBranchLen ? absMaxBranchLen : numRoomsRemaining,
            currentBranch = [],
            branches = this.branches,
            currentExistingCoordsLen,
            diffInLen,
            randStart,
            branchLen;

        if (numRoomsRemaining < 2) {
            return existingRoomCoords;
        } else {
            randStart = this.getRandomSeedCoords(grid, existingRoomCoords, this.edgeCoords); // Get a random room
            branchLen = 1 + Math.ceil(this.random() * maxBranchLen);
            currentExistingCoordsLen = existingRoomCoords.length;
            currentBranch.push(randStart); // Store the start room to know where to draw the door
            this.makeRooms(grid, existingRoomCoords, randStart, branchLen, false);
            diffInLen = existingRoomCoords.length - currentExistingCoordsLen;
            // If the branch gets boxed in, it might not return the desired branch length.
            // Track the actual returned branch length with the difference to existingRoomCoords 

            for (var i = 0; i < diffInLen; i++) {
                currentBranch.push(existingRoomCoords[existingRoomCoords.length - diffInLen + i]);
            }
            if (diffInLen > 0) {
                this.lockBranch(grid, currentBranch);
            }
            branches.push(currentBranch); // Save the branches to know where to put the boss
            return this.makeBranches(grid, existingRoomCoords, numRoomsRemaining - diffInLen, absMaxBranchLen);
        }

    },

    lockBranch: function (grid, branch) {
    // Given a branch, lock the doors between a given branch and the rest of the map.
    // Set the room type for each room to 'branch'.
        var branchLen = branch.length,
            lockedDoorDir,
            openDoorDir,
            x,
            y;

        for (var j = 0; j < branchLen; j++) {
            x = branch[j].x;
            y = branch[j].y;

            if (branchLen < 2) { // Can't lock branches one room long
                break;
            } else if (j === 0) {
                // Lock the door from the starting seed room to the first branch room
                lockedDoorDir = this.getDoorDirection(branch[j], branch[j + 1]);
                grid[x][y].door[lockedDoorDir] = 'locked';

                // Lock the door in the other direction as well
                x = branch[j + 1].x;
                y = branch[j + 1].y;
                lockedDoorDir = this.getDoorDirection(branch[j + 1], branch[j]);
                grid[x][y].door[lockedDoorDir] = 'locked';
            } else if (j === branchLen - 1) {
                grid[x][y].roomType = 'branch';
            } else {
                grid[x][y].roomType = 'branch';
                openDoorDir = this.getDoorDirection(branch[j], branch[j + 1]);
                grid[x][y].door[openDoorDir] = 'open';

                x = branch[j + 1].x;
                y = branch[j + 1].y;
                openDoorDir = this.getDoorDirection(branch[j + 1], branch[j]);
                grid[x][y].door[openDoorDir] = 'open';
            }
        }
    },

    makeBossRoom: function (grid, existingRoomCoords, branches) {
    // Convert the last room of the longest branch to the boss room
        var branchLen = branches[0].length,
            bossCoords,
            bossFoyerCoords,
            lockedDoorDir;

            if (branchLen > 2) { // Don't convert a one room branch into the boss room
            // Remember that the first element of a branch array is a seed room that gets
            // a locked door added to it
                bossCoords = branches[0][branchLen - 1];
                bossFoyerCoords = branches[0][branchLen - 2];
                grid[bossCoords.x][bossCoords.y].roomType = 'boss';

                // Add a locked door to the boss room
                lockedDoorDir = this.getDoorDirection(bossCoords, bossFoyerCoords);
                grid[bossCoords.x][bossCoords.y].door[lockedDoorDir] = 'locked';
                lockedDoorDir = this.getDoorDirection(bossFoyerCoords, bossCoords);
                grid[bossFoyerCoords.x][bossFoyerCoords.y].door[lockedDoorDir] = 'locked';

                return existingRoomCoords;
            } else {
                return this.makeBossRoom(grid, existingRoomCoords, branches.slice(1, branches.length));
            }
    }, 

    getDoorDirection: function (roomFrom, roomTo) {
        if (roomFrom.x > roomTo.x && roomFrom.y === roomTo.y) {
            return 'left';
        } else if (roomFrom.x < roomTo.x && roomFrom.y === roomTo.y) {
            return 'right';
        } else if (roomFrom.y > roomTo.y && roomFrom.x === roomTo.x) {
            return 'up';
        } else if (roomFrom.y < roomTo.y && roomFrom.x === roomTo.x) {
            return 'down';
        } else {
            return 'none';
        }
    },

    getRandomCoords: function (grid, existingRoomCoords, edgeCoords, coords, jumpsAllowed) {
    // Get the four coordinates adjacent to a room, check that they are in the bounds of the map,
    // and filter out the coordinates that are already rooms. 
        var adjCoords = coords.getAdjacentCoords(),
            validCoords = this.getValidCoords(adjCoords),
            newCoords = this.getNewCoords(grid, validCoords);

        if (newCoords.length > 0) {
            return this.getRandomFromArray(newCoords);
        } else if (newCoords.length === 0 && jumpsAllowed) {
            return this.getRandomCoords(grid, existingRoomCoords, edgeCoords, this.getRandomFromArray(edgeCoords));
            // Sometimes when walking you box yourself in and need to jump
            // to an existing room to keep going
        } else { // For branches, do not jump to another room as this would create a discontinuous branch.
            return coords;
        }
    },

    getRandomFromArray: function (arr) {
        return arr[Math.floor(this.random() * arr.length)];
    },

    getRandomSeedCoords: function (grid, existingCoords, edgeCoords) {
    // Branches only connect to seed rooms
        var randCoords = this.getRandomFromArray(edgeCoords),
            isSeed = this.isSeed(grid, randCoords);

        if (isSeed) {
            return randCoords;
        } else {
            return this.getRandomSeedCoords(grid, existingCoords, edgeCoords);
        }
    },

    getValidCoords: function (coords) {
        var that = this;
        return coords.filter(function (coord) {
            return ((coord.x >= 0 && coord.x < that.NUM_COLUMNS) &&
                    (coord.y >= 0 && coord.y < that.NUM_ROWS));
        });
    },

    getNewCoords: function (grid, coords) {
        var that = this;
        return coords.filter(function (coord) {
            return !that.isRoom(grid, coord);
        });
    },

    getExistingCoords: function (grid, coords) {
        var that = this;
        return coords.filter(function (coord) {
            return that.isRoom(grid, coord);
        });
    },

    isRoom: function (grid, coord) {
        return (typeof grid[coord.x][coord.y] !== 'undefined');
    },

    isSeed: function (grid, coord) {
        return (grid[coord.x][coord.y].roomType === 'seed');
    },

    isEdge: function (grid, coord) {
        var adjCoords = coord.getAdjacentCoords(),
            validCoords = this.getValidCoords(adjCoords),
            newCoords = this.getNewCoords(grid, validCoords);

        return (newCoords.length > 0);
    }
};

RZ.Keyboard = {
    init: function () {
        window.onkeydown = function(e) {
          RZ.Keyboard.states[e.keyCode] = true;
        };

        window.onkeyup = function(e) {
          RZ.Keyboard.states[e.keyCode] = false;
          RZ.Keyboard.hasFired[e.keyCode] = false;
        };

        var mapKey = 'SHIFT', // Pressing shift should only toggle 
            keyCode = RZ.Keyboard.codes[mapKey]; // the map once
        RZ.Keyboard.hasFired[keyCode] = false;
    },

    states: {},

    hasFired: {},

    codes: {
        'W': 87,
        'A': 65,
        'S': 83,
        'D': 68,
        'SHIFT': 16
    },

    isDown: function (key) {
      var keyCode = RZ.Keyboard.codes[key];
      return RZ.Keyboard.states[keyCode] === true;
    },

    areMovementKeysDown: function () {
        var mvmtKeyCodes = ['W', 'A', 'S', 'D'];

        for (var key in mvmtKeyCodes) {
            var code = this.codes[mvmtKeyCodes[key]];

            if (this.states[code] === true) {
                return true;
            }
        }

        return false;
    },

    checkMapToggle: function () {
        var mapKey = 'SHIFT',
            keyCode = RZ.Keyboard.codes[mapKey];
        
        if (RZ.Keyboard.isDown(mapKey)) {

            if (RZ.Keyboard.hasFired[keyCode] === false) {
                RZ.Keyboard.hasFired[keyCode] = true;
				RZ.Game.locked = true;

                if (RZ.Game.paused === false) {
                    RZ.Game.paused = true;
                    RZ.Screen.mapTransition('coming');
                } else {
                    RZ.Game.paused = false;
                    RZ.Screen.mapTransition('going');
                }
            } 
        }
    }

};

RZ.Map = function (dungeon, canvas) {
    this.context = canvas.getContext('2d');

    // Declare static settings
    this.ROOM_SIZE = dungeon.ROOM_SIZE;
    this.INNER_ROOM_SIZE = this.ROOM_SIZE / 2;
    this.PADDING = this.INNER_ROOM_SIZE;
    this.MAP_WIDTH = dungeon.WIDTH;
    this.MAP_HEIGHT = dungeon.HEIGHT;
    this.CANVAS_WIDTH = canvas.clientWidth;
    this.CANVAS_HEIGHT = canvas.clientHeight;
    this.WIDTH_OFFSET = (this.CANVAS_WIDTH - this.MAP_WIDTH) / 2;
    this.HEIGHT_OFFSET = (this.CANVAS_HEIGHT - this.MAP_HEIGHT) / 2;
    this.START_ROOM_COLOR = '#88d800';
    this.DEFAULT_ROOM_COLOR = '#444444';
    this.BOSS_ROOM_COLOR = '#B53120';
    this.BG = '#000000';
    this.MAP_BG = '#FCB514';
    this.LOCKED_DOOR_COLOR = '#FFE200';
};

RZ.Map.prototype = {

    draw: function (grid, existingRooms) {
        var existingLen = existingRooms.length,
            roomType,
            roomToDraw,
            roomColor;

        // Add a plain background fill
        this.context.fillStyle = this.BG;
        this.context.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        // Add map background fill
        this.context.fillStyle = this.MAP_BG;
        this.context.fillRect(this.WIDTH_OFFSET - this.PADDING, this.HEIGHT_OFFSET - this.PADDING, 
                this.MAP_WIDTH + this.PADDING * 2, this.MAP_HEIGHT + this.PADDING * 2);
        
        while (existingLen > 0) {
            existingLen = existingLen - 1;
            roomToDraw = existingRooms[existingLen];
            roomType =  grid[roomToDraw.x][roomToDraw.y].roomType;

            if (roomType === 'seed') {
                roomColor = this.DEFAULT_ROOM_COLOR;
            } else if (roomType === 'branch') {
                roomColor = this.MAP_BG;
            } else if (roomType === 'boss') {
                roomColor = this.BOSS_ROOM_COLOR;
            }

            this.drawRoom(grid, roomToDraw, roomColor);
        }
        this.drawRoom(grid, existingRooms[0], this.START_ROOM_COLOR);
    },

    drawRoom: function (grid, roomToDraw, roomColor) {
        var coords = this.convertRoomCoordsToPixels(roomToDraw),
            x = coords[0],
            y = coords[1],
            roomType = grid[roomToDraw.x][roomToDraw.y].roomType;

        this.context.fillStyle = this.BG;
        this.context.fillRect(x, y, this.ROOM_SIZE, this.ROOM_SIZE);
        this.context.fillStyle = roomColor;

        this.context.fillRect(x + (this.ROOM_SIZE / 4),
            y + (this.ROOM_SIZE / 4),
            this.INNER_ROOM_SIZE,
            this.INNER_ROOM_SIZE);

        this.drawDoors(grid, roomToDraw);
    },

    drawDoors: function (grid, roomToDraw) {
        var roomDoors = grid[roomToDraw.x][roomToDraw.y].door,
            doorCoords = this.convertRoomCoordsToPixels(roomToDraw),
            bigDelta = 1 + this.ROOM_SIZE / 4 + this.ROOM_SIZE / 8,
            smallDelta = this.ROOM_SIZE / 4 + this.ROOM_SIZE / 2,
            doorDir,
            coord;

        for (doorDir in roomDoors) {
            
            if (doorDir === 'up') {
                coord = new RZ.Coord(doorCoords[0] + bigDelta, doorCoords[1]);
            } else if (doorDir === 'down') {
                coord = new RZ.Coord(doorCoords[0] + bigDelta, doorCoords[1] + smallDelta);
            } else if (doorDir === 'left') {
                coord = new RZ.Coord(doorCoords[0], doorCoords[1] + bigDelta);
            } else if (doorDir === 'right') {
                coord = new RZ.Coord(doorCoords[0] + smallDelta, doorCoords[1] + bigDelta);
            }

            if (roomDoors[doorDir] === 'locked') {
                this.drawOneDoor(coord, this.LOCKED_DOOR_COLOR);
            } else if (roomDoors[doorDir] === 'open') {
                this.drawOneDoor(coord, this.DEFAULT_ROOM_COLOR);
            }
        }
    },

    drawOneDoor: function (coord, color) {
        var doorSize = this.ROOM_SIZE / 4;

        this.context.fillStyle = color;
        this.context.fillRect(coord.x, coord.y, doorSize, doorSize);
    },

    convertRoomCoordsToPixels: function (roomCoords) {
        return [
            this.ROOM_SIZE * roomCoords.x + this.WIDTH_OFFSET,
            this.ROOM_SIZE * roomCoords.y + this.HEIGHT_OFFSET
        ];
    }
};

RZ.Player = function (canvas) {
    this.context = canvas.getContext('2d');
    this.canvasWidth = canvas.clientWidth;
    this.canvasHeight = canvas.clientHeight;
    this.width = 48; // Sprite width and height
    this.height = 48;
    this.x = this.canvasWidth / 2 - this.width / 2; // Put player in center, account for player size
    this.y = this.canvasHeight / 2 - this.height / 2;
    this.sx = 0; // The upper left coordinates of the section of the
    this.sy = 0; // sprite sheet image to use (source x and y).
    this.speed = 4;
    this.animIntervalOrig = 4;
    this.animInterval = 4; // Slow down animation image change
};

RZ.Player.prototype = {
    drawOnce: function () {
        this.context.drawImage(RZ.Assets.img.link, this.sx, this.sy, this.width, this.height, this.x, this.y, this.width, this.height);
    },

    update: function () {
        this.context.clearRect(this.x, this.y, this.width, this.height);
    
        this.toggleAnimation();
        this.move();

        this.context.drawImage(RZ.Assets.img.link, this.sx, this.sy, this.width, this.height, this.x, this.y, this.width, this.height);
    },

    move: function () {
        /* Up/down and left/right movement is mutually exclusive
         * Do not allow diagonal movement (if the y value changes, do not change the x value)
         * At the edge of the screen, the player can hold two keys without being frozen in place
         * E.g. If the player walks up to the top, holding up and right simultaneously allows 
         * the player to move right */
        var origY = this.y;

        if (RZ.Keyboard.isDown('W')) {
            if (RZ.Game.currentRoom.isAccessible(this.x + this.width / 2, this.y + this.width / 2 - this.speed)) {
                this.y -= this.speed;
            }
            this.sx = 96;
        } else if (RZ.Keyboard.isDown('S')) {
            if (RZ.Game.currentRoom.isAccessible(this.x + this.width / 2, this.y + this.width  + this.speed)) {
                this.y += this.speed;
            }
            this.sx = 0;
        } 
        
        if (origY === this.y) {
            if (RZ.Keyboard.isDown('A')) {
                if (RZ.Game.currentRoom.isAccessible(this.x + - this.speed, this.y + this.width / 2)) {
                    this.x -= this.speed;
                }
                this.sx = 48;
            } else if (RZ.Keyboard.isDown('D')) {
                if (RZ.Game.currentRoom.isAccessible(this.x + this.width + this.speed, this.y + this.width / 2)) {
                    this.x += this.speed;
                }
                this.sx = 144;
            }
        }
    },

    toggleAnimation: function () {
        if (this.animInterval === 0) {
            this.sy = (this.sy === 0 ? 48 : 0);
            this.animInterval = this.animIntervalOrig;
        } else {
            this.animInterval -= 1;
        }
    }
};

RZ.Room = function () {
    // Set default values
    this.roomType = 'seed'; // Or 'branch', 'fake', 'boss'
    this.roomLayout = 'empty'; // Or 'entrance', 'four', 'five', etc.
    this.accessibleCoords = this.defaultAccessibleCoords;
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
        
        // Temporary fill until walls are added
        context.fillStyle = '#000044';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        for (var i = 0; i < rowsLen; i++) {
            colsLen = layout[i].length;

            for (var j = 0; j < colsLen; j++) {
                var x = i * this.width + this.wallWidth,
                    y = j * this.height + this.wallWidth,
                    sx = this.tiles[layout[i][j]][1],
                    sy = this.tiles[layout[i][j]][0];

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
        [1,1,0,1,0,1,0,1,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,1,0,1,0,1,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,1,0,1,0,1,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,1,0,1,0,1,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1]
    ],

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
        ]
    }
};

RZ.Screen = {
    init: function (id) {
        var mainDiv = document.getElementById(id), // The div serves as a container
            headsUpDisplayHeight = 192,            // that hides overflow
            width = mainDiv.clientWidth, // Get the dimensions of the div
            height = mainDiv.clientHeight, 
            heightMinusHUD = height - headsUpDisplayHeight;
        
        this.mapStartTop = 0 - heightMinusHUD;
        this.roomStartTop = headsUpDisplayHeight;

        // The map canvas also contains the HUD and is positioned off-screen by default
        this.map = document.createElement('canvas');
        this.map.id = 'RZmap';
        this.map.width = width;
        this.map.height = height;
        this.map.style.position = 'absolute';
        this.map.startTop = 0 - heightMinusHUD;
        this.map.style.top = this.map.startTop;
        this.map.style.left = 0;
        this.map.style.background = 'transparent';
        this.map.style.zIndex = 0;
        mainDiv.appendChild(this.map);
        
        // The foreground canvas is for the player and other moving objects
        this.fg = document.createElement('canvas');
        this.fg.id = 'RZfg';
        this.fg.width = width;
        this.fg.height = heightMinusHUD;
        this.fg.style.position = 'absolute';
        this.fg.style.top = headsUpDisplayHeight;
        this.fg.style.left = 0;
        this.fg.style.background = 'transparent';
        this.fg.style.zIndex = -1;
        mainDiv.appendChild(this.fg);

        //The background canvas is for room tiles
        this.bg = document.createElement('canvas');
        this.bg.id = 'RZbg';
        this.bg.width = width;
        this.bg.height = heightMinusHUD;
        this.bg.style.position = 'absolute';
        this.bg.style.top = headsUpDisplayHeight;
        this.bg.style.left = 0;
        this.bg.style.background = 'transparent';
        this.bg.style.zIndex = -2;
        mainDiv.appendChild(this.bg);

        // Canvas contents display as a fallback if canvas isn't supported
        this.bg.innerHTML += '<p>Ensure that your browser is compatible with canvas</p>';
    },

    mapTransition: function (direction) { // When the map moves into view, the bg and fg move out
        if (direction === 'coming') {
            RZ.Screen.transition(RZ.Screen.map, RZ.Screen.map.style.top, 0, 'top');
            RZ.Screen.transition(RZ.Screen.fg, RZ.Screen.fg.style.top, RZ.Screen.map.height, 'top');
            RZ.Screen.transition(RZ.Screen.bg, RZ.Screen.bg.style.top, RZ.Screen.map.height, 'top');
        } else if (direction === 'going') {
            RZ.Screen.transition(RZ.Screen.map, RZ.Screen.map.style.top, RZ.Screen.mapStartTop, 'top');
            RZ.Screen.transition(RZ.Screen.fg, RZ.Screen.fg.style.top, RZ.Screen.roomStartTop, 'top');
            RZ.Screen.transition(RZ.Screen.bg, RZ.Screen.bg.style.top, RZ.Screen.roomStartTop, 'top');
        }
    },

    transition: function (canvas, start, end, side) {
        var diff = parseInt(start) - end,
            dist = 5; // Increment to move the canvas for each call

        if (Math.abs(diff) < dist) {
            canvas.style[side] = end;
			RZ.Game.locked = false; // Accept player input when the transition ends
            return;
        } else if (diff < 0) {
            canvas.style[side] = parseInt(start) + dist;
        } else if (diff > 0) { 
            canvas.style[side] = parseInt(start) - dist;
        }

        setTimeout(function () { 
            RZ.Screen.transition(canvas, canvas.style[side], end, side);
        }, 10);
    }
};
