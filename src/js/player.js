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
                this.spells = [new Spells.Hit()];
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
        this.currentSave = save;

        this.fire('load');

        var party = this.party = [];
        _.each(save.party, function (data) {
            var char = new Human(data.name, data.attributes, data.equipment);
            char.enemy = false;
            party.push(char);
        });
        save.party = party;

        WorldMap.$el.hide();
        Dungeon.$el.hide();

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
            if (localStorage.saves)
                saves = JSON.parse(localStorage.saves);
        }
        if (!saves) {
            saves = [];
        }
        this.saves = saves;
        return saves;
    },
    saveGame: function (index, name) {
        var saves = this.getSaves();

        var save = JSON.parse(JSON.stringify(this.currentSave));
        if (this.currentDungeon) {
            save.dungeon = this.currentDungeon.save();
        }

        save.name = name;

        if (index !== undefined) {
            saves[index] = save;
        } else {
            saves.push(save);
        }
        localStorage.saves = JSON.stringify(saves);

    }
});
