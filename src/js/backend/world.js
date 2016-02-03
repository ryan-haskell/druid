
var Actor = require('./actor');
var Player = require('./player');
var Tile = require('./tile');

const WORLD_TILES_ACROSS = 25;
const WORLD_TILES_DOWN = 25;

var World = function() {
    this.initMap();
    this.initPlayer();
    this.initActors();
};

World.prototype.TILES_ACROSS = 25;

World.prototype.initMap = function() {
    this.map = {};
    this.map.width = WORLD_TILES_ACROSS;
    this.map.height = WORLD_TILES_DOWN;

    this.map.bg = [];
    this.map.fg = [];

    this.generateRandomMap();
};

World.prototype.generateRandomMap = function(){
    var tiles = this.map.bg;

    for(y = 0; y < WORLD_TILES_DOWN; y++) {
        tiles[y] = [];
        for(x = 0; x < WORLD_TILES_ACROSS; x++) {

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