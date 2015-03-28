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
        this.roomsArray = [];

        this.generate(this.roomsArray, numRooms, startRoom);
        this.draw(this.roomsArray);
    };

    Map.prototype = {

        generate: function (roomsArray, numRooms, currentRoom) {
            if (roomsArray.length < numRooms) {
                var availableRoomCoords = this.getAdjacent(roomsArray, numRooms, currentRoom),
                    nextRoomCoords = this.getRandomRoomCoords(availableRoomCoords),
                    nextRoom = this.getRoomIfExists(roomsArray, nextRoomCoords);

                if (typeof nextRoom === 'undefined') {
                    nextRoom = new Room(nextRoomCoords[0], nextRoomCoords[1]);
                    roomsArray.push(nextRoom);
                } 

                this.generate(roomsArray, numRooms, nextRoom);
            }
            
            return roomsArray;
        },

        getRoomIfExists: function (roomsArray, nextRoomCoords) {
            var roomsArrayLength = roomsArray.length;

            for (var i = 0; i < roomsArrayLength; i++) {
                if (nextRoomCoords[0] === roomsArray[i].x && 
                        nextRoomCoords[1] === roomsArray[i].y) {
                    return roomsArray[i];
                }
            }

        },

        getAdjacent: function (roomsArray, numRooms, currentRoom) {
            var roomsArrayLength = roomsArray.length,
                maxDistance = Math.floor(24 / 2),
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
       

            for (var i = 0; i < roomsArray.length; i++) {
                var coords = this.convertRoomCoordsToPixels(roomsArray[i]),
                    x = coords[0],
                    y = coords[1];
                
                context.fillStyle = '#000000';
                context.fillRect (x, y, this.roomSize, this.roomSize);
                context.fillStyle = '#333333';

                if (i === 0) { // Set the start room to green
                    context.fillStyle = '#88d800';
                }

                if (i === roomsArray.length - 1) { // Set the end room to red
                    context.fillStyle = '#b53120';
                }

                context.fillRect (x + (this.roomSize / 4), 
                    y + (this.roomSize / 4), 
                    this.innerRoomSize, 
                    this.innerRoomSize);
            }
        }
    };
    window.onload = function () {
        new Map();
    };
})();
