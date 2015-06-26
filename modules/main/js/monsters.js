var MapCellMonster = MapCell.extend({
    constructor: function (cell) {
        this._super(cell);
        this.monstersParty = this.getMonstersParty(Dungeon.dungeonLevel);
        this.className = 'monster';
        //this.monstersParty = dungeon.dungeonLevel;
    },
    getMonstersParty: function (level) {
        var variants = _.compact(_.map(MapCellMonster.monsters, function (obj) {
            if (!obj.minLevel || level >= obj.minLevel) {
                if (!obj.maxLevel || level <= obj.maxLevel) {
                    return obj;
                }
            }
        }));
        if (!variants.length) {
            throw "Can't create monster cell";
        }

        return _.map(variants[rand(variants.length)].party, function (ClassName) {
            return new ClassName(level);
        });

    },
    monstersParty: undefined,
    enter: function () {
        this.className = this.type;
        Dungeon.pauseKeyboardEvents = true;
        Dungeon.$el.hide();
        Battlefield.one('endFight', function (e) {
            Dungeon.$el.show();
            Dungeon.pauseKeyboardEvents = false;
            console.log(e);
        });
        Battlefield.fight(Dungeon.playerParty, this.monstersParty);
    }
});

Dungeon.mapObjects['1'].push(MapCellMonster);

var Brigand = Character.extend({
    constructor: function (level) {
        this._super("brigand", {
            res_physical: 20 * level,
            res_fire: 10 * level - 10
        }, {
            weapon: new Weapon(10 + level * 3, 15 + Math.round(level * 5))
        });
        this.spells = [Spells.hit, Spells.throwDagger];
    }
});


var BrigandScout = Character.extend({
    constructor: function (level) {
        this._super("brigand_scout", {
            res_physical: 20 * level - 20,
            res_fire: 10 * level - 10
        }, {
            weapon: new Weapon(10 + level * 3, 15 + Math.round(level * 5))
        });
        this.spells = [Spells.hit];
    }
});


MapCellMonster.monsters = {
    brigands: {
        minLevel: 1,
        maxLevel: 18,
        party: [Brigand, Brigand, BrigandScout, BrigandScout]
    },
    example: {
        minLevel: 100
    }
};