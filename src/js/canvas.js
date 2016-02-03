var TileImage = require('./tile-image');

const TILES_ACROSS = 16;
const TILES_DOWN = 9;
const TILE_SIZE = 15;

const ACTOR_DIR = 'actors/';
const BGTILE_DIR = 'bgTiles/';
const FGTILE_DIR = 'fgTiles/';

var Canvas = function(map){

    this.map = map;

	this.canvas = document.getElementById('canvas');
	this.ctx = canvas.getContext('2d');

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
    var tall = (width / TILES_ACROSS < height / TILES_DOWN);

    var min = tall ? width : height;

    //  guarantees that the size of a tile is an integer value
    min = parseInt(min / TILE_SIZE) * TILE_SIZE;

    if(tall)    //  limited by width
    {
        min = parseInt(min / TILES_ACROSS) * TILES_ACROSS;
        this.canvas.width = min;
        this.canvas.height = parseInt( min / TILES_ACROSS) * TILES_DOWN;
        this.tileSize = min / TILES_ACROSS;
    }
    else
    {
        min = parseInt(min / TILES_DOWN) * TILES_DOWN;
        this.canvas.height = min;
        this.canvas.width = parseInt( min / TILES_DOWN) * TILES_ACROSS;
        this.tileSize = min / TILES_DOWN;
    }

};

Canvas.prototype.redraw = function(actors) {

    if(!this.imagesLoaded || actors == null) return;

    this.ctx.imageSmoothingEnabled = false;

    var tileSize = this.tileSize;
    var worldWidth = this.map.width;
    var worldHeight = this.map.height;

    var xOffset = TILES_ACROSS % 2 == 0 ? parseInt(tileSize/2) : 0;
    var yOffset = TILES_DOWN % 2 == 0 ? parseInt(tileSize/2) : 0;
    var PIXELS_ACROSS = TILES_ACROSS*tileSize + xOffset;
    var PIXELS_DOWN = TILES_DOWN*tileSize + yOffset;

    //  Get top left corner of screen
    var player = actors[0];
    var leftX = player.x - parseInt(PIXELS_ACROSS/2);
    var topY = player.y - parseInt(PIXELS_DOWN/2);

    //  Render background tiles
    var bgTiles = this.map.bg;

    for(y = topY; y < PIXELS_DOWN; y+=tileSize) {
        for(x = leftX; x < PIXELS_ACROSS; x+=tileSize) {

            var indexY = (parseInt(y/tileSize) + worldHeight) % worldHeight;
            var indexX = (parseInt(x/tileSize) + worldWidth) % worldWidth;

            var tile = bgTiles[indexY][indexX];

            var image = this.images.bgTiles[tile.type].image;

            this.ctx.drawImage(
                image,
                x - xOffset,
                y - yOffset,
                this.tileSize, this.tileSize
            );

        }
    }

    this.ctx.drawImage(
        this.images.actors.player.image,
        tileSize * parseInt(TILES_ACROSS/2) - parseInt(tileSize/2),
        tileSize * parseInt(TILES_DOWN/2),
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
        if (numLoaded == 3)
        {
            self.imagesLoaded = true;
            self.redraw();
        }
    }

    this.images.actors.player = new TileImage(ACTOR_DIR + 'player/front.png');

    this.images.bgTiles.grass = new TileImage(BGTILE_DIR + 'grass.png');
    this.images.bgTiles.water = new TileImage(BGTILE_DIR + 'water.png');

};

module.exports = Canvas;