var Room = function () {
    // Set default values
    this.roomType = 'seed'; // Or 'branch', 'fake', 'boss'
    this.door = {};
    this.door.up = 'none';  // Or 'open', 'locked'
    this.door.down = 'none';
    this.door.left = 'none';
    this.door.right = 'none';
};

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

var Map = function (mapElement, mapHeight, mapWidth) {
    this.canvas = mapElement;
    this.context = mapElement.getContext('2d');

    // Declare "static" settings
    this.WIDTH = mapWidth; // Ensure this matches width of canvas tagtAdja
    this.HEIGHT = mapHeight; // Same
    this.NUM_ROOMS = 75;
    this.NUM_SEED_ROOMS = Math.ceil(this.NUM_ROOMS / 2) - 3;
    this.NUM_BRANCH_ROOMS = Math.floor(this.NUM_ROOMS / 2);
    this.ROOM_SIZE = 25;
    this.INNER_ROOM_SIZE = this.ROOM_SIZE / 2;
    this.NUM_ROWS = Math.floor(this.HEIGHT / this.ROOM_SIZE);
    this.NUM_COLUMNS = Math.floor(this.WIDTH / this.ROOM_SIZE);
    this.START_X = Math.floor(this.NUM_COLUMNS / 2);
    this.START_Y = Math.floor(this.NUM_ROWS / 2);
    this.START_ROOM_COLOR = '#88d800';
    this.DEFAULT_ROOM_COLOR = '#333333';
    this.END_ROOM_COLOR = '#b53120';
    this.BRANCH_ROOM_COLOR = '#FCB514';
    this.ROOM_BG = '#000000';

    // Make an empty array of arrays for rooms, then create starting rooms
    this.grid = this.make2DGrid(this.NUM_ROWS, this.NUM_COLUMNS);
    var firstRoom = this.grid[this.START_X][this.START_Y - 1] = new Room(); // Create two rooms to start to start to
    var secondRoom = this.grid[this.START_X][this.START_Y - 2] = new Room(); // ensure that going up is always possible
    var zeroRoom = this.grid[this.START_X][this.START_Y] = new Room(); // Create a fake, inaccessible room to simulate
    zeroRoom.roomType = 'fake';                       // the dungeon entrance like Zelda
};

