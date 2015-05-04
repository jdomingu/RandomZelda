RZ.Player = function () {
    this.x = 0;
    this.y = 0;
    this.sx = 0; // The upper left coordinates of the section of the
    this.sy = 0; // sprite sheet image to use (source x and y).
    this.width = 48;
    this.height = 48;
    this.speed = 24;
    this.interval = 4;
};

RZ.Player.prototype = {
    update: function (context) {
        if (this.interval > 0) {
            this.interval -= 1;
        } else {
            console.log(this.sy);
            context.clearRect(this.x, this.y, this.width, this.height);

            if (RZ.Keyboard.isDown('W') || RZ.Keyboard.isDown('UP')) {
                this.y -= this.speed;
                this.sx = 96;
                this.sy = (this.sy === 0 ? 48 : 0);
            } else if (RZ.Keyboard.isDown('A') || RZ.Keyboard.isDown('LEFT')) {
                this.x -= this.speed;
                this.sx = 48;
                this.sy = (this.sy === 0 ? 48 : 0);
            } else if (RZ.Keyboard.isDown('S') || RZ.Keyboard.isDown('DOWN')) {
                this.y += this.speed;
                this.sx = 0;
                this.sy = (this.sy === 0 ? 48 : 0);
            } else if (RZ.Keyboard.isDown('D') || RZ.Keyboard.isDown('RIGHT')) {
                this.x += this.speed;
                this.sx = 144;
                this.sy = (this.sy === 0 ? 48 : 0);
            }

            context.drawImage(RZ.Assets.link, this.sx, this.sy, this.width, this.height, this.x, this.y, this.width, this.height);
            this.interval = 4;
        }
    }
};
