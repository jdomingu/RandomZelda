RZ.Keyboard = {
    init: function () {
        window.onkeydown = function(e) {
          RZ.Keyboard.states[e.keyCode] = true;
        };

        window.onkeyup = function(e) {
          RZ.Keyboard.states[e.keyCode] = false;
        };
    },

    states: {},

    codes: {
        'W': 87,
        'A': 65,
        'S': 83,
        'D': 68,
        'UP': 38,
        'LEFT': 37,
        'DOWN': 40,
        'RIGHT': 39
    },

    isDown: function (key) {
      var keyCode = RZ.Keyboard.codes[key];
      return RZ.Keyboard.states[keyCode] === true;
    },

    isAnyKeyDown: function () {
        for (var key in this.codes) {
            if (this.states[this.codes[key]] === true) {
                return true;
            }
        }

        return false;
        } 
};
