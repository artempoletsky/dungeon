var Skill = Model.extend({
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

    canBeDodged: true,
    canBeParried: true,
    canBeBlocked: true,
    availableForPlayer: true,

    character: undefined,

    computeds: {
        expBar: {
            deps: ['exp'],
            get: function (exp) {
                return Math.round(exp) + '%';
            }
        }
    },

    constructor: function (character) {
        this._super();

        if (!(character instanceof Character)) {
            throw new TypeError('Character for spell is not defined');
        }
        this.character = character;


        this.prop({
            exp: 0,
            level: 1
        });
    },

    addExp: function (chance, isSuccess, value) {
        if (chance >= 1) {
            return;
        }

        var defaultExp = 20;
        var mult = 2;
        var failMult = 0.1;
        if (!value) {
            value = defaultExp;
        }

        value = (1 - chance) * value * mult;

        if (!isSuccess) {
            value = value * failMult;
        }

        var exp = this.prop('exp');
        var level = this.prop('level');
        exp += value;

        if (exp >= 100) {
            if (level < Game.config.SKILL_LEVEL_CAP) {
                exp -= 100;
                this.prop('level', ++level);
                this.character.addExp(1);
            } else {
                exp = 100;
            }
        }
        console.log('exp: '+value+' '+exp);
        this.prop('exp', exp);

    },

    getAttackMod: function () {
        var min = 0.9;
        var max = 1.5;
        return (this.prop('level') / Game.config.SKILL_LEVEL_CAP) * (max - min) + min;
    },

    getAttack: function () {
        return Math.round(this.character.getBaseAttack() * this.getAttackMod());
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


        var d = target_character.getDefence(this);

        var defence = d.result;
        var defSkill = d.defSkill;


        var attack = this.getAttack();


        if (!isFinal) {
            if (attack > 100) {
                return  attack - defence;
            }
            return attack * (100 - defence) / 100;
        } else {
            if (attack < 100) {
                if (rand(100) < attack) {
                    if (defence > rand(100)) {
                        return defSkill;
                    }
                    return 'hit';
                } else {
                    return 'miss';
                }
            } else {
                if (rand(100) < attack - defence) {
                    return 'hit';
                } else {
                    return defSkill;
                }
            }
        }


    },

    subtractAP: function () {
        this.character.propAdd('actionPoints', -this.cost);
    },
    invoke: function (target_characters, callback) {

        if (!target_characters.length) {
            throw  new TypeError('target_characters must be an array');
        }
        this.subtractAP();
        var self = this;
        var damages = [];

        _.each(target_characters, function (char) {
            var hitResult = self.computeHitChance(char, true);
            if (hitResult == 'hit') {
                damages.push(char.receiveDamage(self.getMinDamage(char), self.getMaxDamage(char), self.character, self.critChance));
            } else {
                damages.push(hitResult);
            }
            self.addExp(self.computeHitChance(char, false)/100, hitResult == 'hit');
        });


        this.animate(target_characters, damages, callback);
    },
    animate: function (target_characters, damages, callback) {
        var $view = $('.hit_animation');
        $view.show();

        ///todo implement

        /*
         if (damage.damage) {
         damage = damage.damage.physical;
         }

         $view.find('.damage').html(damage);*/


        setTimeout(function () {
            /*$left.removeClass('caster target ' + leftChar.name);
             $right.removeClass('caster target ' + rightChar.name);*/
            $view.hide();
            setTimeout(callback, 500);
        }, 1000);
    },
    getClass: function () {
        return Class.getClass(this, Skills, 'Skill');
    },
    toJSON: function () {
        return {
            class: this.getClass()

        }
    }
});

Skill.fromJSON = function (data, characrer) {
    var spell = new Skills[data.class](characrer);
    return spell;
};


var Skills = {
    Hit: Skill.extend({}),
    Bite: Skill.extend({
        availableForPlayer: false,
        constructor: function (character, minDamage, maxDamage) {
            this._super(character);
            this.minDamage = minDamage;
            this.maxDamage = maxDamage;
        },
        minDamage: 0,
        maxDamage: 0,
        attack: 70,
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
    Projectile: Skill.extend({
        cost: 4,
        posFrom: [3, 4],
        posTo: [2, 3, 4],
        name: 'proj',
        canBeParried: false
    })
};


Skills.MagicSpell = Skills.Bite.extend({
    posFrom: [3, 4],
    posTo: [1, 2],
    name: 'fireball'
});

