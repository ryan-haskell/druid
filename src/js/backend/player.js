var Mob = require('./mob'); 

var Player = function() {
    Mob.call(this, 0, 0);
};

Player.prototype = Object.create(Mob.prototype);
Player.prototype.constructor = Player;

Player.prototype.interactWith = function(npc) {

    //  Set NPC and player interaction mode
    this.interactingActor = npc;
    npc.isInteracting = true;

    npc.printDialogue();

}

Player.prototype.respond = function(numberPressed) {

    //  If the player has responded:
    if(numberPressed != null)
    {
        var npc = this.interactingActor;
        npc.dialogue.respond(numberPressed-1);
        npc.printDialogue();
    }
}

module.exports = Player;