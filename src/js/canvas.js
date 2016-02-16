var TileImage = require('./tile-image');
var Player = require('./backend/player');
var Npc = require('./backend/npc');

const TILES_ACROSS = 32;
const TILES_DOWN = 18;

const ACTOR_DIR = 'actors/';
const BGTILE_DIR = 'bgTiles/';
const FGTILE_DIR = 'fgTiles/';

var Canvas = function(map){

    this.map = map;

	this.canvas = document.getElementById('canvas');
	this.ctx = canvas.getContext('2d');
    this.scale = 1;

    this.imagesLoaded = false;
	this.setCanvasDimensions();
    this.loadImages();
};

Canvas.prototype.setCanvasDimensions = function() {
    var self = this;
    window.addEventListener('resize', function(){
        self.resizeCanvas()
    });
    self.resizeCanvas();
};

Canvas.prototype.resizeCanvas = function() {
    var width = (window.innerWidth);
    var height = (window.innerHeight);

    var maxScaleAcross =  parseInt(width / TILES_ACROSS / TILE_SIZE);
    var maxScaleDown = parseInt(height / TILES_DOWN / TILE_SIZE);

    //  Get the minimum scale for each dimension
    this.scale = (maxScaleDown < maxScaleAcross) ? maxScaleDown : maxScaleAcross;
    this.scaledTileSize = this.scale * TILE_SIZE;

    this.canvas.width = TILES_ACROSS * this.scaledTileSize;
    this.canvas.height = TILES_DOWN * this.scaledTileSize;
};

Canvas.prototype.redraw = function(actors) {

    if(!this.imagesLoaded || actors == null) 
        return;

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;


    var tileSize = this.scaledTileSize;

    //  Get player's x and y corner of screen
    var playerLocation = actors[0].getLocation(tileSize);
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
    var bgTiles = this.map.bg;
    var worldToCanvas = [];

    for(var y = -buffer; y < TILES_DOWN + buffer; y++) {
        for(var x = -buffer; x < TILES_ACROSS + buffer; x++) { //  TODO: Fix TA + 1 to allow noneven tileacross values

            var worldY = (this.topTileY + y + WORLD_HEIGHT) % WORLD_HEIGHT;
            var worldX = (this.leftTileX + x + WORLD_WIDTH) % WORLD_WIDTH;

            var tile = bgTiles[worldY][worldX];

            var image = this.images.bgTiles[tile.type].image;

            if(tile.hasSubImage)
            {
                this.ctx.drawImage(
                    image, 
                    tile.sx, tile.sy, 
                    TILE_SIZE, TILE_SIZE,
                    x*tileSize - this.xOffset,
                    y*tileSize - this.yOffset,
                    tileSize, tileSize
                );
            }
            else {
                this.ctx.drawImage(
                    image,
                    x*tileSize - this.xOffset,
                    y*tileSize - this.yOffset,
                    tileSize, tileSize
                );
            }

            if(worldToCanvas[worldY] == null)
                worldToCanvas[worldY] = [];

            worldToCanvas[worldY][worldX] = {
                x: x*tileSize - this.xOffset,
                y: y*tileSize - this.yOffset
            };

        }
    }

    this.renderActors(actors, worldToCanvas,tileSize);

};

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

Canvas.prototype.renderActor = function(actor, x, y, tileSize) {
        var image = this.getImageForActor(actor);

        if(image.isSubImage != null)
        {
            this.ctx.drawImage(
                image.image,
                image.sx, image.sy,
                TILE_SIZE, TILE_SIZE,
                x,y,
                tileSize,tileSize
            );
        }
        else 
        {
            this.ctx.drawImage(
                image,
                x,
                y,
                tileSize, tileSize
            );
        }
};

Canvas.prototype.getTileOnCanvas = function(x, y) {

    var tileSize = this.scaledTileSize;

    return {
        x: (this.leftTileX + parseInt((x + this.xOffset)/tileSize) + WORLD_WIDTH) % WORLD_WIDTH,
        y: (this.topTileY + parseInt((y + this.yOffset)/tileSize) + WORLD_HEIGHT) % WORLD_HEIGHT
    };
};

Canvas.prototype.getImageForActor = function(actor) {

        if(actor instanceof Npc) 
        {
            if(actor.gender == 'female')
                return this.images.actors.npcs.female[actor.dir].image;
        }
        else if(actor instanceof Player)
        {
            var animationOffset = 0;

            var dir = actor.dir;
            var directionOffset = 
                (dir == 'up') ? 0 : 
                (dir == 'down') ? 1 :
                (dir == 'left') ? 2: 3;


            if(actor.isMoving)
                animationOffset = 
                    (actor.currentSlideSteps > 0 && actor.currentSlideSteps < 6) ? 1 :
                    (actor.currentSlideSteps > 8 && actor.currentSlideSteps < 14) ? 2 : 0;

            return {
                image: this.images.actors.player[actor.dir].image,
                isSubImage: true,
                sy: TILE_SIZE * directionOffset,
                sx: TILE_SIZE * animationOffset
            };

        }

        return this.images.actors.player.image;
};

Canvas.prototype.loadImages = function() {

    var self = this;

    this.images = {};
    this.images.actors = {};
    this.images.bgTiles = {};

    var numLoaded = 0;

    TileImage.callback = function(){
        numLoaded++;
        if (numLoaded == 8)
        {
            self.imagesLoaded = true;
            self.redraw();
        }
    }

    this.images.actors.npcs = {};
    this.images.actors.npcs.female = {};

    for(i in DIRS)
    {
        this.images.actors.player = new TileImage(ACTOR_DIR + 'player.png');
        this.images.actors.npcs.female[DIRS[i]] = new TileImage(ACTOR_DIR + 'npcs/female/'+DIRS[i]+'.png');
    }

    this.images.bgTiles.grass = new TileImage(BGTILE_DIR + 'grass.png');
    this.images.bgTiles.tree = new TileImage(BGTILE_DIR + 'tree.png');
    this.images.bgTiles.water = new TileImage(BGTILE_DIR + 'water.png');

};

module.exports = Canvas;