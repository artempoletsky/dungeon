Quest.hash.toFreedom = Quest.extend({
    stages: {
        start: {
            name: 'to_freedom',
            description: 'quest_desc_to_freedom',
            action: function () {
                WorldMap.setLocation('whiterun_neighborhood');
                Dungeon.startPredefined('start', 4, 16);
                Dungeon.saveOnExit = false;
            }
        }
    }
});

Quest.hash.gallican_join = Quest.extend({
    character: Human.create({
        constructor: function () {
            this._super('Anonymous', {
                strength: 7,
                agility: 8,
                magic: 0,
                speed: 5,
                perception: 5
            }, {
                weapon: new Weapon(13, 20)
            });
            this.spells = [new Spells.Hit()];
            this.enemy = false;
            /*
             this.prop({
             attributesPoints: 5,
             skillPoints: 2
             });*/
        }
    }),
    stages: {
        "gallican_join": {
            name: 'quest_gallican_join',
            description: 'quest_gallican_join_descr',
            action: function () {
                _.pull(this.journal, 'gallican_not_join');
                Dungeon.clearCell(Dungeon.x, Dungeon.y);
                Player.party.push(this.character);
            }
        },
        "gallican_not_join": {
            name: 'quest_gallican_not_join',
            description: 'quest_gallican_not_join_descr',
            action: function () {
                Player.getSaveData('dialogs')['gallican'].npc = Dialogs.list['gallican'].alternate;
            }
        }
    }
});