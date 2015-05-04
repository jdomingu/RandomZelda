/*jshint globalstrict: true*/
/*jshint browser:true */
'use strict';

var RZ = RZ || {};

RZ.Game = {
    init: function (id, seed) {
        var dungeon, rooms, map;

        RZ.Assets.init(); // Load images
        RZ.Screen.init(id); // Set up game canvases 
        RZ.Keyboard.init();

        dungeon = new RZ.Dungeon(RZ.Screen.width, RZ.Screen.height, seed);
        rooms = dungeon.generate();
        map = new RZ.Map(dungeon, RZ.Screen.bg);
        map.draw(dungeon.grid, rooms);
        this.player = new RZ.Player();

        this.main();
    }, 

    main: function () {
        var fps = 60;
        setTimeout(function() {
            window.requestAnimationFrame(RZ.Game.main);
            RZ.Game.player.update(RZ.Screen.fg);
            // Drawing code goes here
        }, 1000 / fps);
    }

};

RZ.Assets = {
    init: function () {
        this.link = new Image();
        this.link.src = 'img/link.png';
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
    this.WIDTH = width; 
    this.HEIGHT = height;
    this.ROOM_SIZE = 96;
    this.NUM_ROOMS = 35; // The map must be a minimum of 6 rooms
    this.NUM_SEED_ROOMS = Math.ceil(this.NUM_ROOMS / 2) - 1;
    this.NUM_BRANCH_ROOMS = Math.floor(this.NUM_ROOMS / 2);
    this.NUM_ROWS = Math.floor(this.HEIGHT / this.ROOM_SIZE);
    this.NUM_COLUMNS = Math.floor(this.WIDTH / this.ROOM_SIZE);
    this.MAX_BRANCH_LEN = Math.floor(this.NUM_ROOMS / 6);
    this.START_X = Math.floor(this.NUM_COLUMNS / 2);
    this.START_Y = Math.floor(this.NUM_ROWS / 2);

    // Generate the grid
    this.grid = this.make2DGrid(this.NUM_COLUMNS, this.NUM_ROWS);
    var firstRoom = this.grid[this.START_X][this.START_Y] = new RZ.Room(); 
    
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
        };
    },

    states: {},

    codes: {
        'W': 87,
        'A': 65,
        'S': 83,
        'D': 68,
        'UP': 38,
        'LEFT': 37,
        'DOWN': 40,
        'RIGHT': 39
    },

    isDown: function (key) {
      var keyCode = RZ.Keyboard.codes[key];
      return RZ.Keyboard.states[keyCode] === true;
    },

    isAnyKeyDown: function () {
        for (var key in this.codes) {
            if (this.states[this.codes[key]] === true) {
                return true;
            }
        }

        return false;
        } 
};

RZ.Map = function (dungeon, context) {
    this.context = context; // The canvas context to which you want to draw

    // Declare static settings
    this.ROOM_SIZE = dungeon.ROOM_SIZE;
    this.INNER_ROOM_SIZE = this.ROOM_SIZE / 2;
    this.START_ROOM_COLOR = '#88d800';
    this.DEFAULT_ROOM_COLOR = '#444444';
    this.BOSS_ROOM_COLOR = '#B53120';
    this.BRANCH_ROOM_COLOR = '#FCB514';
    this.ROOM_BG = '#000000';
    this.LOCKED_DOOR_COLOR = '#FFE200';
};

RZ.Map.prototype = {

    draw: function (grid, existingRooms) {
        var existingLen = existingRooms.length,
            roomType,
            roomToDraw,
            roomColor;

        while (existingLen > 0) {
            existingLen = existingLen - 1;
            roomToDraw = existingRooms[existingLen];
            roomType =  grid[roomToDraw.x][roomToDraw.y].roomType;

            if (roomType === 'seed') {
                roomColor = this.DEFAULT_ROOM_COLOR;
            } else if (roomType === 'branch') {
                roomColor = this.BRANCH_ROOM_COLOR;
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

        this.context.fillStyle = this.ROOM_BG;
        this.context.fillRect (x, y, this.ROOM_SIZE, this.ROOM_SIZE);
        this.context.fillStyle = roomColor;

        this.context.fillRect (x + (this.ROOM_SIZE / 4),
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
        this.context.fillRect (coord.x, coord.y, doorSize, doorSize);
    },

    convertRoomCoordsToPixels: function (roomCoords) {
        return [
            this.ROOM_SIZE * roomCoords.x,
            this.ROOM_SIZE * roomCoords.y
        ];
    }
};

RZ.Player = function () {
    this.x = 0;
    this.y = 0;
    this.sx = 0; // The upper left coordinates of the section of the
    this.sy = 0; // sprite sheet image to use (source x and y).
    this.width = 48;
    this.height = 48;
    this.speed = 24;
    this.interval = 4;
};

RZ.Player.prototype = {
    update: function (context) {
        if (this.interval > 0) {
            this.interval -= 1;
        } else {
            console.log(this.sy);
            context.clearRect(this.x, this.y, this.width, this.height);

            if (RZ.Keyboard.isDown('W') || RZ.Keyboard.isDown('UP')) {
                this.y -= this.speed;
                this.sx = 96;
                this.sy = (this.sy === 0 ? 48 : 0);
            } else if (RZ.Keyboard.isDown('A') || RZ.Keyboard.isDown('LEFT')) {
                this.x -= this.speed;
                this.sx = 48;
                this.sy = (this.sy === 0 ? 48 : 0);
            } else if (RZ.Keyboard.isDown('S') || RZ.Keyboard.isDown('DOWN')) {
                this.y += this.speed;
                this.sx = 0;
                this.sy = (this.sy === 0 ? 48 : 0);
            } else if (RZ.Keyboard.isDown('D') || RZ.Keyboard.isDown('RIGHT')) {
                this.x += this.speed;
                this.sx = 144;
                this.sy = (this.sy === 0 ? 48 : 0);
            }

            context.drawImage(RZ.Assets.link, this.sx, this.sy, this.width, this.height, this.x, this.y, this.width, this.height);
            this.interval = 4;
        }
    }
};

RZ.Room = function () {
    // Set default values
    this.roomType = 'seed'; // Or 'branch', 'fake', 'boss'
    this.door = {};
    this.door.up = 'none';  // Or 'open', 'locked'
    this.door.down = 'none';
    this.door.left = 'none';
    this.door.right = 'none';
};

RZ.Screen = {
    init: function (id) {
        var fgCanvas = document.getElementById(id),
            bgCanvas = document.getElementById(id).cloneNode(true);

        bgCanvas.id = 'RZbg';
        bgCanvas.style.zIndex = -1;
        document.body.appendChild(bgCanvas);

        this.fg = fgCanvas.getContext('2d');
        this.bg = bgCanvas.getContext('2d');
        this.width = fgCanvas.clientWidth; // Get the width of the canvas element
        this.height = fgCanvas.clientHeight; // and the height
    }
};
