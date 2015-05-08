RZ.Screen = {
    init: function (id) {
        this.fg = document.getElementById(id);

        var width = this.fg.clientWidth, // Get the width of the canvas element
            height = this.fg.clientHeight; // and the height
        
        this.bg = document.createElement('canvas');
        this.bg.id = 'RZbg';
        this.bg.width = width;
        this.bg.height = height;
        this.bg.position = 'absolute';
        this.bg.top = '0px';
        this.bg.left = '0px';
        this.bg.background = 'transparent';
        this.bg.style.zIndex = -1;
        document.body.appendChild(this.bg);

        this.map = document.createElement('canvas');
        this.map.id = 'RZmap';
        this.map.width = width;
        this.map.height = height;
        this.map.position = 'absolute';
        this.map.top = '0px';
        this.map.left = '0px';
        this.map.background = 'transparent';
        this.map.style.visibility = 'hidden';
        document.body.appendChild(this.map);
    }
};
