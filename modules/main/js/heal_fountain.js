MapCellClasses.HealFountain = MapCell.extend({
    constructor: function (cell) {
        this._super(cell);
        this.className = 'heal_fountain';
    },
    enter: function () {
        Player.party.each(function(char){
            char.heal();
        });
    }
});

DungeonTypes.default.mapObjects.push({
    rarity: 3,
    object: 'HealFountain'
});


