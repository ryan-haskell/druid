var Tile = require('backend/world/tile');

var Map = function() {
    this.width = WORLD_WIDTH;
    this.height = WORLD_HEIGHT;

    this.bg = [];
    this.fg = [];

    this.generateRandomMap();
};

Map.prototype.generateRandomMap = function(){
    var tiles = this.bg;

    for(var y = 0; y < WORLD_HEIGHT; y++) {
        tiles[y] = [];
        for(var x = 0; x < WORLD_WIDTH; x++) {

            var type = (parseInt(Math.random() * 5)) ? 'grass' : 'water';

            tiles[y][x] = new Tile(type);
        }
    }


    tiles[0][0] = new Tile('grass');
    this.addWorldDetails();
    tiles[0][0] = new Tile('grass');
};

Map.prototype.addWorldDetails = function() {
    for(var y = 0; y < WORLD_HEIGHT; y++) {
        for(var x = 0; x < WORLD_WIDTH; x++) {

            var tile = this.bg[y][x];
            
            if(tile.type == 'water') 
                this.addWaterEdges(tile,x,y);
            else if(tile.type == 'grass')
                this.plantTrees(tile,x,y);

        }
    }
};

Map.prototype.addWaterEdges = function(tile,x,y) {

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
        if(neighbors[i].type == 'grass'
            || neighbors[i].type == 'tree'
            || neighbors[i].type == 'rock')
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
                    (grassDirs.right) ? 0 : 1
                :
                    (grassDirs.left) ? 2 : 3;
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

Map.prototype.plantTrees = function(tile,x,y) {

    var rand = parseInt(Math.random()*20);

    if(rand == 0)
    {
        tile.type = 'tree';
    }
    else if(rand == 1)
    {
        tile.type = 'rock';
    }
    else return;

    tile.setWalkable(tile.type);
};

Map.prototype.getTileNeighbors = function(x,y){

    var tiles = [];

    for(var i in DIRS)
        tiles.push( this.getTileInDirection(x,y,DIRS[i]) );

    return tiles;
};


Map.prototype.getTileInDirection = function(x,y,dir) {

    var bgTiles = this.bg;

    var tileLoc = this.getLocationInDirection(x,y,dir);

    return this.bg[tileLoc.y][tileLoc.x];
};

Map.prototype.getLocationInDirection = function(x,y,dir) {

    var tileX = (dir == 'left') ? x-1 : (dir == 'right') ? x + 1 : x;
    var tileY = (dir == 'up') ? y-1 : (dir == 'down') ? y + 1 : y;

    tileX = (tileX + WORLD_WIDTH) % WORLD_WIDTH;
    tileY = (tileY + WORLD_HEIGHT) % WORLD_HEIGHT;

    return {
        x: tileX,
        y: tileY
    };
};

module.exports = Map;