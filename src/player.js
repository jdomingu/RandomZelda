RZ.Player = function (context) {
    this.context = context;
    this.x = 0;
    this.y = 0;
    this.sx = 0; // The upper left coordinates of the section of the
    this.sy = 0; // sprite sheet image to use (source x and y).
    this.width = 48;
    this.height = 48;
    this.speed = 16;
    this.intervalOrig = 3;
    this.interval = 3;
    this.animIntervalOrig = 1;
    this.animInterval = 1;
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
            if (this.animInterval === 0) {
                this.sy = (this.sy === 0 ? 48 : 0);
                this.animInterval = this.animIntervalOrig;
            } else {
                this.animInterval -= 1;
            }

            if (RZ.Keyboard.isDown('W') || RZ.Keyboard.isDown('UP')) {
                this.y -= this.speed;
                this.sx = 96;
            } else if (RZ.Keyboard.isDown('A') || RZ.Keyboard.isDown('LEFT')) {
                this.x -= this.speed;
                this.sx = 48;
            } else if (RZ.Keyboard.isDown('S') || RZ.Keyboard.isDown('DOWN')) {
                this.y += this.speed;
                this.sx = 0;
            } else if (RZ.Keyboard.isDown('D') || RZ.Keyboard.isDown('RIGHT')) {
                this.x += this.speed;
                this.sx = 144;
            }

            this.context.drawImage(RZ.Assets.link, this.sx, this.sy, this.width, this.height, this.x, this.y, this.width, this.height);
            this.interval = this.intervalOrig;
        }
    }
};
