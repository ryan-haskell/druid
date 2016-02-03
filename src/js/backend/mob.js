var Actor = require('./actor');

const MS_PER_UPDATE = 10;

var Mob = function(x,y,dir) {
    
    Actor.call(this,x,y);

    this.dir = (dir == null) ? 'down':dir; 
    this.isMoving = false;
};

Mob.prototype = Object.create(Actor.prototype);
Mob.prototype.constructor = Mob;

Mob.prototype.canMove = function(tile) {
    return true;
};

Mob.prototype.slide = function(dir) {
    this.dir = dir;
    this.isMoving = true;
    this.slideDistance = 15;                //  TODO: FIX MAGIC NUMBER
    var self = this;

    setTimeout(function(){
        self.slideStep(dir);
    },MS_PER_UPDATE);

};

Mob.prototype.slideStep = function(dir) {
    
    const STEP_SIZE = 1;

    //  Update position in world
    this.slideDistance -= STEP_SIZE;

    var dx = (dir == 'left') ? -STEP_SIZE : (dir == 'right') ? STEP_SIZE : 0;
    var dy = (dir == 'up') ? -STEP_SIZE : (dir == 'down') ? STEP_SIZE : 0; 

    this.x = this.x + dx;
    this.y = this.y + dy;

    console.log('[' + this.x + ', ' + this.y + ']');

    //  Check for animation completion
    if(this.slideDistance > 0)
    {
        var self = this;
        setTimeout(function(){
            self.slideStep(dir);
        },MS_PER_UPDATE);
    }
    else this.isMoving = false;
};

module.exports = Mob;