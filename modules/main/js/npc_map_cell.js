MapCellClasses.NPC = MapCell.extend({
    constructor: function (cell) {
        this._super(cell);
        _.defaults(this.data, {
            className: 'npc'
        });
        this.className = this.data.className;
    },
    npcClassName: 'npc',
    enter: function () {
        Dialogs.start(this.data.dialog);
    }
});

