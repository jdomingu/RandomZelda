RZ.Screen = {
    init: function (id) {
        var fgCanvas = document.getElementById(id),
            bgCanvas = document.getElementById(id).cloneNode(true);

        bgCanvas.id = 'RZbg';
        bgCanvas.style.zIndex = -1;
        document.body.appendChild(bgCanvas);

        this.fg = fgCanvas.getContext('2d');
        this.bg = bgCanvas.getContext('2d');
        this.width = fgCanvas.clientWidth; // Get the width of the canvas element
        this.height = fgCanvas.clientHeight; // and the height
    }
};
