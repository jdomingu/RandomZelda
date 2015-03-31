(function () {
    
    var Room = function (x, y) {
        this.x = x;
        this.y = y;
    };

    var Map = function () {
        var numRooms = 35,
            startRoom = new Room(0, 0);

        this.width = 600; // Ensure this matches width of canvas tag
        this.height = 600; // Same
        this.roomSize = 25;
        this.innerRoomSize = this.roomSize / 2;

        this.draw(this.generate([startRoom], numRooms, startRoom));
    };

    Map.prototype = {

        generate: function (roomsArray, numRooms, currentRoom) {
            // Base case
            if (roomsArray.length >= numRooms) {
                return roomsArray;
            }
            
            // Recursive case
            var availableRoomCoords = this.getAdjacent(currentRoom),
                roomCoords = this.getRandomRoomCoords(availableRoomCoords),
                nextRoom = new Room(roomCoords[0], roomCoords[1]);

            if (!this.roomExists(roomsArray, roomCoords)) {
                // Add if it wasn't already there
                roomsArray.push(nextRoom);
            }
            // Use it as the next stop regardless
            return roomsArray.concat(this.generate(roomsArray, numRooms, nextRoom));
        },

        roomExists: function (roomsArray, nextRoomCoords) {
            var roomsArrayLength = roomsArray.length;

            if (roomsArrayLength == 0) {
                return true;
            }

            for (var i = 0; i < roomsArrayLength; i++) {
                if (nextRoomCoords[0] === roomsArray[i].x && 
                        nextRoomCoords[1] === roomsArray[i].y) {
                    return true;
                }
            }
            return false;
        },

        getAdjacent: function (currentRoom) {
            var maxDistance = Math.floor(24 / 2),
                availableRoomCoords = [];

            var adjacentRoomCoords = [[currentRoom.x + 1, currentRoom.y], 
                [currentRoom.x - 1, currentRoom.y],
                [currentRoom.x, currentRoom.y + 1],
                [currentRoom.x, currentRoom.y - 1]];
             
            for (var i = 0; i < adjacentRoomCoords.length; i++) {
                var absX = Math.abs(adjacentRoomCoords[i][0]) + 1,
                    absY = Math.abs(adjacentRoomCoords[i][1]) + 1; 
                if (absX < maxDistance && absY < maxDistance) {
                    availableRoomCoords.push(adjacentRoomCoords[i]);
                }
            }

            console.log(availableRoomCoords.length);
            return availableRoomCoords;
        },

        getRandomRoomCoords: function (availableRoomCoords) {
            return availableRoomCoords[Math.floor(Math.random()*availableRoomCoords.length)];
        },

        convertRoomCoordsToPixels: function (roomCoords) {
            var x = (this.width / 2) + (this.roomSize * roomCoords.x);
            var y = (this.height / 2) + (this.roomSize * roomCoords.y);
            return [x, y];
        },

        draw: function (roomsArray) {
            var canvas = document.getElementById('map'),
                context = canvas.getContext('2d');
       
            // Fill every visited node
            for (var i = 0; i < roomsArray.length; i++) {
                var coords = this.convertRoomCoordsToPixels(roomsArray[i]),
                    x = coords[0],
                    y = coords[1];
                
                context.fillStyle = '#000000';
                context.fillRect (x, y, this.roomSize, this.roomSize);
                context.fillStyle = '#333333';

                context.fillRect (x + (this.roomSize / 4), 
                    y + (this.roomSize / 4), 
                    this.innerRoomSize, 
                    this.innerRoomSize);
            }
            
            var coords = this.convertRoomCoordsToPixels(roomsArray[0]),
                x = coords[0],
                y = coords[1];

            // Set the start room to green
            context.fillStyle = '#88d800';

            context.fillRect (x + (this.roomSize / 4), 
                y + (this.roomSize / 4), 
                this.innerRoomSize, 
                this.innerRoomSize);

            coords = this.convertRoomCoordsToPixels(roomsArray[roomsArray.length - 1]);
            x = coords[0];
            y = coords[1];
                
            // Set the end room to red
            context.fillStyle = '#b53120';

            context.fillRect (x + (this.roomSize / 4), 
                y + (this.roomSize / 4), 
                this.innerRoomSize, 
                this.innerRoomSize);
        }
    };
    window.onload = function () {
        new Map();
    };
})();
