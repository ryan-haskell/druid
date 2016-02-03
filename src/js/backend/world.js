
var Actor = require('./actor');
var Player = require('./player');
var Tile = require('./tile');

var World = function() {
    this.initMap();
    this.initPlayer();
    this.initActors();
};

World.prototype.TILES_ACROSS = 25;

World.prototype.initMap = function() {
    this.map = {};
    this.map.width = WORLD_WIDTH;
    this.map.height = WORLD_HEIGHT;

    this.map.bg = [];
    this.map.fg = [];

    this.generateRandomMap();
};

World.prototype.generateRandomMap = function(){
    var tiles = this.map.bg;

    for(y = 0; y < WORLD_HEIGHT; y++) {
        tiles[y] = [];
        for(x = 0; x < WORLD_WIDTH; x++) {

            var type = (parseInt(Math.random() * 2)) ? 'grass' : 'water';

            tiles[y][x] = new Tile(type);
        }
    }
};

World.prototype.initActors = function() {
    this.actors.push(new Actor(1,2));
    this.actors.push(new Actor(3,4));
};

World.prototype.initPlayer = function() {
    this.actors = [];
    this.actors[0] = new Player();
    this.player = this.actors[0];
};

World.prototype.getActors = function() {
    return this.actors;
};

World.prototype.movePlayer = function(direction) {
    var player = this.player;

    if(!player.isMoving)
    {
        if(player.canMove(direction))
            player.slide(direction);
    }
};

module.exports = World;