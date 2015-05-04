RZ.Assets = {
    init: function (callback) {
        this.link = new Image();
        this.link.onload = function () {
            callback();
        };

        this.link.src = 'img/link.png';
    }
};
