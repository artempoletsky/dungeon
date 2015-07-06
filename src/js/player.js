var Player = Events.create({
    mainCharacter: undefined,
    currentDungeon: undefined,
    party: [],
    newGame: function () {
        this.mainCharacter = new Human('Anonymous', {
            strength: 5,
            agility: 5,
            magic: 0,
            speed: 5,
            perception: 5
        });
        this.mainCharacter.prop('attributesPoints', 5);
        this.mainCharacter.prop('skillPoints', 2);
        this.party = [];
        this.party.push(this.mainCharacter);

        this.currentSave = {
            party: this.party
        };

    },

    currentSave: undefined,

    loadGame: function (index) {
        this.fire('load');
        var save = JSON.parse(localStorage.saves)[index];
        this.currentSave=save;

        var party = this.party = [];
        _.each(save.party, function (data) {
            party.push(new Human(data.name, data.attributes, data.equipment));
        });
        save.party=party;

        WorldMap.$el.hide();
        Dungeon.$el.hide();

        if (save.dungeon) {
            Dungeon.load(save.dungeon);
        }else {
            WorldMap.$el.show();
        }
        console.log(save.currentLocation)
        WorldMap.setLocation(save.currentLocation);
    },
    saveGame: function (index) {
        var saves = [];
        if (localStorage.saves) {
            saves = JSON.parse(localStorage.saves);
        }
        var save = this.currentSave;


        if (this.currentDungeon) {
            save.dungeon = this.currentDungeon.save();
        }




        if (index !== undefined) {
            saves[index] = save;
        } else {
            saves.push(save);
        }
        localStorage.saves = JSON.stringify(saves);

    }
});
