var Player = Events.create({
    mainCharacter: undefined,
    currentLocation: undefined,
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
    },

    loadGame: function (index) {
        var save = JSON.parse(localStorage.saves)[index];
        var party = this.party = [];
        _.each(save.party, function (data) {
            party.push(new Human(data.name, data.attributes, data.equipment));
        });
        if (save.dungeon) {
            Dungeon.load(save.dungeon);
        }
        //console.log(saves);
    },
    saveGame: function (index) {
        var saves = [];
        if (localStorage.saves) {
            saves = JSON.parse(localStorage.saves);
        }
        var save = {};

        save.party = this.party;

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
