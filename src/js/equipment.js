var Equipment = Model.extend({
    constructor: function(data){
        this._super(_.mapValues(data, function(itemData){
            if(itemData.id){
                return Equipment.get(itemData.id, itemData.mod);
            }else {
                return Equipment.get(itemData);
            }

        }))
    },
    defaults: {
        armor: undefined,
        weapon: undefined
    }
});


Equipment.get = function (id, mod) {
    var data = _.clone(Misc[id]);
    _.extend(data, mod);
    var item = new MiscClasses[data.class](data);
    item.id=id;
    return item;
};

var MiscClasses = {};

MiscClasses.Item = Class.extend({
    constructor: function (data) {
        this.data = data;
    },
    id: undefined,
    toJSON: function () {
        return {
            id: this.id
        }
    }
});

MiscClasses.Weapon = MiscClasses.Item.extend({
    getAttackModifier: function (caster_character) {
        var strength = caster_character.prop('strength');
        var sn = this.data.strengthNeeded;
        var aMod = this.data.attackModifier;
        if (strength >= sn) {
            return aMod;
        }
        var result;
        var penaltyPerPoint = 0.1;
        result = aMod - penaltyPerPoint * (sn - strength);
        return result;
    },
    onHitEffects: {},
    computeHitEffects: function () {

    },
    getMinDamage: function (caster_character, target_character) {
        return this.data.minDamage;
    },
    getMaxDamage: function (caster_character, target_character) {
        return this.data.maxDamage;
    }
});

MiscClasses.Weapon.OnHit = {};

var Misc = {};
