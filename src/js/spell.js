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
    canDodge: true,
    canParry: true,
    getAttack: function (caster_character) {
        return caster_character.prop('agility') * 5 + 45 + this.level * 5;
    },
    minDamage: function (caster_character, target_character) {
        return caster_character.equipment.prop('weapon').getMinDamage(caster_character, target_character);
    },
    maxDamage: function (caster_character, target_character) {
        return caster_character.equipment.prop('weapon').getMaxDamage(caster_character, target_character);
    },
    computeHitChance: function (caster_character, target_character, isFinal) {
        var dodge = 0;
        if (this.canDodge) {
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
            damage = target_character.dealDamage(this.minDamage(caster_character, target_character), this.maxDamage(caster_character, target_character), caster_character, this.critChance);
        } else {
            damage=hitResult;
        }
        this.animate(caster_character, target_character, damage, callback);
    },
    animate: function (caster_character, target_character, damage, callback) {
        var $view = $('.hit_animation');
        $view.show();
        /*var $left = $view.find('.left_character');
         var $right = $view.find('.right_character');
         var casterIndex = Battlefield.all.indexOf(caster_character);
         var targetIndex = Battlefield.all.indexOf(target_character);
         var leftChar = caster_character;
         var rightChar = target_character;
         if (casterIndex > targetIndex) {
         leftChar = target_character;
         rightChar = caster_character;
         $left.addClass('target');
         $right.addClass('caster');
         } else {
         $left.addClass('caster');
         $right.addClass('target');
         }
         $left.addClass(leftChar.name);
         $right.addClass(rightChar.name);*/


        $view.find('.damage').html(damage.damage.physical);


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
        constructor: function (minDamage, maxDamage) {
            this.minDamage = minDamage;
            this.maxDamage = maxDamage;
        },
        minDamage: 0,
        maxDamage: 0,
        getMinDamage: function () {
            return this.minDamage;
        },
        getMaxDamage: function () {
            return this.maxDamage;
        },
        canParry: false
    }),
    Projectile: Spell.extend({
        cost: 4,
        posFrom: [3, 4],
        posTo: [2, 3, 4],
        name: 'proj',
        canParry: false
    })
};


Spells.MagicSpell = Spells.Bite.extend({
    name: 'fireball'
});

