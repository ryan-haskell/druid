var Tile = function(type) {
    this.type = type;
    this.setWalkable(type);
    this.setHasSubImage(type);
};

Tile.prototype.setWalkable = function(type) {
    switch(type) {
        case 'grass':
            this.walkable = true;
            break;
        default:
            this.walkable = false;
            break;
    }
};

Tile.prototype.setHasSubImage = function(type) {

    this.sx = 0;
    this.sy = 0;

    switch(type) {
        case 'water':
            this.hasSubImage = true;
            break;
        default:
            this.hasSubImage = false;
            break;
    }

};

module.exports = Tile;