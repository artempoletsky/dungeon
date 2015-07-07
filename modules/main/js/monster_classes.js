MonsterClasses.Brigand = Human.extend({
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


MonsterClasses.BrigandScout = Character.extend({
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


MonsterClasses.Beast = Character.extend({
    constructor: function (level) {
        this._super("beast", {
            maxHealth: 20,
            res_physical: 20 * level - 20,
            res_fire: 10 * level - 10
        }, {});
        this.spells = [new Spells.Bite({})];
    }
});

MonsterClasses.Spider = Character.extend({
    constructor: function (level) {
        this._super("spider", {
            maxHealth: 20,
            res_physical: 20 * level - 20,
            res_fire: 10 * level - 10
        }, {});
        this.spells = [new Spells.Bite({})];
    }
});


_.extend(MonsterParties, {
    brigands: {
        minLevel: 1,
        maxLevel: 18,
        party: ['Brigand', 'Brigand', 'BrigandScout', 'BrigandScout']
    },
    smallBeastsParty: {
        party: ['Beast', 'Beast']
    },
    smallSpidersParty: {
        party: ['Spider', 'Spider']
    },
    rat: {
        party: ['Beast']
    }
});