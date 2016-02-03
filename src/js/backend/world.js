
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

    for(var y = 0; y < WORLD_HEIGHT; y++) {
        tiles[y] = [];
        for(var x = 0; x < WORLD_WIDTH; x++) {

            var type = (parseInt(Math.random() * 3)) ? 'grass' : 'water';

            tiles[y][x] = new Tile(type);
        }
    }

    this.addWorldDetails();
};

World.prototype.addWorldDetails = function() {


    for(var y = 0; y < WORLD_HEIGHT; y++) {
        for(var x = 0; x < WORLD_WIDTH; x++) {

            var tile = this.map.bg[y][x];
            
            if(tile.type == 'water') 
                this.addWaterEdges(tile,x,y);
            else if(tile.type == 'grass')
                this.plantTrees(tile,x,y);

        }
    }
};

World.prototype.addWaterEdges = function(tile,x,y) {

    var dirs = ['up','down','left','right'];
    var neighbors = this.getTileNeighbors(x,y);
    var numSides = 0;

    var grassDirs = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    for(var i in neighbors) {
        if(neighbors[i].type == 'grass')
        {
            numSides++;
            grassDirs[dirs[i]] = true;
        }
    }

    if(numSides == 1)
    {
        tile.sx = 1;

        tile.sy = 
            (grassDirs.up) ? 0:
            (grassDirs.down) ? 1:
            (grassDirs.left) ? 2:3;
    }
    else if(numSides == 2) 
    {
        if(grassDirs.up && grassDirs.down)
        {
            tile.sx = 0; 
            tile.sy = 2;
        }
        else if(grassDirs.left && grassDirs.right)
        {
            tile.sx = 0; 
            tile.sy = 3;
        }
        else
        {
            tile.sx = 2;

            tile.sy = //  I know I shouldn't be, but I'm proud of this monster.
                (grassDirs.up) ? 
                    (grassDirs.right) ? 0:1
                :
                    (grassDirs.left) ? 2:3;
        }
    }
    else if(numSides == 3)
    {
        tile.sx = 3;

        tile.sy =
            (!grassDirs.up) ? 0:
            (!grassDirs.down) ? 1:
            (!grassDirs.left) ? 2:3;
    }
    else if(numSides == 4)
    {
        tile.sy = 1;
    }


    tile.sx *= TILE_SIZE;
    tile.sy *= TILE_SIZE;
};

World.prototype.plantTrees = function(tile,x,y) {

    var rand = parseInt(Math.random()*10);

    if(rand == 0)
    {
        tile.type = 'tree';
        tile.setWalkable(tile.type);
    }

}

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
        player.dir = direction;

        if(player.canMove(this.getTileInDirection(player.x,player.y,direction)))
            player.slide(direction);
    }
};

World.prototype.getTileInDirection = function(x,y,dir) {

    var bgTiles = this.map.bg;

    var tileX = (dir == 'left') ? x-1 : (dir == 'right') ? x + 1 : x;
    var tileY = (dir == 'up') ? y-1 : (dir == 'down') ? y + 1 : y;

    tileX = (tileX + WORLD_WIDTH) % WORLD_WIDTH;
    tileY = (tileY + WORLD_HEIGHT) % WORLD_HEIGHT;

    return this.map.bg[tileY][tileX];
};

World.prototype.getTileNeighbors = function(x,y){

    var dirs = ['up','down','left','right'];
    var tiles = [];

    for(var i in dirs)
        tiles.push( this.getTileInDirection(x,y,dirs[i]) );

    return tiles;
};

module.exports = World;