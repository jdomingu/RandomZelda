RZ.Screen = {
    init: function (id) {
        var mainDiv = document.getElementById(id),
            headsUpDisplayHeight = 192,
            width = mainDiv.clientWidth, // Get the width of the canvas element
            height = mainDiv.clientHeight, // and the height
            heightMinusHUD = height - headsUpDisplayHeight; // and the height
        
        this.mapStartTop = 0 - heightMinusHUD;
        this.roomStartTop = headsUpDisplayHeight;

        this.map = document.createElement('canvas');
        this.map.id = 'RZmap';
        this.map.width = width;
        this.map.height = height;
        this.map.style.position = 'absolute';
        this.map.startTop = 0 - heightMinusHUD;
        this.map.style.top = this.map.startTop;
        this.map.style.left = 0;
        this.map.style.background = 'transparent';
        this.map.style.zIndex = 0;
        mainDiv.appendChild(this.map);
        
        this.fg = document.createElement('canvas');
        this.fg.id = 'RZfg';
        this.fg.width = width;
        this.fg.height = heightMinusHUD;
        this.fg.style.position = 'absolute';
        this.fg.style.top = headsUpDisplayHeight;
        this.fg.style.left = 0;
        this.fg.style.background = 'transparent';
        this.fg.style.zIndex = -1;
        mainDiv.appendChild(this.fg);

        this.bg = document.createElement('canvas');
        this.bg.id = 'RZbg';
        this.bg.width = width;
        this.bg.height = heightMinusHUD;
        this.bg.style.position = 'absolute';
        this.bg.style.top = headsUpDisplayHeight;
        this.bg.style.left = 0;
        this.bg.style.background = 'transparent';
        this.bg.style.zIndex = -2;
        mainDiv.appendChild(this.bg);

        this.bg.innerHTML += '<p>Ensure that your browser is compatible with canvas</p>';
    },

    mapTransition: function (direction) {
        if (direction === 'coming') {
            RZ.Screen.transition(RZ.Screen.map, RZ.Screen.map.style.top, 0, 'top');
            RZ.Screen.transition(RZ.Screen.fg, RZ.Screen.fg.style.top, RZ.Screen.map.height, 'top');
            RZ.Screen.transition(RZ.Screen.bg, RZ.Screen.bg.style.top, RZ.Screen.map.height, 'top');
        } else if (direction === 'going') {
            RZ.Screen.transition(RZ.Screen.map, RZ.Screen.map.style.top, RZ.Screen.mapStartTop, 'top');
            RZ.Screen.transition(RZ.Screen.fg, RZ.Screen.fg.style.top, RZ.Screen.roomStartTop, 'top');
            RZ.Screen.transition(RZ.Screen.bg, RZ.Screen.bg.style.top, RZ.Screen.roomStartTop, 'top');
        }
    },

    transition: function (canvas, start, end, side) {
        var diff = parseInt(start) - end,
            dist = 5;

        if (Math.abs(diff) < dist) {
            RZ.Game.locked = false;
            canvas.style[side] = end;
            return;
        } else if (diff < 0) {
            canvas.style[side] = parseInt(start) + dist;
        } else if (diff > 0) { 
            canvas.style[side] = parseInt(start) - dist;
        }

        setTimeout(function () { 
            RZ.Screen.transition(canvas, canvas.style[side], end, side);
        }, 10);
    }
};
