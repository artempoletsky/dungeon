MonsterClasses.Brigand = Human.extend({
    constructor: function (level) {
        this._super("brigand", {
            strength: 5 + level * 1,
            agility: 5 + level * 1,
            res_physical: 20 * level,
            res_fire: 10 * level - 10
        }, {
            weapon: 'rusty_sword'
        });
        this.spells = [new Skills.Bite(this, 20, 30), new Skills.MagicSpell(this, 20, 30)];
    }
});


MonsterClasses.BrigandScout = Character.extend({
    constructor: function (level) {
        this._super("brigand_scout", {
            maxHealth: 20,
            res_physical: 20 * level - 20,
            res_fire: 10 * level - 10
        }, {
            weapon: 'rusty_sword'
        });
        this.spells = [new Skills.Projectile(this)];
    }
});


MonsterClasses.Beast = Character.extend({
    constructor: function (level) {
        this._super("beast", {
            maxHealth: 20,
            res_physical: 20 * level - 20,
            res_fire: 10 * level - 10
        }, {});
        this.spells = [new Skills.Bite(this, 5, 10)];
    }
});

MonsterClasses.Spider = Character.extend({
    constructor: function (level) {
        this._super("spider", {
            maxHealth: 20,
            res_physical: 20 * level - 20,
            res_fire: 10 * level - 10
        }, {});
        this.spells = [new Skills.Bite(this, 5, 10)];
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