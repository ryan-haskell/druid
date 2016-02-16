
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
        canvas.onmousedown = function(event){
            self.onMouseDown(event);
        }
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

    this.state.interact = false;

    this.state.numberPressed = null;
    this.state.numberReleased = true;

    this.state.click = {};
    this.state.click.processed = true;
};

Input.prototype.onKeyDown = function(keyCode) {
    this.setKeyState(keyCode, true);
};

Input.prototype.onKeyUp = function(keyCode) {
    this.setKeyState(keyCode, false);
};

Input.prototype.onMouseDown = function(event) {
    this.state.click.processed = false;
    this.state.click.x = event.offsetX;
    this.state.click.y = event.offsetY;
};

Input.prototype.resetMouseDown = function(){
    this.state.click.processed = true;
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
        case 32:
            this.state.interact = value;
            return;
        case 49: case 50: case 51:

            if(value && this.state.numberReleased)
                this.state.numberPressed = keyCode - 48;
            else {
                this.state.numberReleased = true;
            }

            return;
    }
};

module.exports = Input;