var World = require('./world');

var Canvas = require('../canvas');
var Input = require('../input');

const FPS = 30;
const MS_PER_UPDATE = 1000/FPS;

var Game = function() {

    this.world = new World();
    this.canvas = new Canvas(this.world.map);
    this.input = new Input(this.canvas.canvas);
    
    this.start();
};

Game.prototype.start = function() {

    var self = this;

    setInterval(function(){
        self.step();
    },MS_PER_UPDATE);

};

Game.prototype.step = function() {

    //  1: Handle input
    var state = this.input.state;

    //  2: Update world
    this.attemptPlayerMove(state);

    //  3: Display changes
    this.canvas.redraw(this.world.getActors());
};

Game.prototype.attemptPlayerMove = function(state) {
    var move = state.move;

    for(i in move)
    {
        if(move[i] == true)
        {
            this.world.movePlayer(i);
            return;
        }
    }
};

module.exports = Game;