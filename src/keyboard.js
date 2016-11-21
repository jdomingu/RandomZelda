var Screen = require('./screen');

var Keyboard = {
    init: function () {
        window.onkeydown = function(e) {
          Keyboard.states[e.keyCode] = true;
        };

        window.onkeyup = function(e) {
          Keyboard.states[e.keyCode] = false;
          Keyboard.hasFired[e.keyCode] = false;
        };

        var mapKey = 'SHIFT', // Pressing shift should only toggle
            keyCode = Keyboard.codes[mapKey]; // the map once
        Keyboard.hasFired[keyCode] = false;
    },

    states: {},

    hasFired: {},

    codes: {
        'W': 87,
        'A': 65,
        'S': 83,
        'D': 68,
        'SHIFT': 16
    },

    isDown: function (key) {
      var keyCode = Keyboard.codes[key];
      return Keyboard.states[keyCode] === true;
    },

    areMovementKeysDown: function () {
        var mvmtKeyCodes = ['W', 'A', 'S', 'D'];

        for (var key in mvmtKeyCodes) {
            var code = this.codes[mvmtKeyCodes[key]];

            if (this.states[code] === true) {
                return true;
            }
        }

        return false;
    },

    checkMapToggle: function () {
        var mapKey = 'SHIFT',
            keyCode = Keyboard.codes[mapKey];

        if (Keyboard.isDown(mapKey)) {

            if (Keyboard.hasFired[keyCode] === false) {
                Keyboard.hasFired[keyCode] = true;
				Game.locked = true;

                if (Game.paused === false) {
                    Game.paused = true;
                    Screen.mapTransition('coming');
                } else {
                    Game.paused = false;
                    Screen.mapTransition('going');
                }
            }
        }
    }

};

module.exports = Keyboard;
