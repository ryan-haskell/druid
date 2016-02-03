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