Map.prototype = {

    make2DGrid: function (numRows, numColumns) {
        var grid = [];

        while (numRows > 0) {
            grid.push([]);
            numRows = numRows - 1;
        }
        for (var i = 0; i < numRows; i++) {
            grid[i] = [];
            for (var j = 0; j < numColumns; j++) {
                grid[i][j] = [];
            }
        }

        return grid;
    },

    draw: function (grid, existingRooms, colors) {
        var existingLen = existingRooms.length,
            roomType,
            roomColor;

        while (existingLen > 0) {
            existingLen = existingLen - 1;
            roomToDraw = existingRooms[existingLen];
            roomType =  grid[roomToDraw.x][roomToDraw.y].roomType

            if (roomType === 'seed') {
                roomColor = this.DEFAULT_ROOM_COLOR;
            } else if (roomType === 'branch') {
                roomColor = this.BRANCH_ROOM_COLOR;
            }
            this.drawRoom(grid, roomToDraw, roomColor);
        }
        this.drawRoom(grid, existingRooms[1], this.START_ROOM_COLOR);
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
            smallDelta = this.ROOM_SIZE / 4 + this.ROOM_SIZE / 2;

        for (var doorDir in roomDoors) {
            var coord;
            if (doorDir === 'up') {
                coord = new Coord(doorCoords[0] + bigDelta, doorCoords[1]);
            } else if (doorDir === 'down') {
                coord = new Coord(doorCoords[0] + bigDelta, doorCoords[1] + smallDelta);
            } else if (doorDir === 'left') {
                coord = new Coord(doorCoords[0], doorCoords[1] + bigDelta);
            } else if (doorDir === 'right') {
                coord = new Coord(doorCoords[0] + smallDelta, doorCoords[1] + bigDelta);
            }

            if (roomDoors[doorDir] === 'locked') {
                this.drawOneDoor(coord, 'purple');
            } else if (roomDoors[doorDir] === 'open') {
                this.drawOneDoor(coord, 'white');
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

/**
 * Monkey-patch the "Math" module to add a seeded PRNG
 * Taken from: https://stackoverflow.com/a/23304189
 */
Math.seed = function(s) {
    return function() {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
};

var Generator = function(map, seed) {
    var seedVal = (undefined === seed) ? Date.now() : seed;

    // This allows us to determinstically test a random process
    this.random = Math.seed(seedVal);
    this.startingCoords = [
        new Coord(map.START_X, map.START_Y),
        new Coord(map.START_X, map.START_Y - 1),
        new Coord(map.START_X, map.START_Y - 2)
    ];
    this.initialPosition = new Coord(map.START_X, map.START_Y - 2);
    this.seedRoomCount = map.NUM_SEED_ROOMS;
    this.branchRoomCount = map.NUM_BRANCH_ROOMS;
};

Generator.prototype = {
    generate: function(map) {
        this.xBound = map.NUM_COLUMNS;
        this.yBound = map.NUM_ROWS;

        // Start generating rooms (subtract 3 to account for initial rooms)
        existingRoomCoords = this.makeRooms(map.grid, this.startingCoords, this.initialPosition, this.seedRoomCount);
        existingRoomCoords = this.makeBranches(map.grid, existingRoomCoords, this.branchRoomCount, []);

        return existingRoomCoords;
    },

    makeRooms: function (grid, existingRoomCoords, coords, numRoomsRemaining) {
        // Walk a random path, generating rooms as you go.
        var nextRoomCoords;

        if (numRoomsRemaining < 1) {
            return existingRoomCoords;
        } else {
            nextRoomCoord = this.getRandomCoords(grid, existingRoomCoords, coords);
            grid[nextRoomCoord.x][nextRoomCoord.y] = new Room();
            existingRoomCoords.push(nextRoomCoord);
            numRoomsRemaining = numRoomsRemaining - 1;

            return this.makeRooms(grid, existingRoomCoords, nextRoomCoord, numRoomsRemaining);
        }
    },

    getRandomCoords: function (grid, existingRoomCoords, coords) {
        var adjCoords = coords.getAdjacentCoords(),
            validCoords = this.getValidCoords(adjCoords),
            newCoords = this.getNewCoords(grid, validCoords);

        if (newCoords.length > 0) {
            return this.getRandomFromArray(newCoords);
        } else {
            return this.getRandomCoords(grid, existingRoomCoords, this.getRandomFromArray(existingRoomCoords));
            // Sometimes when walking you box yourself in and need to jump
            // to an existing room to keep going
        }
    },

    getRandomFromArray: function (arr) {
        return arr[Math.floor(this.random() * arr.length)];
    },

    makeBranches: function (grid, existingRoomCoords, numRoomsRemaining, branches) {
    // Use branches to create locked areas on the map. Creating this after the seed
    // rooms ensures the map is always solvable. (Keys will be spawned in seed only.)
        var maxBranchLen = (numRoomsRemaining) > 8 ? 8 : (numRoomsRemaining), // 8 is an arbitrary maximum
            currentBranch = [],
            randStart,
            branchLen;

        if (numRoomsRemaining < 1) {
            return existingRoomCoords;
        } else {
            randStart = this.getRandomSeedCoords(grid, existingRoomCoords);
            branchLen = Math.ceil(this.random() * maxBranchLen);
            this.makeRooms(grid, existingRoomCoords, randStart, branchLen);

            for (var i = 0; i < branchLen; i++) {
                currentBranch.push(existingRoomCoords[existingRoomCoords.length - branchLen + i]);
            }
            if (branchLen > 0) {
                this.lockBranch(grid, currentBranch);
            }
            return this.makeBranches(grid, existingRoomCoords, numRoomsRemaining - branchLen, branches);
        }

    },

    lockBranch: function (grid, branch) {
        var branchLen = branch.length,
            lockedDoorDir,
            x,
            y;

        for (var j = 0; j < branchLen; j++) {
            x = branch[j].x;
            y = branch[j].y;

            if (branchLen < 2) { // Can't lock branches one room long
                continue;
            } else if (j === 0) {
                lockedDoorDir = this.getDoorDirection(branch[j], branch[j + 1]);
                if (lockedDoorDir !== 'none') {
                    grid[x][y].door[lockedDoorDir] = 'locked';
                }

                x = branch[j + 1].x;
                y = branch[j + 1].y;
                lockedDoorDir = this.getDoorDirection(branch[j + 1], branch[j]);
                if (lockedDoorDir !== 'none') {
                    grid[x][y].door[lockedDoorDir] = 'locked';
                }
                grid[x][y].roomType = 'branch';
            } else {
                grid[x][y].roomType = 'branch';
            }
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

    getRandomSeedCoords: function (grid, existingCoords) {
        var randCoords = this.getRandomFromArray(existingCoords),
            isSeed = this.isSeed(grid, randCoords),
            isEdge = this.isEdge(grid, randCoords);

        if (isSeed && isEdge) {
            return randCoords;
        } else {
            return this.getRandomSeedCoords(grid, existingCoords);
        }
    },

    getValidCoords: function (coords) {
        var that = this;
        return coords.filter(function (coord) {
            return ((coord.x >= 0 && coord.x < that.xBound) &&
                    (coord.y >= 0 && coord.y < that.yBound));
        });
    },

    getNewCoords: function (grid, coords) {
        var that = this;
        return coords.filter(function (coord) {
            return !that.isRoom(grid, coord);
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

var drawGraph = function(element) {
    var map = new Map(element, element.offsetHeight, element.offsetWidth),
        generator = new Generator(map);

    // Generate the graph
    var graph = generator.generate(map);

    // Draw the graph as a map
    return map.draw(map.grid, graph, map.DEFAULT_ROOM_COLOR);
};
