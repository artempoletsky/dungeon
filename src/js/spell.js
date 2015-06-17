var Spell = Class.extend({
    accuracyMod: 0,
    crit: 0,
    range: 1,
    cost: 3,
    name: 'hit',
    description: 'spell_desc_hit',

    minDamage: function (caster_character, target_character) {
        //debugger;
        return caster_character.equipment.prop('weapon').getMinDamage(caster_character, target_character);
    },
    maxDamage: function (caster_character, target_character) {
        return caster_character.equipment.prop('weapon').getMaxDamage(caster_character, target_character);
    },
    invoke: function (caster_character, target_character, callback) {
        target_character.dealDamage(this.minDamage(caster_character, target_character), this.maxDamage(caster_character, target_character), caster_character);
        //animate than
        setTimeout(callback, 1000);
    }
});


var Spells = {
    hit: Spell.create({})
};


Spells.fireball = Spell.create({
    name: 'fireball',
    description: 'spell_desc_fireball',

    computeDamage: function (caster_character, target_character) {
        return {
            fire: '20-30'
        }
    }
});

