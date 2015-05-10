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
    },

    legend: {
       /* Link
        * 0 - Facing down
        * 1 - Facing left
        * 2 - Facing up
        * 3 - Facing right */
        link: {
            '0': [0,0],
            '1': [48, 0],
            '2': [96, 0],
            '3': [144, 0]
        },

       /* Tiles
        * 0 - Empty tile
        * 1 - Block
        * 2 - Right-facing statue
        * 3 - Left-facing statue
        * 4 - Speckled tile
        * 5 - Stairs
        * 6 - Water
        */
        tiles: {
            '0': [0, 0],
            '1': [0, 48],
            '2': [0, 96],
            '3': [0, 144],
            '4': [0, 192],
            '5': [0, 240],
            '6': [0, 288]
        },

        tiles_contrast: {
            '0': [48, 0],
            '1': [48, 48],
            '2': [48, 96],
            '3': [48, 144],
            '4': [48, 192],
            '5': [48, 240],
            '6': [48, 288]
        },

       /* Walls
        * 0 - Blank walls
        * 1 - Left door, open
        * 2 - Top door, open
        * 3 - Right door, open
        * 4 - Bottom door, openn
        * 5 - Left door, locked
        * 6 - Top door, locked
        * 7 - Right door, locked
        * 8 - Bottom door, locked */
        walls: {
            '0': [0, 96],
            '1': [0, 1152],
            '2': [72, 1152],
            '3': [264, 1152],
            '4': [72, 1224]
        },

        walls_contrast: {
            '0': [0, 624]
        }
    }
};
