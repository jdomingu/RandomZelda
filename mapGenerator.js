(function () {
    
    var Room = function (x, y) {
        this.x = x;
        this.y = y;
        // Set default values
        this.roomType = 'open'; // Or 'locked', 'boss', 'blank'
        this.door = {};
        this.door.up = 'none'; 
        this.door.down = 'none'; 
        this.door.left = 'none'; 
        this.door.right = 'none';
    };

    var Map = function () {
        // Declare map preferences
        this.canvas = document.getElementById('map');
        this.context = this.canvas.getContext('2d');
        this.width = 600; // Ensure this matches width of canvas tag
        this.height = 600; // Same
        this.numRooms = 25;
        this.roomSize = 40;
        this.innerRoomSize = this.roomSize / 2;
        this.defaultRoomColor = '#333333';
        this.startRoomColor = '#88d800';
        this.endRoomColor = '#b53120';
        this.roomBG = '#000000';

        // Generate the map
        // NOTE: This section is messy right now to make it easier to visualize 
        // core rooms for testing
        var zeroRoom = new Room(0, 1); // Create a blank room below to simulate the dungeon entrance like Zelda
        zeroRoom.roomType = 'blank';
        var startRoom = new Room(0, 0);
        var secondRoom = new Room(0, -1); // Create a second room to ensure that up is always an option like in Zelda
        var coreRoomsArray = this.generate([zeroRoom, startRoom, secondRoom], Math.ceil(this.numRooms / 2) + 1, secondRoom, true);
        // Add one to compensate for empty room
        console.log('done with core');
        var roomsArray = coreRoomsArray.slice(0);
        roomsArray = this.generateBranches(roomsArray, Math.floor(this.numRooms / 2) + 1);
        console.log('done with branches');
        console.log(coreRoomsArray.length);
        console.log(roomsArray.length);
        //this.connectRooms(roomsArray);
        this.draw(roomsArray, this.defaultRoomColor);
        this.draw(coreRoomsArray, '#FCB514');
    };

    Map.prototype = {

        generate: function (roomsArray, numRooms, currentRoom, jumpsAllowed) {
        // Walk a random path, generating rooms as you go.
            if (roomsArray.length >= numRooms) { // Base case
                return roomsArray;
            } else { // Recursive case
                var availableRoomCoords = this.getAdjacent(roomsArray, currentRoom),
                    nextRoom;

                if (availableRoomCoords.length < 1) {
                // Sometimes when walking you box yourself in and need to jump
                // to an existing room to keep going
                    if (jumpsAllowed) {
                        nextRoom = this.getRandomRoom(roomsArray);
                    } else {
                        console.log('stuck');
                        return roomsArray;
                    }
                } else {
                    var roomCoords = this.getRandomRoomCoords(availableRoomCoords);
                    nextRoom = new Room(roomCoords[0], roomCoords[1]);
                    roomsArray.push(nextRoom);
                }

                return this.generate(roomsArray, numRooms, nextRoom, jumpsAllowed);
            }
        },

        generateBranches: function (coreRooms, roomsRemaining) {
            // Generate branches of a random length less than the number
            // of rooms remaining until there are no more rooms to create.
            // Branches greatly minimize the problem of long, single-room stretches.
            var branches = [], // Array of branch room arrays
                branchesLength,
                tempRoomsLength,
                diffInRoomsLength;

            // From experimentation, more iterations yield diminishing returns
            // but numRooms / 2 is still somewhat arbitrary
            for (var i = 0; i < this.numRooms / 2; i++) { 
                if (roomsRemaining <= 0) {
                    break;
                }
                var randomRoom = this.getRandomRoom(coreRooms), 
                    branchLengthOpts = (roomsRemaining / 2) > 8 ? 8 : (roomsRemaining / 2);
                    // Set arbitrary bounds on branch length
                    branchLength = Math.ceil(Math.random() * branchLengthOpts);
                    // Dividing by two yields better results by minimizing long branches

                tempRoomsLength = coreRooms.length;
                coreRooms = this.generate(coreRooms, coreRooms.length + branchLength, randomRoom, false);
                diffInRoomsLength = coreRooms.length - tempRoomsLength;
                roomsRemaining = roomsRemaining - diffInRoomsLength;
                
                console.log(roomsRemaining);
                if (diffInRoomsLength > 0) {
                    branchesLength = branches.length;
                    branches[branchesLength] = [randomRoom];
                // Keep track of the entry point for the branch and the recently 
                // generated branch rooms
                    while (diffInRoomsLength > 0) {                    
                        branches[branchesLength].push(coreRooms[coreRooms.length - diffInRoomsLength]);
                        diffInRoomsLength--;
                    }
                } 
            }
            
            var sortedBranches = branches.sort(function (a, b) {
                return b.length - a.length;
            });

            this.setLockedBranches(sortedBranches);
            return coreRooms;
        },
        
        setLockedBranches: function (branches) {
            // Only lock some branches
            var numLockedBranches = this.numRooms / 10,
                branchesLength = branches.length,
                lockedDoorDir;

            for (var i = 0; i < numLockedBranches; i++) {
                for (var j = 0; j < branches[i].length; j++) {
                    if (j === 0) { // Lock the door between the entry point for the branch and the branch rooms
                        lockedDoorDir = this.getDoorDirection(branches[i][j], branches[i][j + 1]);            
                        branches[i][j].door[lockedDoorDir] = 'locked';
                        lockedDoorDir = this.getDoorDirection(branches[i][j + 1], branches[i][j]);            
                        branches[i][j + 1].door[lockedDoorDir] = 'locked';
                    } else { 
                        branches[i][j].roomType = 'locked';
                    }
                }
            }
        },

        getDoorDirection: function (roomFrom, roomTo) {
            if (roomFrom.x > roomTo.x) {
                return 'left';
            } else if (roomFrom.x < roomTo.x) {
                return 'right';
            } else if (roomFrom.y > roomTo.y) {
                return 'up';
            } else if (roomFrom.y < roomTo.y) {
                return 'down';
            }
        },

        getRandomRoom: function (roomsArray) {
            var randomRoom = roomsArray[Math.floor(Math.random() * roomsArray.length)];
            if (randomRoom.roomType !== 'blank') {
                return randomRoom;
            } else {
                return this.getRandomRoom(roomsArray);
            }
        },

        roomExists: function (roomsArray, nextRoomCoords) {
            var roomsArrayLength = roomsArray.length;

            for (var i = 0; i < roomsArrayLength; i++) {
                if (nextRoomCoords[0] === roomsArray[i].x && 
                        nextRoomCoords[1] === roomsArray[i].y) {
                    return true;
                }
            }
            return false;
        }, 

        getAdjacent: function (roomsArray, currentRoom) {
        // Get the coordinates of adjacent blank spaces within the bounds
        // of the map --that is less than a max distance from center
            var maxHeight = Math.floor((this.height / this.roomSize) / 2),
                maxWidth = Math.floor((this.width / this.roomSize) / 2),
                availableRoomCoords = [];

            var adjacentRoomCoords = [[currentRoom.x + 1, currentRoom.y], 
                [currentRoom.x - 1, currentRoom.y],
                [currentRoom.x, currentRoom.y + 1],
                [currentRoom.x, currentRoom.y - 1]];
             
            for (var i = 0; i < adjacentRoomCoords.length; i++) {
                var absX = Math.abs(adjacentRoomCoords[i][0]) + 1,
                    absY = Math.abs(adjacentRoomCoords[i][1]) + 1,
                    roomExists = this.roomExists(roomsArray, 
                            [adjacentRoomCoords[i][0], adjacentRoomCoords[i][1]]);
                
                if (absX < maxWidth && 
                        absY < maxHeight &&
                        !roomExists) { // Do not push existing rooms
                    availableRoomCoords.push(adjacentRoomCoords[i]);
                }
            }

            return availableRoomCoords;
        },

        getRandomRoomCoords: function (availableRoomCoords) {
            return availableRoomCoords[Math.floor(Math.random() * availableRoomCoords.length)];
        },

        convertRoomCoordsToPixels: function (roomCoords) {
            var x = (this.width / 2) + (this.roomSize * roomCoords.x);
            var y = (this.height / 2) + (this.roomSize * roomCoords.y);
            return [x, y];
        },
        
        connectRooms: function (roomsArray) {
            
        },

        draw: function (roomsArray, color) {
            var roomsArrayLength = roomsArray.length;
       
            for (var i = 0; i < roomsArrayLength; i++) {
                    console.log(roomsArray[i].roomType);
                    console.log(roomsArray[i]);
                if (roomsArray[i].roomType !== 'blank') {
                    this.drawRoom(roomsArray[i], color);
                } else {

                }
                //this.drawRoom(roomsArray[i], this.defaultRoomColor);
            }
           
            this.drawRoom(roomsArray[1], this.startRoomColor);
            //this.drawRoom(roomsArray[roomsArrayLength - 1], this.endRoomColor);
        },

        drawRoom: function (roomToDraw, roomColor) {
            var coords = this.convertRoomCoordsToPixels(roomToDraw),
                x = coords[0],
                y = coords[1];
            
            this.context.fillStyle = this.roomBG;
            this.context.fillRect (x, y, this.roomSize, this.roomSize);
            this.context.fillStyle = roomColor;

            this.context.fillRect (x + (this.roomSize / 4), 
                y + (this.roomSize / 4), 
                this.innerRoomSize, 
                this.innerRoomSize);


            this.context.fillStyle = 'blue';
            if (roomToDraw.roomType === 'locked') {
                this.context.fillRect (x + (this.roomSize / 4), 
                    y + (this.roomSize / 4), 
                    this.innerRoomSize, 
                    this.innerRoomSize);
            }

            this.drawDoors(roomToDraw);
            
        },

        drawDoors: function (roomToDraw) {
            var roomDoors = roomToDraw.door,
                doorCoords = this.convertRoomCoordsToPixels(roomToDraw),
                x,
                y;
                //x = doorCoords[0],
                //y = doorCoords[1];
            
            this.context.fillStyle = 'blue';
            for (var doorDir in roomDoors) {
                if (doorDir === 'up') {
                    x = doorCoords[0] + 1 + this.roomSize / 4 + this.roomSize / 8;
                    y = doorCoords[1];
                } else if (doorDir === 'down') {
                    x = doorCoords[0] + 1 + this.roomSize / 4 + this.roomSize / 8;
                    y = doorCoords[1] + this.roomSize / 4 + this.roomSize / 2;
                } else if (doorDir === 'left') {
                    x = doorCoords[0];
                    y = doorCoords[1] + 1 + this.roomSize / 4 + this.roomSize / 8;
                } else if (doorDir === 'right') {
                    x = doorCoords[0] + this.roomSize / 4 + this.roomSize / 2;
                    y = doorCoords[1] + 1 + this.roomSize / 4 + this.roomSize / 8;
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
                doorSize = this.roomSize / 4;

            this.context.fillStyle = color;
            this.context.fillRect (x, y, doorSize, doorSize);

        }
    };
    window.onload = function () {
        new Map();
    };
})();
