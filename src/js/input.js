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
    this.state.interactReleased = true;

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

Input.prototype.setKeyState = function(keyCode, isKeyDown) {
    switch(keyCode) {
        case 87: case 38: // w and up arrow
            this.state.move.up = isKeyDown;
            return;
        case 65: case 37: // a and left arrow
            this.state.move.left = isKeyDown;
            return;
        case 83: case 40: // s and down arrow
            this.state.move.down = isKeyDown;
            return;
        case 68: case 39: // d and right arrow
            this.state.move.right = isKeyDown;
            return;
        case 32:
            this.pressOnce('interact', 'interactReleased', true, isKeyDown);
            return;
        case 49: case 50: case 51:
            this.pressOnce('numberPressed', 'numberReleased', keyCode - 48, isKeyDown);
            return;
    }
};

Input.prototype.pressOnce = function(pressed, released, value, isKeyDown) {
            if(isKeyDown && this.state[released])
                this.state[pressed] = value;
            else {
                this.state[released] = true;
            }
};

module.exports = Input;