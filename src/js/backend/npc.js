var Mob = require('./mob');

var femaleNames = ['Rebecca','Caroline', 'Jennifer', 'Elizabeth', 'Lisa', 'Elaine', 'Rosie'];

var Npc = function(x, y, dir, moveType, gender, name) {
    Mob.call(this,x,y,dir);
    this.moveType = moveType == null ? 'stand' : moveType;
    this.gender = gender == null ? 'male' : gender;
    this.setName(name);
    this.isInteracting = false;
};

Npc.prototype = Object.create(Mob.prototype);
Npc.prototype.constructor = Npc;


Npc.prototype.setName = function(name){
    if(name != null)
        this.name = name;
    else if (this.gender == 'female' && femaleNames.length > 0)
    {
        var index = parseInt(Math.random()*femaleNames.length);
        this.name = femaleNames[index];
        femaleNames.splice(index,1);
        console.log(femaleNames);
    }
};

Npc.prototype.act = function(world){

    if(!this.isInteracting)
    {
        switch(this.moveType) {
            case 'stand':
                break;
            case 'spin':
                this.spin();
                break;
            case 'wander':
                this.spin();
                this.walk(world);
                break;
            default:
                return;
        }
    }
};

Npc.prototype.spin = function() {
    
    if(!this.isMoving)
    {
        var dirs = ['up', 'down', 'left', 'right'];
        var rand = parseInt(Math.random()*5*FPS);

        if(rand < 4)
        {
            this.dir = dirs[rand];
        }
    }
};

Npc.prototype.walk = function(world) {
    
    var rand = parseInt(Math.random()*3*FPS);

    if(rand < 1)
    {
        world.moveMob(this,this.dir);
    }
};

module.exports = Npc;