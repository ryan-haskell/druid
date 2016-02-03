var Tile = function(type) {
    this.type = type;
    this.setWalkable(type);
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

module.exports = Tile;