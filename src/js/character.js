var Character = Model.extend({
    size: 1,
    statsBase: undefined,
    equipment: undefined,
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
        }
    },
    defaults: {
        speedBack: 1,
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
        maxAP: 12,
        apPerTurn: 5
    },

    constructor: function (name, base_stats) {
        this._super();
        this.prop(base_stats);
        this.statsBase = base_stats;
        this.spells = [];
        this.statuses = [];
        this.name = name;
        this.reset();
    },
    getBaseAttack: function () {
        var attrCap = Character.ATTRIBUTE_CAP;
        var agility = (this.prop('agility') / attrCap) * 0.6+ 0.4;
        var perception = (this.prop('perception') / attrCap) * 0.25 + 0.75;
        var weapon = this.equipment.prop('weapon');
        var weaponModifier;
        if (weapon) {
            weaponModifier = weapon.getAttackModifier(this);
        } else {
            weaponModifier = 1;
        }

        return Math.round(Character.ATTACK_CAP * agility * perception * weaponModifier);
    },
    invokeSpell: function (spell_id, target_character, callback) {
        this.propAdd('actionPoints', -this.spells[spell_id].cost);
        this.spells[spell_id].invoke(this, target_character, callback);
    },
    reset: function () {
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
    dealDamage: function (damageMin, damageMax, caster, critChance) {

        var self = this;

        var critMult = 1;
        if (critChance / 100 > Math.random()) {
            critMult = 2;
        }

        var damageRandomMod= Math.random();


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

Character.ATTACK_CAP = 150;
Character.ATTRIBUTE_CAP = 15;

Model.prototype.propAdd = function (name, value) {
    this.prop(name, this.prop(name) + value);
};

Model.prototype.propMult = function (name, value) {
    this.prop(name, this.prop(name) * value);
};

var Human = Character.extend({
    constructor: function (name, base_stats, equipment) {
        this._super(name, base_stats);
        this.equipment = new Equipment(equipment);
    },
    reset: function () {
        this.prop('maxHealth', this.prop('strength') * 5 + 10);
        this.prop('dodge',  this.prop('agility') * 2);
        this._super();
    },
    toJSON: function(){
        return {
            name: this.name,
            attributes: this._super(),
            equipment: this.equipment.toJSON()
        }
    }
});

