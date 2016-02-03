var TileImage = require('./tile-image');

const TILES_ACROSS = 15;
const TILES_DOWN = 9;

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

    var leftTileX = parseInt(leftX / tileSize);
    var topTileY = parseInt(topY / tileSize);

    //  Determine offset of screen
    var xOffset = leftX % tileSize;
    var yOffset = topY % tileSize;

    //  Allow buffering of tiles on side
    var buffer = 1;

    //  Render background tiles
    var bgTiles = this.map.bg;

    for(var y = -buffer; y < TILES_DOWN + buffer; y++) {
        for(var x = -buffer; x < TILES_ACROSS + buffer; x++) { //  TODO: Fix TA + 1 to allow noneven tileacross values

            var worldY = (topTileY + y + WORLD_HEIGHT) % WORLD_HEIGHT;
            var worldX = (leftTileX + x + WORLD_WIDTH) % WORLD_WIDTH;

            var tile = bgTiles[worldY][worldX];

            var image = this.images.bgTiles[tile.type].image;

            if(tile.hasSubImage)
            {
                this.ctx.drawImage(
                    image, 
                    tile.sx, tile.sy, 
                    TILE_SIZE, TILE_SIZE,
                    x*tileSize - xOffset,
                    y*tileSize - yOffset,
                    tileSize, tileSize
                );
            }
            else {
                this.ctx.drawImage(
                    image,
                    x*tileSize - xOffset,
                    y*tileSize - yOffset,
                    tileSize, tileSize
                );
            }

        }
    }

    this.ctx.drawImage(
        this.images.actors.player[actors[0].dir].image,
        parseInt((PIXELS_ACROSS - tileSize)/2),
        parseInt((PIXELS_DOWN - tileSize)/2),
        tileSize, tileSize
    );

}

Canvas.prototype.loadImages = function() {

    var self = this;

    this.images = {};
    this.images.actors = {};
    this.images.bgTiles = {};

    var numLoaded = 0;

    TileImage.callback = function(){
        numLoaded++;
        if (numLoaded == 6)
        {
            self.imagesLoaded = true;
            self.redraw();
        }
    }

    this.images.actors.player = {}

    var dirs = ['up','down','left','right'];

    for(i in dirs)
        this.images.actors.player[dirs[i]] = new TileImage(ACTOR_DIR + 'player/'+dirs[i]+'.png');

    this.images.bgTiles.grass = new TileImage(BGTILE_DIR + 'grass.png');
    this.images.bgTiles.water = new TileImage(BGTILE_DIR + 'water.png');

};

module.exports = Canvas;