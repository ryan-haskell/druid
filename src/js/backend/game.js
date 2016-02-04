var World = require('./world');

var Canvas = require('../canvas');
var Input = require('../input');

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
    this.world.updateActors(state);

    //  3: Display changes
    this.canvas.redraw(this.world.getActors());
};



module.exports = Game;