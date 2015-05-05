RZ.Map = function (dungeon, context) {
    this.context = context; // The canvas context to which you want to draw

    // Declare static settings
    this.ROOM_SIZE = dungeon.ROOM_SIZE;
    this.INNER_ROOM_SIZE = this.ROOM_SIZE / 2;
    this.START_ROOM_COLOR = '#88d800';
    this.DEFAULT_ROOM_COLOR = '#444444';
    this.BOSS_ROOM_COLOR = '#B53120';
    this.BG = '#FCB514';
    this.ROOM_BG = '#000000';
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
        this.context.fillRect(0, 0, RZ.Screen.width, RZ.Screen.height);
        
        while (existingLen > 0) {
            existingLen = existingLen - 1;
            roomToDraw = existingRooms[existingLen];
            roomType =  grid[roomToDraw.x][roomToDraw.y].roomType;

            if (roomType === 'seed') {
                roomColor = this.DEFAULT_ROOM_COLOR;
            } else if (roomType === 'branch') {
                roomColor = this.BG;
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
            this.ROOM_SIZE * roomCoords.x,
            this.ROOM_SIZE * roomCoords.y
        ];
    }
};
