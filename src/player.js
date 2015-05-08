RZ.Player = function (context) {
    this.context = context;
    this.width = 48; // Sprite width and height
    this.height = 48;
    this.x = RZ.Screen.width / 2 - this.width / 2; // Put player in center, account for player size and heads up display
    this.y = RZ.Screen.height / 2 - this.height / 2 + RZ.Room.prototype.headsUpDisplayHeight / 2;
    this.sx = 0; // The upper left coordinates of the section of the
    this.sy = 0; // sprite sheet image to use (source x and y).
    this.speed = 4;
    this.animIntervalOrig = 4;
    this.animInterval = 4; // Slow down animation image change
};

RZ.Player.prototype = {
    init: function () {
        var that = RZ.Game.player;
        that.context.drawImage(RZ.Assets.img.link, that.sx, that.sy, that.width, that.height, that.x, that.y, that.width, that.height);
    },

    update: function () {
        this.context.clearRect(this.x, this.y, this.width, this.height);
    
        this.toggleAnimation();
        this.move();

        this.context.drawImage(RZ.Assets.img.link, this.sx, this.sy, this.width, this.height, this.x, this.y, this.width, this.height);
    },

    move: function () {
        /* Up and down/left and right movement is mutually exclusive
         * Do not allow diagonal movement (if the y value changes, do not change the x value)
         * At the edge of the screen, the player can hold two keys without being frozen in place
         * E.g. If the player walks up to the top, holding up and right simultaneously allows 
         * the player to move right */
        var origY = this.y;

        if (RZ.Keyboard.isDown('W')) {
            this.y -= this.speed;
            this.sx = 96;
        } else if (RZ.Keyboard.isDown('S')) {
            this.y += this.speed;
            this.sx = 0;
        } 
        
        this.keepInBoundsY();

        if (origY === this.y) {
            if (RZ.Keyboard.isDown('A')) {
                this.x -= this.speed;
                this.sx = 48;
            } else if (RZ.Keyboard.isDown('D')) {
                this.x += this.speed;
                this.sx = 144;
            }
        }

        this.keepInBoundsX();
    },

    keepInBoundsX: function () {
        var screenWidthMinusPlayer = RZ.Screen.width - this.width;

        if (this.x <= 0) {
            this.x = 0;
        }
        
        if (this.x >= screenWidthMinusPlayer) {
            this.x = screenWidthMinusPlayer;
        }
    },    
    
    keepInBoundsY: function () {
        var screenHeightMinusPlayer = RZ.Screen.height - this.height,
            headsUpDisplayHeight = RZ.Room.prototype.headsUpDisplayHeight;

        if (this.y <= headsUpDisplayHeight) {
            this.y = headsUpDisplayHeight;
        }

        if (this.y >= screenHeightMinusPlayer) {
            this.y = screenHeightMinusPlayer;
        }
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
