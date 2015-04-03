(function () {
    
    var Room = function (x, y) {
        this.x = x;
        this.y = y;
        // Set default values
        this.roomType = 'open'; // Or 'locked', 'boss'
        this.upDoor = 'none'; // Or 'open', 'locked'
        this.downDoor = 'none';
        this.leftDoor = 'none';
        this.rightDoor = 'none';
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
        var startRoom = new Room(0, 0);
        var coreRoomsArray = this.generate([startRoom], this.numRooms / 2, startRoom);
        var roomsArray = coreRoomsArray.slice(0);
        roomsArray = this.generateBranches(roomsArray, this.numRooms / 2);
        this.connectRooms(roomsArray);
        this.draw(roomsArray, this.defaultRoomColor);
        this.draw(coreRoomsArray, '#FCB514');
    };

    Map.prototype = {

        generate: function (roomsArray, numRooms, currentRoom) {
        // Walk a random path, generating rooms as you go.
            if (roomsArray.length >= numRooms) { // Base case
                return roomsArray;
            } else { // Recursive case
                var availableRoomCoords = this.getAdjacent(roomsArray, currentRoom),
                    nextRoom;

                if (availableRoomCoords.length < 1) {
                // Sometimes when walking you box yourself in and need to jump
                // to an existing room to keep going
                    nextRoom = this.getRandomRoom(roomsArray);
                } else {
                    var roomCoords = this.getRandomRoomCoords(availableRoomCoords);
                    nextRoom = new Room(roomCoords[0], roomCoords[1]);
                    roomsArray.push(nextRoom);
                }

                return this.generate(roomsArray, numRooms, nextRoom);
            }
        },

        generateBranches: function (coreRooms, numBranchRooms) {
            // Generate branches of a random length less than the number
            // of rooms remaining until there are no more rooms to create.
            // Branches greatly minimize the problem of long, single-room stretches.
            var allRooms = coreRooms.slice(0), // Make a copy
                roomsRemaining = numBranchRooms,
                branches = []; // Array of branch room arrays

            for (var i = 0; i < numBranchRooms; i++) {
                var randomRoom = this.getRandomRoom(coreRooms), 
                    branchLength = Math.ceil(Math.random() * (roomsRemaining / 2));
                    // Dividing by two yields better results by minimizing long branches

                allRooms = this.generate(allRooms, allRooms.length + branchLength, randomRoom);
                roomsRemaining = roomsRemaining - branchLength;
                
                branches[i] = [randomRoom];
                // Keep track of the entry point for the branch and the recently 
                // generated branch rooms
                while (branchLength > 0) {                    
                    branches[i].push(allRooms[allRooms.length - branchLength]);
                    branchLength--;
                }
            }
            
            this.setLockedBranches(branches);
            console.log(branches);
            return allRooms;
        },
        
        setLockedBranches: function (branches) {
            // Only lock some branches
            var numLockedBranches = this.numRooms / 10;
            // To Do: Sort by branch length first
            for (var i = 0; i < numLockedBranches; i++) {
                for (var j = 0; j < branches[i].length; j++) {
                    branches[i][j].roomType = 'locked';
                }
            }
        },

        getRandomRoom: function (roomsArray) {
            return roomsArray[Math.floor(Math.random() * roomsArray.length)];
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
                this.drawRoom(roomsArray[i], color);
                //this.drawRoom(roomsArray[i], this.defaultRoomColor);
            }
           
            this.drawRoom(roomsArray[0], this.startRoomColor);
            this.drawRoom(roomsArray[roomsArrayLength - 1], this.endRoomColor);
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

        }
    };
    window.onload = function () {
        new Map();
    };
})();
