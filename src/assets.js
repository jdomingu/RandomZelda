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

       /* Doors
        * [source_x, source_y, dest_x, dest_y, width, height]
        */
        doors: {
            left: {
                'open': [24, 1152, 48, 192, 48, 144],
                'locked': [0, 1296, 24, 192, 72, 144],
            },
            up: {
                'open': [72, 1176, 288, 48, 192, 48],
                'locked': [72, 1296, 288, 24, 192, 72],
            },
            right: {
                'open': [264, 1152, 672, 192, 72, 144],
                'locked': [264, 1296, 672, 192, 72, 144],
            },
            down: {
                'open': [72, 1224, 288, 432, 192, 48],
                'locked': [72, 1368, 288, 432, 192, 72]
            }
        },

        doors_contrast: {
            left: {
                'open': [360, 1152, 48, 192, 48, 144],
                'locked': [336, 1296, 24, 192, 72, 144],
            },
            up: {
                'open': [408, 1176, 288, 48, 192, 48],
                'locked': [408, 1296, 288, 24, 192, 72],
            },
            right: {
                'open': [600, 1152, 672, 192, 72, 144],
                'locked': [600, 1296, 672, 192, 72, 144],
            },
            down: {
                'open': [408, 1224, 288, 432, 192, 72],
                'locked': [408, 1368, 288, 432, 192, 48]
            }
        },

        door_frames: {
            left: {
                'open': [0, 1152, 24, 192, 24, 144],
                'locked': [0, 1152, 24, 192, 24, 144]
            },
            up: {
                'open': [72, 1152, 288, 24, 192, 24],
                'locked': [72, 1152, 288, 24, 192, 24]
            },
            right: {
                'open': [312, 1152, 720, 192, 24, 144],
                'locked': [312, 1152, 720, 192, 24, 144]
            },
            down: {
                'open': [72, 1272, 288, 480, 192, 24],
                'locked': [72, 1272, 288, 480, 192, 24]
            }
        },

        door_frames_contrast: {
            left: {
                'open': [336, 1152, 24, 192, 24, 144],
                'locked': [336, 1152, 24, 192, 24, 144]
            },
            up: {
                'open': [408, 1152, 288, 24, 192, 24],
                'locked': [408, 1152, 288, 24, 192, 24]
            },
            right: {
                'open': [648, 1152, 720, 192, 24, 144],
                'locked': [648, 1152, 720, 192, 24, 144]
            },
            down: {
                'open': [408, 1272, 288, 480, 192, 24],
                'locked': [408, 1272, 288, 480, 192, 24]
            }
        },

       /* Walls
        * [source_x, source_y, dest_x, dest_y, width, height]
        */
        walls: [24, 120, 24, 24, 720, 480],

        walls_contrast: [24, 648, 24, 24, 720, 480],

        wall_frames: {
            left: [0, 96, 0, 0, 24, 528],
            up: [24, 96, 24, 0, 720, 24],
            right: [744, 96, 744, 0, 24, 528],
            down: [24, 600, 24, 504, 720, 24]
        },

        wall_frames_contrast: {
            left: [0, 624, 0, 0, 24, 528],
            up: [24, 624, 24, 0, 720, 24],
            right: [744, 624, 744, 0, 24, 528],
            down: [24, 1128, 24, 504, 720, 24]
        },
    }
};
