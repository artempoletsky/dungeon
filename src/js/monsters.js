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
        this.spells = [Spells.hit, Spells.throwDagger];
    }
});
