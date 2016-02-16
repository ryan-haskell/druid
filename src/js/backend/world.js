
var Actor = require('./actor');
var Mob = require('./mob');
var Npc = require('./npc');
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

    tiles[0][0] = new Tile('grass');

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
        if(neighbors[i].type == 'grass' || neighbors[i].type == 'tree')
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

    var tile = null;

    for(var i = 0; i < 4; i++)
    {
        tile = this.getRandomWalkableTile();
        this.actors.push(new Npc(tile.x,tile.y,'down','wander','female'));
    }

};

World.prototype.initPlayer = function() {
    this.actors = [];
    this.actors[0] = new Player();
    this.player = this.actors[0];
};

World.prototype.getActors = function() {
    return this.actors;
};


World.prototype.updateActors = function(state) {
    
    if(!state.click.processed)
    {
        state.click.processed = true;
        this.getTileInfo(state.click.x, state.click.y);
    }

    this.attemptPlayerMove(state);

    if(state.interact)
        this.attemptPlayerInteract();


    // Let npcs act
    for(var i in this.actors)
    {
        var actor = this.actors[i];

        if(actor instanceof Npc)
            actor.act(this);
    }
};

World.prototype.getTileInfo = function(x,y) {

    var actor = this.getActorAtLocation(x,y);

    if(actor != null) {
        if(actor instanceof Npc)
            console.log(actor.name);
    };

};

World.prototype.attemptPlayerMove = function(state) {
    var move = state.move;
    var player = this.player;

    for(i in move)
    {
        if(move[i] == true)
        {
            //  Free interacting actor on move
            if(player.interactingActor != null) {
                player.interactingActor.isInteracting = false;
                player.interactingActor = null;
            }

            this.movePlayer(i);
            return;
        }
    }
};

World.prototype.attemptPlayerInteract = function() {

    var player = this.player;
    var loc = this.getLocationInDirection(player.x,player.y,player.dir);

    var actor = this.getActorAtLocation(loc.x,loc.y);

    if(actor != null)
    {
        if(actor instanceof Mob && actor.isMoving == false)
            if(actor instanceof Npc) {

                //  Prevent actor from acting
                if(!actor.isInteracting)
                {
                    player.interactingActor = actor;
                    actor.isInteracting = true;
                }

                actor.dir = (player.dir == 'up') ? 'down' :
                            (player.dir == 'down') ? 'up':
                            (player.dir == 'left') ?'right' : 'left';

            }

    }
};

World.prototype.movePlayer = function(dir) {
    var player = this.player;

    this.moveMob(player,dir);
};

World.prototype.moveMob = function(mob,dir) {

    if(!mob.isMoving)
    {
        mob.dir = dir;

        var x = (dir == 'left') ? mob.x-1 : (dir == 'right') ? mob.x + 1 : mob.x;
        var y = (dir == 'up') ? mob.y-1 : (dir == 'down') ? mob.y + 1 : mob.y;

        x = (x + WORLD_WIDTH) % WORLD_WIDTH;
        y = (y + WORLD_HEIGHT) % WORLD_HEIGHT;

        //  Check if another actor is currently moving to that tile
        var actor;

        for(var i in this.actors)
        {
            actor = this.actors[i];

            if(actor.isMoving && 
                this.getTileInDirection(actor.x,actor.y,actor.dir) == this.getTileInDirection(mob.x,mob.y,mob.dir))
                return;
        }

        if(mob.canMove(this.getTileInDirection(mob.x,mob.y,dir)) 
            && this.getActorAtLocation(x,y) == null)
            mob.slide(dir);
    }
};

World.prototype.getActorAtLocation = function(x,y) {
    
    for(var i in this.actors)
    {
        var actor = this.actors[i];

        if(actor.x == x && actor.y == y)
            return actor;
    }

    return null;
};

World.prototype.getTileInDirection = function(x,y,dir) {

    var bgTiles = this.map.bg;

    var tileLoc = this.getLocationInDirection(x,y,dir);

    return this.map.bg[tileLoc.y][tileLoc.x];
};

World.prototype.getLocationInDirection = function(x,y,dir) {

    var tileX = (dir == 'left') ? x-1 : (dir == 'right') ? x + 1 : x;
    var tileY = (dir == 'up') ? y-1 : (dir == 'down') ? y + 1 : y;

    tileX = (tileX + WORLD_WIDTH) % WORLD_WIDTH;
    tileY = (tileY + WORLD_HEIGHT) % WORLD_HEIGHT;

    return {
        x: tileX,
        y: tileY
    };
}

World.prototype.getTileNeighbors = function(x,y){

    var tiles = [];

    for(var i in DIRS)
        tiles.push( this.getTileInDirection(x,y,DIRS[i]) );

    return tiles;
};

World.prototype.getRandomWalkableTile = function() {

    var maxAttempts = 50;

    for(var i = 0; i < maxAttempts; i++) {

        var x = parseInt(Math.random()*WORLD_WIDTH);
        var y = parseInt(Math.random()*WORLD_HEIGHT);

        var tile = this.map.bg[y][x];

        if(tile.walkable && this.getActorAtLocation(x,y) == null)
            return {
                x: x, y: y
            };
    };
}

module.exports = World;