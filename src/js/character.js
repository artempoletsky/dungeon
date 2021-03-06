var Character = Model.extend({
    size: 1,
    statsBase: undefined,
    statuses: undefined,
    spells: undefined,
    name: undefined,
    enemy: true,
    ai: stupid,
    lastUsedSpell: undefined,

    computeds: {
        healthBar: {
            deps: ['maxHealth', 'health'],
            get: function (maxHealth, health) {
                return  Math.round(health * 100 / maxHealth) + '%';
            }
        },
        expProgress: {
            deps: ['exp'],
            get: function (exp) {
                return (exp * 10) + '%'
            }
        }
    },
    defaults: {
        speedBack: 1,
        level: 1,
        exp: 0,
        speedForward: 2,
        maxHealth: 100,
        health: 100,
        res_physical: 0,
        pen_physical: 0,
        res_fire: 0,
        pen_fire: 0,
        initiative: 1,
        actionPoints: 10,
        startAP: 8,
        dodge: 0,
        maxAP: 12,
        apPerTurn: 5,
        attributesPoints: 0,
        skillPoints: 0
    },


    addExp: function (value) {
        var exp = this.prop('exp');
        exp += value;
        if (exp >= 10) {
            exp -= 10;
            this.level++;
            this.attributesPoints++;
            this.skillPoints++;
        }

        this.prop('exp', exp);
    },

    getDefence: function (spell) {
        var result = 0;
        var defSkill = 'dodge';
        if (!spell||spell.canBeDodged) {
            result = this.prop('dodge') || 0;
        }

        if (!spell||spell.canBeParried) {
            var parry = this.prop('parry') || 0;
            if (parry > result) {
                result = parry;
                defSkill = 'parry';
            }
        }

        if (!spell||spell.canBeBlocked) {
            var block = this.prop('block') || 0;
            if (block > result) {
                result = block;
                defSkill = 'block';
            }
        }
        return {
            defSkill: defSkill,
            result: result
        }
    },

    constructor: function (name, base_stats) {
        this._super();
        this.prop(base_stats);
        this.statsBase = base_stats;
        this.spells = [];
        this.statuses = [];
        this.name = name;
        this.prop('name', name);
        this.prop('health', this.prop('maxHealth'));
    },

    enoughAP: function (spell_id) {
        return this.spells[spell_id].cost <= this.prop('actionPoints');
    },
    _computeDamageOneType: function (value, resist, penetration) {
        var resist = resist * (1 - penetration / 100);
        return value * (1 - resist / 100);
    },
    computeDamage: function (damage, caster) {

        var totalDamage = 0;
        var self = this;
        _.each(damage, function (value, damage_type) {
            totalDamage += self._computeDamageOneType(value, self.prop('res_' + damage_type), caster.prop('pen_' + damage_type));
        });
        return Math.round(totalDamage);
    },
    propMods: {},
    addMod: function (key, fn) {
        if (!this.propMods[key]) {
            this.propMods[key] = [];
        }
        this.propMods[key].push(fn);
    },
    prop: function (key, value) {
        if (arguments.length === 1 && typeof key === 'string' && this.propMods[key]) {
            var self = this;
            return _.foldl(this.propMods[key], function (result, fn) {
                return fn.call(self, result);
            }, this._super(key))
        } else {
            return Model.prototype.prop.apply(this, arguments);
        }

    },
    heal: function (value) {
        var health = this.prop('health');
        var maxHealth = this.prop('maxHealth');
        if (!value) {
            value = maxHealth - health;
        }

        this.prop('health', Math.min(health + value, maxHealth));
        this.fire('heal', value);
    },
    receiveDamage: function (damageMin, damageMax, caster, critChance) {

        var self = this;

        var critMult = 1;
        if (critChance / 100 > Math.random()) {
            critMult = 2;
        }

        var damageRandomMod = Math.random();


        var totalDamage = {};

        var health = self.prop('health');

        _.each(damageMin, function (value, damage_type) {
            var res = self.prop('res_' + damage_type);
            var pen = caster.prop('pen_' + damage_type);

            var min = self._computeDamageOneType(value, res, pen);
            var max = self._computeDamageOneType(damageMax[damage_type], res, pen);


            var damage = min + (max - min) * damageRandomMod;

            damage = Math.round(damage * critMult);


            totalDamage[damage_type] = damage;

            health -= damage;
        });

        self.prop('health', health);

        var damageEvent = {
            damage: totalDamage,
            crit: critMult != 1
        };
        self.fire('damage', damageEvent);
        return damageEvent;
    }
});



var Human = Character.extend({
    getBaseAttack: function () {
        var agWeight = 0.5;
        var perceptionWeight = 0.25;
        var attrCap = Game.config.ATTRIBUTE_CAP;
        var agility = (this.prop('agility') / attrCap) * agWeight + (1 - agWeight);
        var perception = (this.prop('perception') / attrCap) * perceptionWeight + (1 - perceptionWeight);
        var weapon = this.equipment.prop('weapon');
        var weaponModifier;
        if (weapon) {
            weaponModifier = weapon.getAttackModifier(this);
        } else {
            weaponModifier = 1;
        }

        return Math.round(Game.config.ATTACK_CAP * agility * perception * weaponModifier);
    },
    equipment: undefined,
    constructor: function (name, base_stats, equipment) {
        this.computeds = _.extend({}, this.computeds, {
            maxHealth: {
                deps: ['strength'],
                get: function (strength) {
                    return  strength * 5 + 10;
                }
            },
            dodge: {
                deps: ['agility'],
                get: function (agility) {
                    return  agility * 2;
                }
            },
            //'apPerTurn', 'maxAP', 'startAP'
            startAP: {
                deps: ['speed', 'perception'],
                get: function (speed, perception) {
                    return  Math.round((speed + perception) / 2);
                }
            },
            apPerTurn: {
                deps: ['speed'],
                get: function (speed) {
                    return  speed;
                }
            },
            maxAP: {
                deps: ['strength'],
                get: function (strength) {
                    return  strength * 2;
                }
            },
            initiative: {
                deps: ['speed', 'perception'],
                get: function (speed, perception) {
                    return  Math.round((speed + perception) / 2);
                }
            }
        });
        _.each(this.computeds, function (obj, name) {
            delete  base_stats[name];
        });
        //console.log(base_stats);
        this._super(name, base_stats);
        this.equipment = new Equipment(equipment);
    },
    toJSON: function () {
        return {
            name: this.name,
            attributes: this._super(),
            equipment: this.equipment.toJSON(),
            spells: this.spells
        }
    }
});

Human.fromJSON = function (data) {


    var result = new Human(data.name, data.attributes, data.equipment);

    result.spells = _.map(data.spells, function (obj) {
        return Skill.fromJSON(obj, result);
    });

    return result;
};

