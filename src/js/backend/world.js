
var Map = require('./map');
var Actor = require('./actor');
var Mob = require('./mob');
var Npc = require('./npc');
var Player = require('./player');
var Tile = require('./tile');

var World = function() {
    this.map = new Map();
    this.initPlayer();
    this.initActors();
};

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

    if(this.player.interactingActor != null && state.numberReleased)
    {
        this.player.respond(state.numberPressed);
        state.numberPressed = null;
    }

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
    var loc = this.map.getLocationInDirection(player.x,player.y,player.dir);

    var actor = this.getActorAtLocation(loc.x,loc.y);

    if(actor != null)
    {
        if(actor instanceof Mob && actor.isMoving == false)
            if(actor instanceof Npc) {

                //  Prevent actor from acting
                if(!actor.isInteracting)
                    player.interactWith(actor);

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
                this.map.getTileInDirection(actor.x,actor.y,actor.dir) == this.map.getTileInDirection(mob.x,mob.y,mob.dir))
                return;
        }

        if(mob.canMove(this.map.getTileInDirection(mob.x,mob.y,dir)) 
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