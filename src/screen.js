RZ.Screen = {
    init: function (id) {
        this.fgCanvas = document.getElementById(id);
        this.fg = this.fgCanvas.getContext('2d');
        this.width = this.fgCanvas.clientWidth; // Get the width of the canvas element
        this.height = this.fgCanvas.clientHeight; // and the height
        
        this.bgCanvas = document.createElement('canvas');
        this.bgCanvas.id = 'RZbg';
        this.bgCanvas.width = this.width;
        this.bgCanvas.height = this.height;
        this.bgCanvas.position = 'absolute';
        this.bgCanvas.top = '0px';
        this.bgCanvas.left = '0px';
        this.bgCanvas.background = 'transparent';
        this.bgCanvas.style.zIndex = -1;
        document.body.appendChild(this.bgCanvas);
        this.bg = this.bgCanvas.getContext('2d');

        this.mapCanvas = document.createElement('canvas');
        this.mapCanvas.id = 'RZmap';
        this.mapCanvas.width = this.width;
        this.mapCanvas.height = this.height;
        this.mapCanvas.position = 'absolute';
        this.mapCanvas.top = '0px';
        this.mapCanvas.left = '0px';
        this.mapCanvas.background = 'transparent';
        this.mapCanvas.style.visibility = 'hidden';
        document.body.appendChild(this.mapCanvas);
        this.map = this.mapCanvas.getContext('2d');
    }
};
