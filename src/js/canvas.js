var Canvas = function(){
	this.canvas = document.getElementById('canvas');
	this.ctx = canvas.getContext('2d');

	this.setCanvasDimensions();
};

Canvas.prototype.setCanvasDimensions = function() {
    var self = this;
    window.addEventListener('resize', self.resizeCanvas);
    self.resizeCanvas();
};

Canvas.prototype.resizeCanvas = function() {
    var width = (window.innerWidth) - 50;
    var height = (window.innerHeight) - 50;
    var tall = (width / 16 < height / 9);

    var min = tall ? width : height;

    if(tall)
    {
        this.canvas.width = min;
        this.canvas.height = parseInt( (min / 16) * 9);
    }
    else
    {
        this.canvas.height = min;
        this.canvas.width = parseInt( (min / 9) * 16);
    }


};

module.exports = Canvas;