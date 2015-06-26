var Equipment = Model.extend({
    defaults: {
        armor: undefined,
        weapon: undefined
    }
});

var Item = Model.extend({
    applyStats: function (character) {

    }
});


var Armor = Item.extend({

});

var Weapon = Item.extend({
    constructor: function (minDamage, maxDamage) {
        if (typeof  minDamage == 'number') {
            minDamage = {
                physical: minDamage
            }
        }
        if (minDamage) {
            this.minDamage = minDamage;
        }
        if (typeof  maxDamage == 'number') {
            maxDamage = {
                physical: maxDamage
            }
        }
        if (maxDamage) {
            this.maxDamage = maxDamage;
        }
    },
    minDamage: {
        physical: 30
    },
    maxDamage: {
        physical: 45
    },
    getAttack: function(caster_character){
        return 45;
    },
    getMinDamage: function (caster_character, target_character) {
        return this.minDamage;
    },
    getMaxDamage: function (caster_character, target_character) {
        return this.maxDamage;
    }
});