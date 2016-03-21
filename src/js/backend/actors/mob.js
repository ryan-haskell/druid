var Actor = require('backend/actors/actor');

const MS_PER_UPDATE = 200;

var Mob = function(x,y,dir) {
    
    Actor.call(this,x,y);

    this.dir = (dir == null) ? 'down':dir; 
    this.moveSpeed = 10;
    this.isMoving = false;
    this.totalSlideSteps = TILE_SIZE;
    this.currentSlideSteps = 0;
};

Mob.prototype = Object.create(Actor.prototype);
Mob.prototype.constructor = Mob;

Mob.prototype.canMove = function(tile) {
    return tile.walkable;
};


Mob.prototype.slide = function(dir) {

    this.isMoving = true;
    var self = this;

    setTimeout(function(){
        self.slideStep(dir);
        },MS_PER_UPDATE/this.moveSpeed);

};

Mob.prototype.slideStep = function(dir) {

    //  Update position in world
    this.currentSlideSteps += 1;

    //  Check for animation completion
    if(this.currentSlideSteps < this.totalSlideSteps)
    {
        var self = this;
        setTimeout(function(){
            self.slideStep(dir);
        },MS_PER_UPDATE/this.moveSpeed);
    }
    else {

        var dx = (dir == 'left') ? -1 : (dir == 'right') ? 1 : 0;
        var dy = (dir == 'up') ? -1 : (dir == 'down') ? 1 : 0; 

        this.x = (this.x + dx + WORLD_WIDTH) % WORLD_WIDTH;
        this.y = (this.y + dy + WORLD_HEIGHT) % WORLD_HEIGHT;

        this.currentSlideSteps = 0;
        this.isMoving = false;
    }

};

// Returns an object containing the coordinates of a player, given a scaled tile size
Mob.prototype.getLocation = function(tileSize) {
    var dir = this.dir;
    var slideOffset = parseInt(tileSize * this.currentSlideSteps / this.totalSlideSteps);

    var dx = (dir == 'left') ? -slideOffset : (dir == 'right') ? slideOffset : 0;
    var dy = (dir == 'up') ? -slideOffset : (dir == 'down') ? slideOffset : 0;

    return {
        x: (this.x*tileSize) + dx,
        y: (this.y*tileSize) + dy
    };
}

module.exports = Mob;