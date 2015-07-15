var Player = Events.create({
    mainCharacter: undefined,
    currentDungeon: undefined,
    party: [],
    newGame: function () {
        this.fire('newGame');

        this.mainCharacter = Human.create({
            constructor: function () {
                this._super('Anonymous', {
                    strength: 5,
                    agility: 5,
                    magic: 0,
                    speed: 5,
                    perception: 5
                }, {
                    weapon: new Weapon(13, 20)
                });
                this.spells = [new Spells.Hit(this)];
                this.enemy = false;
                this.prop({
                    attributesPoints: 5,
                    skillPoints: 2
                });
            }
        });


        this.party = [this.mainCharacter];

        this.currentSave = {
            party: this.party
        };

        Quest.moveToStage(Game.config.startQuest, 'start');
    },

    currentSave: undefined,

    loadGame: function (index) {


        var save = this.getSaves()[index];
        if (!save) {
            return;
        }

        this.currentSave = save;

        this.fire('load');

        var party = this.party = [];
        _.each(save.party, function (data) {
            var char = new Human(data.name, data.attributes, data.equipment);
            char.enemy = false;
            party.push(char);
        });
        save.party = party;

        $('.scene').hide();

        if (save.dungeon) {
            Dungeon.load(save.dungeon);
        } else {
            WorldMap.$el.show();
        }

        WorldMap.setLocation(save.currentLocation);
    },

    saves: undefined,

    getSaveData: function (hash) {
        if (!this.currentSave[hash]) {
            this.currentSave[hash] = {};
        }
        return this.currentSave[hash];
    },

    getSaves: function () {
        var saves = this.saves;
        if (!saves) {
            if (localStorage.saves) {
                saves = JSON.parse(localStorage.saves);

            }

        }
        if (!saves) {
            saves = [];
        }
        this.saves = _.sortBy(saves, function (save) {
            if(!save.date.getTime){
                save.date = new Date(save.date);
            }
            return -save.date.getTime();
        });;
        return this.saves;
    },
    quickSave: function () {
        var save = this.prepareSave();
        save.name = 'Quick save';
        save.isQuickSave = true;
        var index = _.findIndex(this.getSaves(), 'isQuickSave', true);
        this.saveObject(save, index);
    },
    quickLoad: function () {
        this.loadGame(_.findIndex(this.getSaves(), 'isQuickSave', true));
    },

    prepareSave: function () {
        var save = JSON.parse(JSON.stringify(this.currentSave));
        save.date = new Date();
        if (this.currentDungeon) {
            save.dungeon = this.currentDungeon.save();
        }
        return save;
    },
    saveObject: function (object, index) {

        var saves = this.getSaves();


        if (index == -1) {
            index = undefined;
        }

        if (index !== undefined) {
            saves[index] = object;
        } else {
            saves.unshift(object);
        }
        localStorage.saves = JSON.stringify(saves);
    },
    saveGame: function (index, name) {
        var save = this.prepareSave();
        save.name = name;
        this.saveObject(save, index);
    }
});
