var Spell = Class.extend({
    accuracyMod: 0,
    critChance: 0,
    range: 1,
    cost: 3,
    name: 'hit',
    description: 'spell_desc_hit',
    targetEnemy: true,

    aoe: false,
    posFrom: [1, 2],
    posTo: [1, 2],
    level: 1,
    maxLevel: 5,
    canBeDodged: true,
    canBeParried: true,
    canBeBlocked: true,
    availableForPlayer: true,

    getAttack: function (caster_character) {
        var spell = (10 + this.level) / 15;
        return Math.round(caster_character.getBaseAttack()*spell);
    },
    getMinDamage: function (caster_character, target_character) {
        return caster_character.equipment.prop('weapon').getMinDamage(caster_character, target_character);
    },
    getMaxDamage: function (caster_character, target_character) {
        return caster_character.equipment.prop('weapon').getMaxDamage(caster_character, target_character);
    },
    computeHitChance: function (caster_character, target_character, isFinal) {
        var dodge = 0;
        if (this.canBeDodged) {
            dodge = target_character.prop('dodge') || 0;
        }
        var isParry = false;
        if (this.canParry) {
            var parry = target_character.prop('parry') || 0;
            if (parry > dodge) {
                dodge = parry;
                isParry = true;
            }
        }

        var attack = this.getAttack(caster_character);


        if (!isFinal) {
            if (attack > 100) {
                return  attack - dodge;
            }
            return attack * (100 - dodge) / 100;
        } else {
            if (attack < 100) {
                if (rand(100) < attack) {
                    if (dodge > rand(100)) {

                        return isParry ? 'parry' : 'dodge';
                    }
                    return 'hit';
                } else {
                    return 'miss';
                }
            } else {
                if (rand(100) < attack - dodge) {
                    return 'hit';
                } else {
                    return isParry ? 'parry' : 'dodge';
                }
            }
        }


    },
    invoke: function (caster_character, target_character, callback) {
        var hitResult = this.computeHitChance(caster_character, target_character, true);
        var damage;

        if (hitResult == 'hit') {
            damage = target_character.dealDamage(this.getMinDamage(caster_character, target_character), this.getMaxDamage(caster_character, target_character), caster_character, this.critChance);
        } else {
            damage = hitResult;
        }
        this.animate(caster_character, target_character, damage, callback);
    },
    animate: function (caster_character, target_character, damage, callback) {
        var $view = $('.hit_animation');
        $view.show();

        if (damage.damage) {
            damage = damage.damage.physical;
        }

        $view.find('.damage').html(damage);


        setTimeout(function () {
            /*$left.removeClass('caster target ' + leftChar.name);
             $right.removeClass('caster target ' + rightChar.name);*/
            $view.hide();
            setTimeout(callback, 500);
        }, 1000);
    }
});



var Spells = {
    Hit: Spell.extend({}),
    Bite: Spell.extend({
        availableForPlayer: false,
        constructor: function (minDamage, maxDamage) {
            this.minDamage = minDamage;
            this.maxDamage = maxDamage;
        },
        minDamage: 0,
        maxDamage: 0,
        attack: 90,
        getAttack: function () {
            return this.attack;
        },
        getMinDamage: function () {
            return {physical: this.minDamage};
        },
        getMaxDamage: function () {
            return {physical: this.maxDamage};
        },
        canParry: false
    }),
    Projectile: Spell.extend({
        cost: 4,
        posFrom: [3, 4],
        posTo: [2, 3, 4],
        name: 'proj',
        canBeParried: false
    })
};


Spells.MagicSpell = Spells.Bite.extend({
    posFrom: [3, 4],
    posTo: [1, 2],
    name: 'fireball'
});

