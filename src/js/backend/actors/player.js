var Mob = require('backend/actors/mob'); 

var Player = function() {
    Mob.call(this, 0, 0);
};

Player.prototype = Object.create(Mob.prototype);
Player.prototype.constructor = Player;

Player.prototype.interactWith = function(npc) {

    //  Set NPC and player interaction mode
    this.interactingActor = npc;
    npc.isInteracting = true;

    //npc.printDialogue();

};

Player.prototype.isInteracting = function(){
    return this.interactingActor;
};

Player.prototype.respond = function(numberPressed) {

    var npc = this.interactingActor;

    if(numberPressed != null)
    {
        npc.dialogue.respond(numberPressed-1);
    }

    npc.printDialogue();
}

module.exports = Player;