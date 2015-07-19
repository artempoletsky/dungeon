Quest.hash.toFreedom = Quest.extend({
    stages: {
        start: {
            name: 'to_freedom',
            description: 'quest_desc_to_freedom',
            action: function () {
                WorldMap.setLocation('first_town_neighborhood');


                Player.mainCharacter = Human.create({
                    constructor: function () {
                        this._super('Anonymous', {
                            strength: 5,
                            agility: 5,
                            magic: 0,
                            speed: 5,
                            perception: 5
                        }, {
                            weapon: 'rusty_sword'
                        });
                        this.spells = [new Spells.Hit(this)];
                        this.enemy = false;
                        this.prop({
                            attributesPoints: 5,
                            skillPoints: 2
                        });
                    }
                });

                Player.party.push(Player.mainCharacter);

                CharacterEditor.show(Player.mainCharacter, true);

                Dungeon.startPredefined('start', 4, 16);
                Dungeon.saveOnExit = false;
            }
        }
    }
});

Quest.hash.gallican_join = Quest.extend({
    Character: Human.extend({
        constructor: function () {
            this._super('Gallican', {
                strength: 7,
                agility: 8,
                magic: 0,
                speed: 5,
                perception: 5
            }, {
                weapon: 'rusty_sword'
            });
            this.spells = [new Spells.Hit(this)];
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
                Player.party.push(new this.Character());
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