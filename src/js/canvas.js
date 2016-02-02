const TILES_ACROSS = 16;
const TILES_DOWN = 9;
const TILE_SIZE = 25;

var Canvas = function(){
	this.canvas = document.getElementById('canvas');
	this.ctx = canvas.getContext('2d');

	this.setCanvasDimensions();
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

    this.redraw();
};

Canvas.prototype.redraw = function() {
    this.ctx.fillStyle = '#096';
    for(y = 0; y < TILES_DOWN; y++)
        for(x = 0; x < TILES_ACROSS + 1; x++)
            if((x+y)%2)
            this.ctx.fillRect(
                this.tileWidth*x - (this.tileWidth/2),
                this.tileWidth*y,
                this.tileWidth, this.tileWidth);
}

module.exports = Canvas;