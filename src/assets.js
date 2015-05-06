RZ.Assets = {
    init: function (callback) {
        var loadCount = 2;

        var isDoneLoading = function () {
            loadCount -= 1;
            if (loadCount === 0) {
                callback();
            }
        };

        this.tiles = new Image();
        this.tiles.onload = function () {
            isDoneLoading();
        };
        this.tiles.src = 'img/tiles.png';

        this.link = new Image();
        this.link.onload = function () {
            isDoneLoading();
        };
        this.link.src = 'img/link.png';
    }
};
