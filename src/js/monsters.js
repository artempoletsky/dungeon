var Brigand = Character.extend({
    constructor: function (level) {
        this._super("brigand", {
            res_physical: 20 * level - 20,
            res_fire: 10 * level - 10
        }, {
            weapon: new Weapon(level * 1)
        });
        this.spells = [Spells.hit];
    }
});


var BrigandScout = Character.extend({
    constructor: function (level) {
        this._super("brigand scout", {
            res_physical: 20 * level - 20,
            res_fire: 10 * level - 10
        }, {
            weapon: new Weapon(level * 1)
        });
        this.spells = [Spells.hit];
    }
});
