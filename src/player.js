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
        /* Gets two pairs of coordinates in the direction of movement and
         * ensures that the adjacent tile or tiles can be entered.
         * To make going around corners easier, contract the coordinates 
         * toward the player's center by an amount equal to the player's speed. */
        var origY = this.y,
            xAlign = this.getGridAlign(this.x),
            yAlign = this.getGridAlign(this.y);

        if (RZ.Keyboard.isDown('W')) { // Ex. When going up, get the upper left and upper
            if (RZ.Game.currentRoom.isAccessible(this.x + this.speed, // right coordinates
                                                 this.y + this.width / 2 - this.speed) &&
               (RZ.Game.currentRoom.isAccessible(this.x + this.width - this.speed, 
                                                 this.y + this.width / 2 - this.speed))) {

                this.y -= this.speed;
                this.x += xAlign;
            }
            this.sx = RZ.Assets.legend.link[2][0];
        } else if (RZ.Keyboard.isDown('S')) {
            if (RZ.Game.currentRoom.isAccessible(this.x + this.speed, 
                                                 this.y + this.width  + this.speed) &&
               (RZ.Game.currentRoom.isAccessible(this.x + this.width - this.speed, 
                                                 this.y + this.width  + this.speed)) ) {

                this.y += this.speed;
                this.x += xAlign; 
            }
            this.sx = RZ.Assets.legend.link[0][0];
        } 
        
        if (origY === this.y) {
        /* Only allow lateral movement if not moving vertically (do not allow diagonal movement)
         * At the edge of the screen, the player can hold two keys without being frozen in place
         * E.g. If the player walks up to the top, holding up and right simultaneously allows 
         * the player to move right */
            if (RZ.Keyboard.isDown('A')) { 
                 if (RZ.Game.currentRoom.isAccessible(this.x - this.speed, 
                                                      this.y + this.width / 2 + this.speed) &&
                    (RZ.Game.currentRoom.isAccessible(this.x - this.speed, 
                                                      this.y + this.width - this.speed))) {

                    this.x -= this.speed;
                    this.y += yAlign;
                }
                this.sx = RZ.Assets.legend.link[1][0];
            } else if (RZ.Keyboard.isDown('D')) {
                if (RZ.Game.currentRoom.isAccessible(this.x + this.width + this.speed, 
                                                     this.y + this.width / 2 + this.speed) &&
                   (RZ.Game.currentRoom.isAccessible(this.x + this.width + this.speed, 
                                                     this.y + this.width - this.speed))) {

                    this.x += this.speed;
                    this.y += yAlign;
                }
                this.sx = RZ.Assets.legend.link[3][0];
            }
        }
    },

    getGridAlign: function (coord) {
        /* When the player is mis-aligned with the grid, slowly snap
         * the player back to make movement easier. */
        var rem = coord % 24,
            align;

        if (rem === 0) {
            align = 0;
        } else if (rem < 12) {
            align = 0 - this.speed;
        } else {
            align = this.speed;
        }

        return align;
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
