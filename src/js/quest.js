var Quest = Events.extend({
    constructor: function (data) {
        this._super();
        if (data) {
            this.journal = data.journal;
        }else {
            this.journal=[];
        }

    },
    prepareMap: function (map) {

    },
    name: '',
    stages: {
        default: {
            name: '',
            description: '',
            complete: true,
            action: function () {

            }
        }
    },
    isComplete: false,
    id: '',
    journal: [],
    moveToStage: function (stageID) {
        var stage = this.stages[stageID];
        this.journal.push(stageID);
        stage.action.call(this);
    },
    toJson: function () {
        return {
            journal: this.journal
        }
    }
});

Quest.hash = {};


Quest.moveToStage = function (questID, stageID) {
    var savedQuests = Player.getSaveData('quests');
    var quest = savedQuests[questID];
    if (!quest) {
        quest = new Quest.hash[questID]();
    }
    quest.moveToStage(stageID);
};

Player.on('load', function () {
    var savedQuests = Player.getSaveData('quests');
    _.each(savedQuests, function (data, id) {
        savedQuests[id] = new Quest.hash[id](data);
    });
});