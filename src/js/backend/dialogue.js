var Dialogue = function(npc) {

    this.position = 0;

    this.messages = [
        {
            text: 'Hi, I\'m ' + npc.name + '! Nice to meet you, ' + PLAYER_NAME,
            responses: [
                {
                    text: 'Hi, ' + npc.name + '! Nice to meet you!',
                    route: 1
                },
                {
                    text: npc.name + ' is a terrible name!',
                    route: 2
                }
            ]
        },
        {
            text: 'It\'s nice meeting you too!',
            route: 3
        },
        {
            text: '['+npc.name+' is busy crying]'
        },
        {
            text: 'Have a great day, '+ PLAYER_NAME + '!'
        }
    ];

};

Dialogue.prototype.getMessage = function(){
    return this.messages[this.position];
};

Dialogue.prototype.respond = function(responseIndex) {

    var message = this.messages[this.position];

    //  If there are no responses
    if(message.responses == null)
    {
        //  And there is a route to follow
        if(message.route != null)
            this.position = message.route
    }

    //  If response is valid
    if(responseIndex != null && message.responses != null && responseIndex < message.responses.length)
        this.position = message.responses[responseIndex].route;
}

module.exports = Dialogue;