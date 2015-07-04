MapCellClasses.NPC = MapCell.extend({
    constructor: function (cell) {
        this._super(cell);
        this.className = this.npcClassName;
    },
    npcClassName: 'npc',
    enter: function () {
        Dungeon.pauseKeyboardEvents = true;
    }
});

var NPCActions = {};

