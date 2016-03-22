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