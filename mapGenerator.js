(function () {
    
    var Room = function () {
        // Set default values
        this.roomType = 'seed'; // Or 'branch', 'fake', 'boss'
        this.door = {};
        this.door.up = 'none';  // Or 'open', 'locked'
        this.door.down = 'none'; 
        this.door.left = 'none'; 
        this.door.right = 'none';
    };

    var Map = function () {
        this.canvas = document.getElementById('map');
        this.context = this.canvas.getContext('2d');
        
        // Declare static settings
        this.WIDTH = 600; // Ensure this matches width of canvas tag
        this.HEIGHT = 600; // Same
        this.NUM_ROOMS = 500;
        this.NUM_SEED_ROOMS = Math.ceil(this.NUM_ROOMS / 2) - 3;
        this.NUM_BRANCH_ROOMS = Math.floor(this.NUM_ROOMS / 2);
        this.ROOM_SIZE = 15;
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
        var grid = this.make2DGrid(this.NUM_ROWS, this.NUM_COLUMNS);        
        var firstRoom = grid[this.START_X][this.START_Y - 1] = new Room(); // Create two rooms to start to start to
        var secondRoom = grid[this.START_X][this.START_Y - 2] = new Room(); // ensure that going up is always possible
        var zeroRoom = grid[this.START_X][this.START_Y] = new Room(); // Create a fake, inaccessible room to simulate 
        zeroRoom.roomType = 'fake';                       // the dungeon entrance like Zelda
        
        // Keep track of where existing rooms are
        var existingRoomCoords = [[this.START_X, this.START_Y], 
                [this.START_X, this.START_Y - 1], 
                [this.START_X, this.START_Y - 2]];         
        
        // Start generating rooms (subtract 3 to account for initial rooms)
        existingRoomCoords = this.makeRooms(grid, existingRoomCoords, [this.START_X, this.START_Y - 2], this.NUM_SEED_ROOMS);
        existingRoomCoords = this.makeBranches(grid, existingRoomCoords, this.NUM_BRANCH_ROOMS, []);
        
        this.draw(grid, existingRoomCoords, this.DEFAULT_ROOM_COLOR);
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
        
        makeRooms: function (grid, existingRoomCoords, coords, numRoomsRemaining) {
        // Walk a random path, generating rooms as you go.
            var nextRoomCoords;
            
            if (numRoomsRemaining < 1) { 
                return existingRoomCoords;
            } else { 
                nextRoomCoords = this.getRandomCoords(grid, existingRoomCoords, coords);
                grid[nextRoomCoords[0]][nextRoomCoords[1]] = new Room();
                existingRoomCoords.push([nextRoomCoords[0], nextRoomCoords[1]]);
                numRoomsRemaining = numRoomsRemaining - 1;
                
                return this.makeRooms(grid, existingRoomCoords, [nextRoomCoords[0], nextRoomCoords[1]], numRoomsRemaining);
            }
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
                branchLen = Math.ceil(Math.random() * maxBranchLen); 
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
                    x = branch[j][0];
                    y = branch[j][1];
                    
                    if (branchLen < 2) { // Can't lock branches one room long
                        continue;
                        //grid[x][y].roomType = 'branch';
                    } else if (j === 0) {
                        lockedDoorDir = this.getDoorDirection(branch[j], branch[j + 1]);            
                        grid[x][y].door[lockedDoorDir] = 'locked';
                        
                        x = branch[j + 1][0];
                        y = branch[j + 1][1];
                        lockedDoorDir = this.getDoorDirection(branch[j + 1], branch[j]);
                        grid[x][y].door[lockedDoorDir] = 'locked';
                        grid[x][y].roomType = 'branch';
                    } else {
                        grid[x][y].roomType = 'branch';
                    }
                }

        },
        
        getDoorDirection: function (roomFrom, roomTo) {
            if (roomFrom[0] > roomTo[0]) {
                return 'left';
            } else if (roomFrom[0] < roomTo[0]) {
                return 'right';
            } else if (roomFrom[1] > roomTo[1]) {
                return 'up';
            } else if (roomFrom[1] < roomTo[1]) {
                return 'down';
            }
        },

        getRandomCoords: function (grid, existingRoomCoords, coords) {
            var adjCoords = this.getAdjacentCoords(coords[0], coords[1]),
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
            var rand = arr[Math.floor(Math.random() * arr.length)];
            return rand;
        },
        
        getRandomSeedCoords: function (grid, existingCoords) {
            var randCoords = this.getRandomFromArray(existingCoords),
                isBranch = this.isBranch(grid, randCoords); 

            if (!isBranch) {
                return randCoords;
            } else {
                return this.getRandomSeedCoords(grid, existingCoords);
            }
        },
        
        getAdjacentCoords: function (X, Y) {
            var adjCoords = [[X + 1, Y], 
                [X - 1, Y],
                [X, Y + 1],
                [X, Y - 1]];

            return adjCoords;
        },
        
        getValidCoords: function (coords) {
            var coordsLen = coords.length,
                validCoords = [],
                x,
                y;
                
            for (var i = 0; i < coordsLen; i++) {
                x = coords[i][0];
                y = coords[i][1];
                
                if (x >= 0 && x < this.NUM_COLUMNS && y >= 0 && y < this.NUM_ROWS) {
                    validCoords.push(coords[i]);
                }
            }
            
            return validCoords;
        },
        
        getNewCoords: function (grid, coords) {
            var coordsLen = coords.length - 1,
                newCoords = [],
                isRoom;
            
            while (coordsLen >= 0) {
                isRoom = this.isRoom(grid, coords[coordsLen]);
                
                if (!isRoom) {
                    newCoords.push(coords[coordsLen]);
                }
                
                coordsLen = coordsLen - 1;
            }
            
            return newCoords;
        },
        
        isRoom: function (grid, coord) {
            if (typeof  grid[coord[0]][coord[1]] !== 'undefined') { 
                return true;
            } else {
                return false;
            }
        },
        
        isBranch: function (grid, coords) {
            var x = coords[0],
                y = coords[1];
            
            if (grid[x][y].roomType === 'branch') {
                return true;
            } else {
                return false;
            }
        },
        
        draw: function (grid, existingRooms, colors) {
            var existingLen = existingRooms.length,
                roomType,
                roomColor;
            
            while (existingLen > 0) {
                existingLen = existingLen - 1;
                roomToDraw = existingRooms[existingLen];
                roomType =  grid[roomToDraw[0]][roomToDraw[1]].roomType
                
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
                roomType = grid[roomToDraw[0]][roomToDraw[1]].roomType;
            
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
            
            var roomDoors = grid[roomToDraw[0]][roomToDraw[1]].door,
                doorCoords = this.convertRoomCoordsToPixels(roomToDraw),
                x,
                y;

            for (var doorDir in roomDoors) {
                if (doorDir === 'up') {
                    x = doorCoords[0] + 1 + this.ROOM_SIZE / 4 + this.ROOM_SIZE / 8;
                    y = doorCoords[1];
                } else if (doorDir === 'down') {
                    x = doorCoords[0] + 1 + this.ROOM_SIZE / 4 + this.ROOM_SIZE / 8;
                    y = doorCoords[1] + this.ROOM_SIZE / 4 + this.ROOM_SIZE / 2;
                } else if (doorDir === 'left') {
                    x = doorCoords[0];
                    y = doorCoords[1] + 1 + this.ROOM_SIZE / 4 + this.ROOM_SIZE / 8;
                } else if (doorDir === 'right') {
                    x = doorCoords[0] + this.ROOM_SIZE / 4 + this.ROOM_SIZE / 2;
                    y = doorCoords[1] + 1 + this.ROOM_SIZE / 4 + this.ROOM_SIZE / 8;
                }

                if (roomDoors[doorDir] === 'locked') {
                    this.drawOneDoor([x, y], 'purple');
                } else if (roomDoors[doorDir] === 'open') {
                    this.drawOneDoor([x, y], 'white');
                }
            }
        },

        drawOneDoor: function (doorCoords, color) {
            var x = doorCoords[0],
                y = doorCoords[1],
                doorSize = this.ROOM_SIZE / 4;

            this.context.fillStyle = color;
            this.context.fillRect (x, y, doorSize, doorSize);

        },
        
        convertRoomCoordsToPixels: function (roomCoords) {
            var x = this.ROOM_SIZE * roomCoords[0];
            var y = this.ROOM_SIZE * roomCoords[1];
            
            return [x, y];
        }
        
    };
    window.onload = function () {
        new Map();
    };
})();
