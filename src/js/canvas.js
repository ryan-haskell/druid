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
        if (numLoaded == 5)
        {
            self.imagesLoaded = true;
            self.redraw();
        }
    };

    //  Initialize images structure
    this.images = {};
    this.images.actors = {};
    this.images.bgTiles = {};
    this.images.actors.npcs = {};
    this.images.actors.npcs.female = {};

    // Load actor images
    this.images.actors.player = new TileImage(ACTOR_DIR + 'player.png');
    this.images.actors.npcs.female = new TileImage(ACTOR_DIR + 'npcs/female.png');

    // Load background tile images
    this.images.bgTiles.grass = new TileImage(BGTILE_DIR + 'grass.png');
    this.images.bgTiles.tree = new TileImage(BGTILE_DIR + 'tree.png');
    this.images.bgTiles.water = new TileImage(BGTILE_DIR + 'water.png');

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
    var bgTiles = this.map.bg;
    var worldToCanvas = [];

    for(var y = -buffer; y < TILES_DOWN + buffer; y++) {
        for(var x = -buffer; x < TILES_ACROSS + buffer; x++) {

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