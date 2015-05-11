RZ.Screen = {
    init: function (id) {
        var mainDiv = document.getElementById(id), // The div serves as a container
            headsUpDisplayHeight = 192,            // that hides overflow
            width = mainDiv.clientWidth, // Get the dimensions of the div
            height = mainDiv.clientHeight, 
            heightMinusHUD = height - headsUpDisplayHeight;
        
        this.mapStartTop = 0 - heightMinusHUD;
        this.roomStartTop = headsUpDisplayHeight;

        // The map canvas also contains the HUD and is positioned off-screen by default
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
        
        // The foreground canvas is for the room frame (i.e. Link walks under
        // the wall frame when going through doors
        this.fg = document.createElement('canvas');
        this.fg.id = 'RZfg';
        this.fg.width = width;
        this.fg.height = heightMinusHUD;
        this.fg.style.position = 'absolute';
        this.fg.style.top = headsUpDisplayHeight;
        this.fg.style.left = 0;
        this.fg.style.background = 'transparent';
        this.fg.style.zIndex = -2;
        mainDiv.appendChild(this.fg);

        // The main canvas is for the player and other moving objects
        this.main = document.createElement('canvas');
        this.main.id = 'RZmain';
        this.main.width = width;
        this.main.height = heightMinusHUD;
        this.main.style.position = 'absolute';
        this.main.style.top = headsUpDisplayHeight;
        this.main.style.left = 0;
        this.main.style.background = 'transparent';
        this.main.style.zIndex = -3;
        mainDiv.appendChild(this.main);

        //The background canvas is for room tiles
        this.bg = document.createElement('canvas');
        this.bg.id = 'RZbg';
        this.bg.width = width;
        this.bg.height = heightMinusHUD;
        this.bg.style.position = 'absolute';
        this.bg.style.top = headsUpDisplayHeight;
        this.bg.style.left = 0;
        this.bg.style.background = 'transparent';
        this.bg.style.zIndex = -4;
        mainDiv.appendChild(this.bg);

        // Canvas contents display as a fallback if canvas isn't supported
        this.bg.innerHTML += '<p>Ensure that your browser is compatible with canvas</p>';
    },

    mapTransition: function (direction) { // When the map moves into view, the bg and main move out
        if (direction === 'coming') {
            RZ.Screen.transition(RZ.Screen.map, RZ.Screen.map.style.top, 0, 'top');
            RZ.Screen.transition(RZ.Screen.fg, RZ.Screen.fg.style.top, RZ.Screen.map.height, 'top');
            RZ.Screen.transition(RZ.Screen.main, RZ.Screen.main.style.top, RZ.Screen.map.height, 'top');
            RZ.Screen.transition(RZ.Screen.bg, RZ.Screen.bg.style.top, RZ.Screen.map.height, 'top');
        } else if (direction === 'going') {
            RZ.Screen.transition(RZ.Screen.map, RZ.Screen.map.style.top, RZ.Screen.mapStartTop, 'top');
            RZ.Screen.transition(RZ.Screen.fg, RZ.Screen.fg.style.top, RZ.Screen.roomStartTop, 'top');
            RZ.Screen.transition(RZ.Screen.main, RZ.Screen.main.style.top, RZ.Screen.roomStartTop, 'top');
            RZ.Screen.transition(RZ.Screen.bg, RZ.Screen.bg.style.top, RZ.Screen.roomStartTop, 'top');
        }
    },

    transition: function (canvas, start, end, side) {
        var diff = parseInt(start) - end,
            dist = 5; // Increment to move the canvas for each call

        if (Math.abs(diff) < dist) {
            canvas.style[side] = end;
			RZ.Game.locked = false; // Accept player input when the transition ends
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
