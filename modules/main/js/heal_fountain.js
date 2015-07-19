MapCellClasses.HealFountain = MapCell.extend({
    constructor: function (cell) {
        this._super(cell);
        this.className = 'heal_fountain';
    },
    enter: function () {
        _.each(Player.party, function(char){
            char.heal();
        });
    }
});

DungeonTypes.default.mapObjects.push({
    rarity: 3,
    object: 'HealFountain'
});


