MapCellClasses.Monster = MapCell.extend({
    constructor: function (cell) {
        this._super(cell);
        if (cell.data && cell.data.party) {
            var classes = MonsterParties[cell.data.party];
            if (!classes) {
                throw  'cell.data.party is wrong. "' + cell.data.party + '" expected';
            }
            this.monstersParty = this.makeParty(classes, this.dungeonLevel);
        } else {
            this.monstersParty = this.getMonstersParty(this.dungeonLevel || 1);
        }

        this.className = 'monster';
        //this.monstersParty = dungeon.dungeonLevel;
    },
    getMonstersParty: function (level) {
        var variants = _.compact(_.map(MonsterParties, function (obj) {
            if (!obj.minLevel || level >= obj.minLevel) {
                if (!obj.maxLevel || level <= obj.maxLevel) {
                    return obj;
                }
            }
        }));
        if (!variants.length) {
            throw "Can't create monster cell";
        }

        return this.makeParty(variants[rand(variants.length)].party, level);
    },
    monstersParty: undefined,
    makeParty: function (namesArray, level) {
        return _.map(namesArray, function (ClassName) {
            return new MonsterClasses[ClassName](level);
        });
    },
    enter: function () {
        return;
        this.className = this.type;
        Dungeon.pauseKeyboardEvents = true;
        Dungeon.$el.hide();
        var className = Dungeon.map.backgroundClassName;

        Battlefield.one('endFight', function (e) {
            Dungeon.$el.show();
            Dungeon.pauseKeyboardEvents = false;
        });

        Battlefield.fight(Dungeon.playerParty, this.monstersParty, className);
    }
});


DungeonGenerator.mapObjects['1'].push('Monster');

var MonsterClasses = {};

var MonsterParties = {};

Game.ready(function () {
    //check all monster classes exists
    _.each(MonsterParties, function (obj) {
        _.each(obj.party, function (className) {
            if (!MonsterClasses[className]) {
                throw 'Monster class name "' + className + '" not exists';
            }
        });
    });
});
