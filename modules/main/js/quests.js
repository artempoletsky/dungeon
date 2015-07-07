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