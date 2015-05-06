RZ.Player = function (context) {
    this.context = context;
    this.width = 48; // Sprite width and height
    this.height = 48;
    this.x = RZ.Screen.width / 2 - this.width / 2; // Put player in center, account for player size and heads up display
    this.y = RZ.Screen.height / 2 - this.height / 2 + RZ.Room.prototype.headsUpDisplayHeight / 2;
    this.sx = 0; // The upper left coordinates of the section of the
    this.sy = 0; // sprite sheet image to use (source x and y).
    this.speed = 16;
    this.intervalOrig = 3;
    this.interval = 3; // Slow down animation with an interval
    this.animIntervalOrig = 1;
    this.animInterval = 1; // Slow down animation image change
};

RZ.Player.prototype = {
    init: function () {
        var that = RZ.Game.player;
        that.context.drawImage(RZ.Assets.link, that.sx, that.sy, that.width, that.height, that.x, that.y, that.width, that.height);
    },

    update: function () {
        if (this.interval > 0) {
            this.interval -= 1;
        } else {
            this.context.clearRect(this.x, this.y, this.width, this.height);
        
            this.toggleAnimation();
            this.move();
            this.keepInBounds();

            this.context.drawImage(RZ.Assets.link, this.sx, this.sy, this.width, this.height, this.x, this.y, this.width, this.height);
            this.interval = this.intervalOrig;
        }
    },

    move: function () {
        if (RZ.Keyboard.isDown('W')) {
            this.y -= this.speed;
            this.sx = 96;
        } else if (RZ.Keyboard.isDown('A')) {
            this.x -= this.speed;
            this.sx = 48;
        } else if (RZ.Keyboard.isDown('S')) {
            this.y += this.speed;
            this.sx = 0;
        } else if (RZ.Keyboard.isDown('D')) {
            this.x += this.speed;
            this.sx = 144;
        }
    },

    keepInBounds: function () {
        var screenWidthMinusPlayer = RZ.Screen.width - this.width,
            screenHeightMinusPlayer = RZ.Screen.height - this.height,
            headsUpDisplayHeight = RZ.Room.prototype.headsUpDisplayHeight;

        if (this.x <= 0) {
            this.x = 0;
        }
        if (this.y <= headsUpDisplayHeight) {
            this.y = headsUpDisplayHeight;
        }
        if (this.x >= screenWidthMinusPlayer) {
            this.x = screenWidthMinusPlayer;
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
