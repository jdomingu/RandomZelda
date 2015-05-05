RZ.Screen = {
    init: function (id) {
        this.fgCanvas = document.getElementById(id);
        this.bgCanvas = document.getElementById(id).cloneNode(true);
        this.mapCanvas = document.getElementById(id).cloneNode(true);

        this.bgCanvas.id = 'RZbg';
        this.bgCanvas.style.zIndex = -1;
        document.body.appendChild(this.bgCanvas);

        this.mapCanvas.id = 'RZmap';
        this.mapCanvas.style.visibility = 'hidden';
        document.body.appendChild(this.mapCanvas);

        this.fg = this.fgCanvas.getContext('2d');
        this.bg = this.bgCanvas.getContext('2d');
        this.map = this.mapCanvas.getContext('2d');

        this.width = this.fgCanvas.clientWidth; // Get the width of the canvas element
        this.height = this.fgCanvas.clientHeight; // and the height
    }
};
