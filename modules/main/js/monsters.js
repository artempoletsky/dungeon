MapCellClasses.Monster = MapCell.extend({
    constructor: function (cell) {
        this._super(cell);
        this.monstersParty = this.getMonstersParty(this.dungeonLevel || 1);
        this.className = 'monster';
        //this.monstersParty = dungeon.dungeonLevel;
    },
    getMonstersParty: function (level) {
        var variants = _.compact(_.map(MapCellClasses.Monster.monsters, function (obj) {
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
        var className = Dungeon.map.backgroundClassName;
        $('body').addClass(className);
        Battlefield.one('endFight', function (e) {
            Dungeon.$el.show();
            Dungeon.pauseKeyboardEvents = false;
            $('body').removeClass(className);
        });
        Battlefield.fight(Dungeon.playerParty, this.monstersParty);
    }
});


DungeonGenerator.mapObjects['1'].push('Monster');

var Brigand = Human.extend({
    constructor: function (level) {
        this._super("brigand", {
            strength: 5 + level * 1,
            agility: 5 + level * 1,
            res_physical: 20 * level,
            res_fire: 10 * level - 10
        }, {
            weapon: new Weapon(10 + level * 3, 15 + Math.round(level * 5))
        });
        this.spells = [new Spells.Bite(20, 30), new Spells.MagicSpell(20, 30)];
    }
});


var BrigandScout = Character.extend({
    constructor: function (level) {
        this._super("brigand_scout", {
            maxHealth: 20,
            res_physical: 20 * level - 20,
            res_fire: 10 * level - 10
        }, {
            weapon: new Weapon(10 + level * 3, 15 + Math.round(level * 5))
        });
        this.spells = [new Spells.Projectile()];
    }
});


MapCellClasses.Monster.monsters = {
    brigands: {
        minLevel: 1,
        maxLevel: 18,
        party: [Brigand, Brigand, BrigandScout, BrigandScout]
    },
    example: {
        minLevel: 100
    }
};