RZ.Assets = {
    init: function (callback) {
        var img = [];
        this.img = img;

        var imagesToLoad = [
            ['tiles', 'img/tiles.png'],
            ['link', 'img/link.png']
        ];

        var imgLen = imagesToLoad.length;
        var loadCount = imgLen;

        var isDoneLoading = function () {
            loadCount -= 1;
            if (loadCount === 0) {
                callback();
            }
        };

        var loadImage = function (imgName, imgPath) {
            img[imgName] = new Image();
            img[imgName].onload = function () {
                isDoneLoading();
            };
            img[imgName].src = imgPath;
        };

        for (var i = 0; i < imgLen; i++) {
            loadImage(imagesToLoad[i][0], imagesToLoad[i][1]);
        }
    }
};
