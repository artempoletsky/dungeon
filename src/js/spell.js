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

    character: undefined,

    constructor: function (character) {
        this.character = character;
        this.exp = 0;
        this.level = 1;
    },

    levelUp: function () {
        this.level++;
    },

    getAttack: function () {
        var spell = (10 + this.level) / 15;
        return Math.round(this.character.getBaseAttack() * spell);
    },
    getMinDamage: function (target_character) {
        var caster_character = this.character;
        return caster_character.equipment.prop('weapon').getMinDamage(caster_character, target_character);
    },
    getMaxDamage: function (target_character) {
        var caster_character = this.character;
        return caster_character.equipment.prop('weapon').getMaxDamage(caster_character, target_character);
    },
    computeHitChance: function (target_character, isFinal) {

        var dodge = 0;
        var defSkill = 'dodge';

        if (this.canBeDodged) {
            dodge = target_character.prop('dodge') || 0;
        }

        if (this.canBeParried) {
            var parry = target_character.prop('parry') || 0;
            if (parry > dodge) {
                dodge = parry;
                defSkill = 'parry';
            }
        }

        if(this.canBeBlocked){
            var block = target_character.prop('block') || 0;
            if (block > dodge) {
                dodge = block;
                defSkill = 'block';
            }
        }


        var attack = this.getAttack();


        if (!isFinal) {
            if (attack > 100) {
                return  attack - dodge;
            }
            return attack * (100 - dodge) / 100;
        } else {
            if (attack < 100) {
                if (rand(100) < attack) {
                    if (dodge > rand(100)) {

                        return defSkill;
                    }
                    return 'hit';
                } else {
                    return 'miss';
                }
            } else {
                if (rand(100) < attack - dodge) {
                    return 'hit';
                } else {
                    return defSkill;
                }
            }
        }


    },
    invoke: function (target_characters, callback) {

        var self=this;
        var damages=[];
        _.each(target_characters, function(char){
            var hitResult = this.computeHitChance(char, true);

            if (hitResult == 'hit') {
                damages.push(char.receiveDamage(this.getMinDamage(char), this.getMaxDamage(char), self.character, self.critChance));
            } else {
                damages.push(hitResult);
            }
        });

        this.animate(target_characters, damage, callback);
    },
    animate: function (target_characters, damages, callback) {
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
    },
    getClass: function () {
        return Class.getClass(this, Spells, 'Spell');
    },
    toJSON: function () {
        return {
            class: this.getClass()

        }
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

