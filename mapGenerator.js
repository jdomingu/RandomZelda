(function () {
    
    var Room = function (x, y) {
        this.x = x;
        this.y = y;
    };

    var Map = function () {
        var numRooms = 20,
            startRoom = new Room(0, 0);

        this.roomsArray = [];
        this.generate(this.roomsArray, numRooms, startRoom);
        this.draw(this.roomsArray);
    };

    Map.prototype = {

        generate: function (roomsArray, numRooms, currentRoom) {
            if (roomsArray.length < numRooms) {
                var availableRoomCoords = this.getAdjacent(roomsArray, currentRoom),
                    nextRoomCoords = this.getRandomRoomCoords(availableRoomCoords),
                    nextRoom = this.getRoomIfExists(roomsArray, nextRoomCoords);

                if (typeof nextRoom === 'undefined') {
                    nextRoom = new Room(nextRoomCoords[0], nextRoomCoords[1]);
                    roomsArray.push(nextRoom);
                } 

                console.log(roomsArray);
                this.generate(roomsArray, numRooms, nextRoom);
            }
            
            return roomsArray;
        },

        getRoomIfExists: function (roomsArray, nextRoomCoords) {
            var roomsArrayLength = roomsArray.length;

            for (var i = 0; i < roomsArrayLength; i++) {
                if (nextRoomCoords[0] === roomsArray[i].x && nextRoomCoords[1] === roomsArray[i].y) {
                    console.log('duplicate detected');
                    return roomsArray[i];
                }
            }

        },

        getAdjacent: function (roomsArray, currentRoom) {
            var roomsArrayLength = roomsArray.length;
            var adjacentRoomCoords = [[currentRoom.x + 1, currentRoom.y], 
                [currentRoom.x - 1, currentRoom.y],
                [currentRoom.x, currentRoom.y + 1],
                [currentRoom.x, currentRoom.y - 1]];
            var adjacentRoomCoordsLength = adjacentRoomCoords.length;

             
            return adjacentRoomCoords;
        },

        getRandomRoomCoords: function (availableRoomCoords) {
            return availableRoomCoords[Math.floor(Math.random()*availableRoomCoords.length)];
        },

        convertRoomCoordsToPixels: function (roomCoords, width, height, roomSize) {
            var x = (width / 2) + (roomSize * roomCoords.x);
            var y = (height / 2) + (roomSize * roomCoords.y);
            return [x, y];
        },

        draw: function (roomsArray) {
            var canvas = document.getElementById('map'),
                context = canvas.getContext('2d'),
                width = 600, // Ensure this matches width of canvas tag
                height = 600,
                roomSize = 25,
                innerRoomSize = roomSize / 2,
                cols = width / roomSize, 
                rows = height / roomSize;
            
        

            for (var i = 0; i < roomsArray.length; i++) {
                var coords = this.convertRoomCoordsToPixels(roomsArray[i], width, height, roomSize),
                    x = coords[0],
                    y = coords[1];
                
                context.fillStyle = '#000000';
                context.fillRect (x, y, roomSize, roomSize);
                context.fillStyle = '#333333';

                if (i === 0) { // Set the start room to green
                    context.fillStyle = '#88d800';
                }

                if (i === roomsArray.length - 1) { // Set the end room to red
                    context.fillStyle = '#b53120';
                }

                context.fillRect (x + (roomSize / 4), y + (roomSize / 4), innerRoomSize, innerRoomSize);
            }
        }
    };
    window.onload = function () {
        new Map();
    };
})();
