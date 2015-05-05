RZ.Keyboard = {
    init: function () {
        window.onkeydown = function(e) {
          RZ.Keyboard.states[e.keyCode] = true;
        };

        window.onkeyup = function(e) {
          RZ.Keyboard.states[e.keyCode] = false;
          RZ.Keyboard.hasFired[e.keyCode] = false;
        };

        var mapKey = 'SHIFT', // Pressing shift should only toggle 
            keyCode = RZ.Keyboard.codes[mapKey]; // the map once
        RZ.Keyboard.hasFired[keyCode] = false;
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
      var keyCode = RZ.Keyboard.codes[key];
      return RZ.Keyboard.states[keyCode] === true;
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
            keyCode = RZ.Keyboard.codes[mapKey];
        
        if (RZ.Keyboard.isDown(mapKey)) {

            if (RZ.Keyboard.hasFired[keyCode] === false) {
                RZ.Keyboard.hasFired[keyCode] = true;

                if (RZ.Screen.mapCanvas.style.visibility === 'hidden') {
                    RZ.Screen.mapCanvas.style.visibility = 'visible';
                    RZ.Game.paused = true;
                } else {
                    RZ.Screen.mapCanvas.style.visibility = 'hidden';
                    RZ.Game.paused = false;
                }
            } 
        }
    }

};
