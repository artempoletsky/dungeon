var Player = Events.create({
    mainCharacter: undefined,
    currentDungeon: undefined,
    party: undefined,
    newGame: function () {
        this.fire('newGame');

        this.party = new Collection();

        PartyView.render();
        this.currentSave = {};
        Quest.moveToStage(Game.config.startQuest, 'start');
    },

    currentSave: undefined,

    loadGame: function (index) {


        var save = this.getSaves()[index];
        if (!save) {
            throw new Error('can not find save with index');
        }

        this.currentSave = _.cloneDeep(save);

        this.fire('load');


        var party = this.party = new Collection();

        PartyView.render(party);
        _.each(save.party, function (data) {

            var char = Human.fromJSON(data);
            char.enemy = false;

            party.push(char);
        });

        //save.party = party;

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
            if (!save.date.getTime) {
                save.date = new Date(save.date);
            }
            return -save.date.getTime();
        });
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
        this.currentSave.party = this.party;
        var save = JSON.parse(JSON.stringify(this.currentSave));
        save.date = new Date();

        save.dungeon = this.currentDungeon ? this.currentDungeon.save() : undefined;

        save.mainCharacter = this.party.indexOf(this.mainCharacter);
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

$(function () {

    window.PartyView = ViewModel.create({
        el: '.party_view',
        initialize: function () {
            this.$el.sortableContainer('.pv-item', 200);
        },
        events: {
            'startDrag': 'onStartDrag',
            'stopDrag': 'onStopDrag',
            'sort': 'onSort',
            'click .pv-item': 'onItemClick'
        },
        dragStarted: false,
        onSort: function(e){
            var models=Player.party.models;
            var char=models[e.oldIndex];

            models.splice(e.oldIndex, 1);
            models.splice(e.newIndex, 0, char);
        },
        onStartDrag: function () {
            this.dragStarted = true;
        },

        onStopDrag: function () {
            var self=this;
            _.defer(function(){
                self.dragStarted = false;
            });
        },

        onItemClick: function (e) {
            if (!this.dragStarted) {
                CharacterEditor.show(Player.party.at($(e.currentTarget).index()), false);
            }
        },
        autoParseBinds: true,
        render: function () {
            this.$el.show();
            this.prop('party', Player.party);
        }
    })
});
