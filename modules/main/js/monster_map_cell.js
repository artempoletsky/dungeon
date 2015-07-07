MapCellClasses.Monster = MapCell.extend({
    constructor: function (cell) {
        this._super(cell);

        if (cell.data && cell.data.party) {
            var classes = MonsterParties[cell.data.party];
            this.data = cell.data;
            if (!classes) {
                throw  'cell.data.party is wrong. "' + cell.data.party + '" expected';
            }
            this.monstersParty = this.makeParty(classes.party, this.dungeonLevel);
        } else {

            if (cell.data) {
                this.data = cell.data;
            } else {
                this.data = {};
            }
            this.monstersParty = this.getMonstersParty(this.map.dungeonLevel || 1);
        }
        if (this.data.monstersDefeated) {
            this.className = this.type;
        } else {
            this.className = 'monster';
        }

        //this.monstersParty = dungeon.dungeonLevel;
    },
    getMonstersParty: function (level) {
        var variants = _.compact(_.map(MonsterParties, function (obj, name) {
            if (!obj.minLevel || level >= obj.minLevel) {
                if (!obj.maxLevel || level <= obj.maxLevel) {
                    return name;
                }
            }
        }));

        if (!variants.length) {
            throw "Can't create monster cell";
        }

        var name = variants[rand(variants.length)];
        var classes = MonsterParties[name];
        this.data.party = name;
        return this.makeParty(classes.party, level);
    },
    monstersParty: undefined,
    makeParty: function (namesArray, level) {
        return _.map(namesArray, function (ClassName) {
            return new MonsterClasses[ClassName](level);
        });
    },
    enter: function () {
        if (this.data.monstersDefeated) {
            return;
        }

        this.data.monstersDefeated = true;
        this.className = this.type;
        Dungeon.pauseKeyboardEvents = true;
        Dungeon.$el.hide();
        var className = Dungeon.map.backgroundClassName;

        Battlefield.one('endFight', function (e) {
            Dungeon.$el.show();
            Dungeon.pauseKeyboardEvents = false;
        });

        Battlefield.fight(this.monstersParty, className);
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
