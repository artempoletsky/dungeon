var Equipment = Model.extend({
    defaults: {
        armor: undefined,
        weapon: undefined
    }
});

var Item = Model.extend({
    width: 1,
    height: 1,
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
    attackModifier: 1,
    strengthNeeded: 5,
    getAttackModifier: function (caster_character) {
        var strength = caster_character.prop('strength');
        if (strength >= this.strengthNeeded) {
            return this.attackModifier;
        }
        var result;
        var penaltyPerPoint = 0.1;
        result = this.attackModifier - penaltyPerPoint * (this.strengthNeeded - strength);
        return result;
    },
    getMinDamage: function (caster_character, target_character) {
        return this.minDamage;
    },
    getMaxDamage: function (caster_character, target_character) {
        return this.maxDamage;
    }
});