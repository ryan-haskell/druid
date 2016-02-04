var Mob = require('./mob');

var Npc = function(x, y, dir, moveType, gender) {
    Mob.call(this,x,y,dir);
    this.moveType = moveType == null ? 'stand' : moveType;
    this.gender = gender == null ? 'male' : gender;
    this.inDialogue = false;
};

Npc.prototype = Object.create(Mob.prototype);
Npc.prototype.constructor = Npc;

Npc.prototype.act = function(world){

    this.world = world;

    if(!this.inDialogue)
    {
        switch(this.moveType) {
            case 'stand':
                this.stand();
                break;
            case 'spin':
                this.spin();
                break;
            case 'wander':
                this.spin();
                this.walk();
                break;
            default:
                return;
        }
    }
};

Npc.prototype.stand = function() {
    //  Do nothing for now...
};

Npc.prototype.spin = function() {
    
    var dirs = ['up', 'down', 'left', 'right'];
    var rand = parseInt(Math.random()*20*FPS);

    if(rand < 4)
    {
        this.dir = dirs[rand];
    }
};

Npc.prototype.walk = function() {
    
    var rand = parseInt(Math.random()*5*FPS);

    if(rand < 1)
    {
        this.world.moveMob(this,this.dir);
    }
};

module.exports = Npc;