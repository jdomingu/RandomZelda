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

        doors: {
            left: {
                'open': [0, 1152, 24, 192, 72, 144],
                'locked': [0, 1296, 24, 192, 72, 144],
            },
            up: {
                'open': [72, 1152, 288, 24, 192, 72],
                'locked': [72, 1296, 288, 24, 192, 72],
            },
            right: {
                'open': [264, 1152, 672, 192, 72, 144],
                'locked': [264, 1296, 672, 192, 72, 144],
            },
            down: {
                'open': [72, 1224, 288, 432, 192, 72],
                'locked': [72, 1368, 192, 72]
            }
        },

        doors_contrast: {
            left: {
                'open': [336, 1152, 24, 192, 72, 144],
                'locked': [336, 1296, 24, 192, 72, 144],
            },
            up: {
                'open': [408, 1152, 288, 24, 192, 72],
                'locked': [408, 1296, 288, 24, 192, 72],
            },
            right: {
                'open': [600, 1152, 672, 192, 72, 144],
                'locked': [600, 1296, 672, 192, 72, 144],
            },
            down: {
                'open': [408, 1224, 288, 432, 192, 72],
                'locked': [408, 1368, 192, 72]
            }
        },

        walls: [0, 96],

        walls_contrast: [0, 624]
    }
};
