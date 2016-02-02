var TileImage = require('./tile-image');

const TILES_ACROSS = 16;
const TILES_DOWN = 9;
const TILE_SIZE = 15;

const ACTOR_DIR = 'actors/';
const BGTILE_DIR = 'bgTiles/';
const FGTILE_DIR = 'fgTiles/';

var Canvas = function(){
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
    var min = parseInt(min/TILE_SIZE) * TILE_SIZE;

    if(tall)
    {
        this.canvas.width = min;
        this.canvas.height = parseInt( (min / TILES_ACROSS) * TILES_DOWN);
        this.tileWidth = min / TILES_ACROSS;
    }
    else
    {
        this.canvas.height = min;
        this.canvas.width = parseInt( (min / TILES_DOWN) * TILES_ACROSS);
        this.tileWidth = min / TILES_DOWN;
    }

    if(this.imagesLoaded)
        this.redraw();

};

Canvas.prototype.redraw = function() {

    this.ctx.imageSmoothingEnabled = false;

    this.ctx.fillStyle = '#096';
    
    for(y = 0; y < TILES_DOWN; y++) {
        for(x = 0; x < TILES_ACROSS + 1; x++) {

            var grass = parseInt(Math.random() * 2);

            var image = grass == 1 ? this.images.bgTiles.grass.image : this.images.bgTiles.water.image;

            this.ctx.drawImage(
                image,
                this.tileWidth*x - (this.tileWidth/2),
                this.tileWidth*y,
                this.tileWidth, this.tileWidth);

        }
    }

    this.ctx.drawImage(
        this.images.actors.player.image,
        this.tileWidth * parseInt(TILES_ACROSS/2) - (this.tileWidth/2),
        this.tileWidth * parseInt(TILES_DOWN/2),
        this.tileWidth, this.tileWidth
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