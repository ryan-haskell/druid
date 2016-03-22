(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Game = require('backend/game');

document.addEventListener('DOMContentLoaded', function(event){
	new Game();
});

},{"backend/game":7}],2:[function(require,module,exports){
var Actor = function(x,y) {
    this.x = x;
    this.y = y;
};

module.exports = Actor;
},{}],3:[function(require,module,exports){
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
},{"backend/actors/actor":2}],4:[function(require,module,exports){
var Mob = require('backend/actors/mob');
var Dialogue = require('backend/dialogue');

var maleNames = ['Ryan','Scott', 'Harry', 'Nick', 'Dhruv', 'Ben', 'Steve'];
var femaleNames = ['Rebecca','Caroline', 'Jennifer', 'Elizabeth', 'Lisa', 'Elaine', 'Rosie'];

var Npc = function(x, y, dir, moveType, gender, name) {
    Mob.call(this,x,y,dir);
    this.moveType = moveType == null ? 'stand' : moveType;
    this.gender = gender == null ? 'male' : gender;
    this.setName(name);
    this.isInteracting = false;
    this.dialogue = new Dialogue(this);
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
    }
    else if (this.gender == 'male' && maleNames.length > 0)
    {
        var index = parseInt(Math.random()*maleNames.length);
        this.name = maleNames[index];
        maleNames.splice(index,1);
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

Npc.prototype.printDialogue = function(){
    
    var message = this.dialogue.getMessage();
    
    //  Temporary console dialogue
    console.log(message.text);

    for(i in message.responses)
        console.log( (parseInt(i)+1) + ': ' + message.responses[i].text);
};

module.exports = Npc;
},{"backend/actors/mob":3,"backend/dialogue":6}],5:[function(require,module,exports){
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
},{"backend/actors/mob":3}],6:[function(require,module,exports){
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

    var message = this.messages[this.position];

    if(message.route != null)
        this.position = message.route;

    return message;
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
},{}],7:[function(require,module,exports){
var World = require('backend/world/world');

var Canvas = require('canvas');
var Input = require('input');

const MS_PER_UPDATE = 1000/FPS;

var Game = function() {

    this.world = new World();
    this.canvas = new Canvas(this.world.map);
    this.input = new Input(this.canvas.canvas);
    
    this.start();
};

Game.prototype.start = function() {

    var self = this;

    setInterval(function(){
        self.step();
    },MS_PER_UPDATE);

};

Game.prototype.step = function() {

    //  1: Handle input
    var state = this.input.state;

    if(!state.click.processed)
    {
        var click = this.canvas.getTileOnCanvas(state.click.x, state.click.y);
        state.click.x = click.x;
        state.click.y = click.y;
    }

    //  2: Update world
    this.world.updateActors(state);

    //  3: Display changes
    this.canvas.redraw(this.world.getActors());
};



module.exports = Game;
},{"backend/world/world":10,"canvas":11,"input":12}],8:[function(require,module,exports){
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
},{"backend/world/tile":9}],9:[function(require,module,exports){
var Tile = function(bg, fg) {
    this.bg = bg;
    this.fg = fg;
    this.setWalkable(bg, fg);
    this.setHasSubImage(bg, fg);
};

Tile.prototype.setWalkable = function(bg, fg) {
    
    this.walkable = true;

    switch(bg) {
        case 'water':
            this.walkable = false;
            break;
        default: break;
    }

    switch(fg) {
        case 'tree':
        case 'rock':
            this.walkable = false;
            break;
        default: break;
    }
};

Tile.prototype.setHasSubImage = function(bg, fg) {

    this.sx = 0;
    this.sy = 0;
    this.hasSubImage = false;

    switch(bg) {
        case 'water':
            this.hasSubImage = true;
            break;
        default: break;
    }

};

module.exports = Tile;
},{}],10:[function(require,module,exports){
var Map = require('backend/world/map');
var Actor = require('backend/actors/actor');
var Mob = require('backend/actors/mob');
var Npc = require('backend/actors/npc');
var Player = require('backend/actors/player');
var Tile = require('backend/world/tile');

var World = function() {
    this.map = new Map();
    this.initPlayer();
    this.initActors();
};

World.prototype.initActors = function() {

    var tile = null;
    var gender;

    for(var i = 0; i < 4; i++)
    {
        tile = this.getRandomWalkableTile();
        gender = parseInt(Math.random()*2) == 0 ? 'male' : 'female';

        this.actors.push(new Npc(tile.x,tile.y,'down','wander',gender));
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

        var tile = this.map.tiles[y][x];

        if(tile.walkable && this.getActorAtLocation(x,y) == null)
            return {
                x: x, y: y
            };
    };
}

module.exports = World;
},{"backend/actors/actor":2,"backend/actors/mob":3,"backend/actors/npc":4,"backend/actors/player":5,"backend/world/map":8,"backend/world/tile":9}],11:[function(require,module,exports){
var TileImage = require('tile-image');
var Player = require('backend/actors/player');
var Npc = require('backend/actors/npc');
var Mob = require('backend/actors/mob');

const TILES_ACROSS = 16;
const TILES_DOWN = 9;

const ACTOR_DIR = 'actors/';
const BGTILE_DIR = 'bgTiles/';
const FGTILE_DIR = 'fgTiles/';

// Canvas - constructor
// @param {Map} map - map of the game world.
var Canvas = function(map){
    this.map = map;

	this.canvas = document.getElementById('canvas');
	this.ctx = canvas.getContext('2d');
    this.scale = 1;

    this.imagesLoaded = false;
	this.setCanvasDimensions();
    this.loadImages();
};

// setCanvasDimensions - adds listener for window resize, and calls resizeCanvas
Canvas.prototype.setCanvasDimensions = function() {
    var self = this;
    window.addEventListener('resize', function(){
        self.resizeCanvas()
    });
    self.resizeCanvas();
};

// loadImages - loads all images for the game.
Canvas.prototype.loadImages = function() {

    var self = this;

    var numLoaded = 0;

    TileImage.callback = function(){
        numLoaded++;
        if (numLoaded == 7)
        {
            self.imagesLoaded = true;
            self.redraw();
        }
    };

    //  Initialize images structure
    this.images = {};
    this.images.bgTiles = {};
    this.images.fgTiles = {};
    this.images.actors = {};
    this.images.actors.npcs = {};
    this.images.actors.npcs.male = {};
    this.images.actors.npcs.female = {};

    // Load actor images
    this.images.actors.player = new TileImage(ACTOR_DIR + 'player.png');
    this.images.actors.npcs.male = new TileImage(ACTOR_DIR + 'npcs/male.png');
    this.images.actors.npcs.female = new TileImage(ACTOR_DIR + 'npcs/female.png');

    // Load background tile images
    this.images.bgTiles.grass = new TileImage(BGTILE_DIR + 'grass.png');
    this.images.bgTiles.water = new TileImage(BGTILE_DIR + 'water.png');

    // Load foreground tile images
    this.images.fgTiles.tree = new TileImage(BGTILE_DIR + 'tree.png');
    this.images.fgTiles.rock = new TileImage(BGTILE_DIR + 'rock.png');

};

// resizeCanvas - resizes the canvas based on window dimensions
Canvas.prototype.resizeCanvas = function() {
    var width = (window.innerWidth);
    var height = (window.innerHeight);

    var maxScaleAcross =  parseInt(width / TILES_ACROSS);
    var maxScaleDown = parseInt(height / TILES_DOWN);

    //  Get the minimum scale for each dimension
    this.scale = (maxScaleDown < maxScaleAcross) ? maxScaleDown : maxScaleAcross;
    this.scaledTileSize = this.scale;

    this.canvas.width = TILES_ACROSS * this.scaledTileSize;
    this.canvas.height = TILES_DOWN * this.scaledTileSize;
};

// redraw - renders visible world around player
// @param {Actor[]} actors - array of all actors in game.
Canvas.prototype.redraw = function(actors) {

    if(!this.imagesLoaded || actors == null) 
        return;

    this.disableImageSmoothing();

    var tileSize = this.scaledTileSize;

    //  Get player's x and y corner of screen
    var player = actors[0];
    var playerLocation = player.getLocation(tileSize);
    var px = playerLocation.x;
    var py = playerLocation.y;

    //  Determine top left pixel on screen
    var PIXELS_ACROSS = TILES_ACROSS * tileSize;
    var PIXELS_DOWN = TILES_DOWN * tileSize;

    var leftX = (px - parseInt((PIXELS_ACROSS - tileSize)/2) + WORLD_WIDTH*tileSize) % (WORLD_WIDTH*tileSize);
    var topY = (py - parseInt((PIXELS_DOWN - tileSize)/2) + WORLD_HEIGHT*tileSize) % (WORLD_HEIGHT*tileSize);

    this.leftTileX = parseInt(leftX / tileSize);
    this.topTileY = parseInt(topY / tileSize);

    //  Determine offset of screen
    this.xOffset = leftX % tileSize;
    this.yOffset = topY % tileSize;

    //  Allow buffering of tiles on side
    var buffer = 1;

    //  Render background tiles
    var tiles = this.map.tiles;
    var worldToCanvas = [];

    for(var y = -buffer; y < TILES_DOWN + buffer; y++) {
        for(var x = -buffer; x < TILES_ACROSS + buffer; x++) {

            // Get world coordinates
            var worldY = (this.topTileY + y + WORLD_HEIGHT) % WORLD_HEIGHT;
            var worldX = (this.leftTileX + x + WORLD_WIDTH) % WORLD_WIDTH;

            // Get tile and tile image at world coordinates
            var tile = tiles[worldY][worldX];
            var bgImage = this.images.bgTiles[tile.bg].image;
            if(tile.fg != null)
                var fgImage = this.images.fgTiles[tile.fg].image;

            // TODO: Fix this sub image code for foreground tiles
            if(tile.hasSubImage)
            {
                this.ctx.drawImage(
                    bgImage, 
                    tile.sx, tile.sy, 
                    TILE_SIZE, TILE_SIZE,
                    x*tileSize - this.xOffset,
                    y*tileSize - this.yOffset,
                    tileSize, tileSize
                );

                if(tile.fg != null)
                {
                    this.ctx.drawImage(
                        fgImage,
                        x*tileSize - this.xOffset,
                        y*tileSize - this.yOffset,
                        tileSize, tileSize
                    );
                }
            }
            else {
                this.ctx.drawImage(
                    bgImage,
                    x*tileSize - this.xOffset,
                    y*tileSize - this.yOffset,
                    tileSize, tileSize
                );
                
                if(tile.fg != null)
                {
                    this.ctx.drawImage(
                        fgImage,
                        x*tileSize - this.xOffset,
                        y*tileSize - this.yOffset,
                        tileSize, tileSize
                    );
                }
            }

            if(worldToCanvas[worldY] == null)
                worldToCanvas[worldY] = [];

            worldToCanvas[worldY][worldX] = {
                x: x*tileSize - this.xOffset,
                y: y*tileSize - this.yOffset
            };

        }
    }

    this.renderActors(actors, worldToCanvas, tileSize);

};

// disableImageSmoothing - prevents pixel art from become blurred.
Canvas.prototype.disableImageSmoothing = function(){
    if(this.ctx.imageSmoothingEnabled != null)
        this.ctx.imageSmoothingEnabled = false;
    else if(this.ctx.mozImageSmoothingEnabled != null)
        this.ctx.mozImageSmoothingEnabled = false;
    else this.ctx.webkitImageSmoothingEnabled = false;
};

// renderActors - draws actors to canvas
// @param {Actor[]} actors - actors to draw on canvas.
// @param {Location[][]} worldToCanvas - mapping from actual world coordinates to canvas coordinates.
// @param {int} tileSize - size of a tile on the screen.
Canvas.prototype.renderActors = function(actors, worldToCanvas, tileSize) {
    
    var actor,canvasLoc,actorLoc,xOffset,yOffset,x,y;

    for(var i in actors)
    {
        actor = actors[i];

        if(worldToCanvas[actor.y] == null || worldToCanvas[actor.y][actor.x] == null)
            continue;

        canvasLoc = worldToCanvas[actor.y][actor.x];
        actorLoc = actor.getLocation(tileSize);
        xOffset = actor.x*tileSize - actorLoc.x;
        yOffset = actor.y*tileSize - actorLoc.y;

        x = canvasLoc.x - xOffset;
        y = canvasLoc.y - yOffset;

        this.renderActor(actor, x, y, tileSize);
    }
};

// renderActor - draws an actor at a location
// @param {Actor} actor - actor to draw on canvas.
// @param {int} x - x coordinate to draw at.
// @param {int} y - y coordinate to draw at.
// @param {int} size - size of actor.
Canvas.prototype.renderActor = function(actor, x, y, size) {
        var image = this.getImageForActor(actor);

        if(image.isSubImage != null)
        {
            this.ctx.drawImage(
                image.image,
                image.sx, image.sy,
                TILE_SIZE, TILE_SIZE,
                x,y,
                size,size
            );
        }
        else 
        {
            this.ctx.drawImage(
                image,
                x,
                y,
                size, size
            );
        }
};

// getTileOnCanvas - gets tile location given canvas coordinates
// @param {int} x - x coordinate on canvas.
// @param {int} y - y coordinate on canvas.
// @return {Location} - the location of the tile.
Canvas.prototype.getTileOnCanvas = function(x, y) {

    var tileSize = this.scaledTileSize;

    return {
        x: (this.leftTileX + parseInt((x + this.xOffset)/tileSize) + WORLD_WIDTH) % WORLD_WIDTH,
        y: (this.topTileY + parseInt((y + this.yOffset)/tileSize) + WORLD_HEIGHT) % WORLD_HEIGHT
    };
};

// getImageForActor - gets the correct image for an actor
// @param {Actor} actor - the actor to get an image for.
// @return {Image} - an object containing image and image metadata.
Canvas.prototype.getImageForActor = function(actor) {

        if(actor instanceof Mob)
        {
            // Set the correct direction
            var dir = actor.dir;
            var directionOffset = 
                (dir == 'up') ? 0 : 
                (dir == 'down') ? 1 :
                (dir == 'left') ? 2: 3;

            //  Get the correct animation frame
            var animationOffset = 0;

            if(actor.isMoving)
                animationOffset = 
                    (actor.currentSlideSteps > 0 && actor.currentSlideSteps < 6) ? 1 :
                    (actor.currentSlideSteps > 8 && actor.currentSlideSteps < 14) ? 2 : 0;

            //  Pull the correct image
            var image = this.images.actors.player.image;

            if(actor instanceof Npc)
            {
                if(actor.gender == 'female')
                    image = this.images.actors.npcs.female.image;
                else
                    image = this.images.actors.npcs.male.image;
            }

            return {
                image: image,
                isSubImage: true,
                sy: TILE_SIZE * directionOffset,
                sx: TILE_SIZE * animationOffset
            };

        }

        return this.images.actors.player.image;
};

module.exports = Canvas;
},{"backend/actors/mob":3,"backend/actors/npc":4,"backend/actors/player":5,"tile-image":13}],12:[function(require,module,exports){
var Input = function(element) {
    
    // Initialize input state
    this.initState();

    //  Add listeners to element

    var self = this;

    if(element == null)
        console.log('No element provided for Input');
    else {
        window.onkeyup = function(event){
            self.onKeyUp(event.keyCode);
        };
        window.onkeydown = function(event){
            self.onKeyDown(event.keyCode);
        };
        canvas.onmousedown = function(event){
            self.onMouseDown(event);
        }
    }
};

Input.prototype.initState = function() {
    this.state = {};

    this.state.move = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    this.state.interact = false;

    this.state.numberPressed = null;
    this.state.numberReleased = true;

    this.state.click = {};
    this.state.click.processed = true;
};

Input.prototype.onKeyDown = function(keyCode) {
    this.setKeyState(keyCode, true);
};

Input.prototype.onKeyUp = function(keyCode) {
    this.setKeyState(keyCode, false);
};

Input.prototype.onMouseDown = function(event) {
    this.state.click.processed = false;
    this.state.click.x = event.offsetX;
    this.state.click.y = event.offsetY;
};

Input.prototype.resetMouseDown = function(){
    this.state.click.processed = true;
};

Input.prototype.setKeyState = function(keyCode, value) {
    switch(keyCode) {
        case 87: case 38: // w
            this.state.move.up = value;
            return;
        case 65: case 37: // a
            this.state.move.left = value;
            return;
        case 83: case 40: // s
            this.state.move.down = value;
            return;
        case 68: case 39: // d
            this.state.move.right = value;
            return;
        case 32:
            this.state.interact = value;
            return;
        case 49: case 50: case 51:

            if(value && this.state.numberReleased)
                this.state.numberPressed = keyCode - 48;
            else {
                this.state.numberReleased = true;
            }

            return;
    }
};

module.exports = Input;
},{}],13:[function(require,module,exports){
const IMG_DIR = 'static/img/';

var TileImage = function(src){
    
    var self = this;

    this.image = new Image();
    this.image.onload = TileImage.callback;
    this.image.src = IMG_DIR + src;
};

TileImage.prototype.imageLoaded = function() {
    this.isLoaded = true;
    console.log(this.image.src + ' loaded!');
}

module.exports = TileImage;
},{}]},{},[1]);
