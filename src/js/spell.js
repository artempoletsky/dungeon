var Spell = Class.extend({
    accuracyMod: 0,
    crit: 0,
    range: 1,
    cost: 3,
    name: 'hit',
    description: 'spell_desc_hit',
    targetEnemy: true,

    aoe: false,
    posFrom: [1, 2],
    posTo: [1, 2],

    minDamage: function (caster_character, target_character) {
        //debugger;
        return caster_character.equipment.prop('weapon').getMinDamage(caster_character, target_character);
    },
    maxDamage: function (caster_character, target_character) {
        return caster_character.equipment.prop('weapon').getMaxDamage(caster_character, target_character);
    },
    invoke: function (caster_character, target_character, callback) {
        var damage = target_character.dealDamage(this.minDamage(caster_character, target_character), this.maxDamage(caster_character, target_character), caster_character);

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
    hit: Spell.create({}),
    throwDagger: Spell.create({
        cost: 4,
        posFrom: [3, 4],
        posTo: [2, 3, 4],
        name: 'throw_dagger'
    })
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

