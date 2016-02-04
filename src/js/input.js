
var Input = function(element) {
    
    // Initialize input state
    this.initState();

    //  Add listeners to element

    var self = this;

    if(element == null)
        console.log('No element provided for Input');
    else {
        window.onkeyup = function(event){
            self.onKeyUp(event.keyCode);
        };
        window.onkeydown = function(event){
            self.onKeyDown(event.keyCode);
        };
    }
};

Input.prototype.initState = function() {
    this.state = {};

    this.state.move = {
        up: false,
        down: false,
        left: false,
        right: false
    };

};

Input.prototype.onKeyDown = function(keyCode) {
    this.setKeyState(keyCode, true);
};

Input.prototype.onKeyUp = function(keyCode) {
    this.setKeyState(keyCode, false);
};

Input.prototype.setKeyState = function(keyCode, value) {
    switch(keyCode) {
        case 87: case 38: // w
            this.state.move.up = value;
            return;
        case 65: case 37: // a
            this.state.move.left = value;
            return;
        case 83: case 40: // s
            this.state.move.down = value;
            return;
        case 68: case 39: // d
            this.state.move.right = value;
            return;
    }
};

module.exports = Input;