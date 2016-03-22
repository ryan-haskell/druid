var Tile = require('backend/world/tile');

var Map = function() {
    this.width = WORLD_WIDTH;
    this.height = WORLD_HEIGHT;

    this.tiles = [];

    this.generateLandMap();
};

// Land terrain generation
Map.prototype.generateLandMap = function(){

    //  Fill world with grass
    for(var y = 0; y < WORLD_HEIGHT; y++)
    {
        this.tiles[y] = [];
        for(var x = 0; x < WORLD_WIDTH; x++)
        {
            var bg = 'grass';
            var fg = null;

            this.tiles[y][x] = new Tile(bg, fg);
        }
    }

    //  Plant forests
    this.plantForests(2);
    this.plantLakes(.5);
    this.setSpawnArea();
    this.addWorldDetails();

};

Map.prototype.plantForests = function(forestPercentage) {

    this.plant(forestPercentage, null, 'tree');

};

Map.prototype.plantLakes = function(lakePercentage) {

    this.plant(lakePercentage, 'water', null);

};

Map.prototype.setSpawnArea = function(){

    this.randomlySpread('grass', null, [{ x: 0, y: 0 }], 75, 1);

}

Map.prototype.plant = function(percentage, bg, fg) {

    var numSeeds = parseInt(percentage*WORLD_WIDTH*WORLD_HEIGHT/100) + 1;

    for(var i = 0; i < numSeeds; i++)
    {
        var location = {
            x: parseInt(Math.random()*WORLD_WIDTH),
            y: parseInt(Math.random()*WORLD_HEIGHT)
        };

        this.randomlySpread(bg, fg, [location], 75, 1);
    }
}

Map.prototype.randomlySpread = function(bg, fg, locationQueue, spread, spreadReduction) {

    while(locationQueue.length > 0)
    {
        var loc = locationQueue.shift();

        bg = (bg == null) ? this.tiles[loc.y][loc.x].bg : bg;
        this.tiles[loc.y][loc.x] = new Tile(bg, fg);

        for(var dir in DIRS)
        {
            // 20% chance that 
            var willSpread = parseInt(Math.random()*100);

            if(willSpread < spread)
            {
                locationQueue.push(this.getLocationInDirection(loc.x, loc.y, DIRS[dir]));
            }
        }

        spread -= spreadReduction;

    }
};

Map.prototype.addWorldDetails = function() {
    for(var y = 0; y < WORLD_HEIGHT; y++) {
        for(var x = 0; x < WORLD_WIDTH; x++) {

            var tile = this.tiles[y][x];
            
            if(tile.bg == 'water') 
                this.addWaterEdges(tile,x,y);

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
        if(neighbors[i].bg == 'grass')
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

Map.prototype.getTileNeighbors = function(x,y){

    var tiles = [];

    for(var i in DIRS)
        tiles.push( this.getTileInDirection(x,y,DIRS[i]) );

    return tiles;
};

Map.prototype.getTileInDirection = function(x,y,dir) {

    var tileLoc = this.getLocationInDirection(x,y,dir);

    return this.tiles[tileLoc.y][tileLoc.x];
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