$(function () {

    window.Dungeon = ViewModel.create({
        el: '.dungeon',
        shortcuts: {
            $map: '.map',
            $team: '.team'
        },
        keys: {
            82: 'up',
            38: 'up',
            83: 'down',
            40: 'down',
            65: 'left',
            37: 'left',
            68: 'right',
            39: 'right'
        },
        cellSize: 21,
        up: function () {
            this.move(this.x, this.y - 1);
        },
        down: function () {
            this.move(this.x, this.y + 1);
        },
        left: function () {
            this.move(this.x - 1, this.y);
        },
        right: function () {
            this.move(this.x + 1, this.y);
        },

        checkVisibility: function (x, y) {
            var perception = 5;
            var self = this;
            _.each(this.map.neighbors(x, y, 2), function (cell) {
                if (!cell.visibilityChecked) {
                    cell.visibilityChecked = true;
                    if (perception + rand(10) > cell.sneak + rand(10)) {
                        self.markVisible(cell);
                    }
                }
            });
        },
        markVisible: function (cell) {
            this.$cells.eq(cell.index).attr('class', 'map_passage ' + cell.className);
        },
        pauseKeyboardEvents: false,

        move: function (x, y) {
            var nextCell = this.map.getMovableCell(x, y);

            if (!nextCell) {
                return;
            }

            if (!nextCell.visited) {
                nextCell.enter();
            }
            nextCell.visited = true;


            //if (nextCell.content != 'door' && nextCell.content != 'entry')
            //    nextCell.content = nextCell.lastContent;

            this.markVisible(nextCell);
            //this.trigger('move', nextCell);

            this.checkVisibility(x, y);
            this.x = x;
            this.y = y;
            this.$team.css({
                top: y * this.cellSize,
                left: x * this.cellSize
            });
        },
        onKeyUp: function (e) {
            if (this.pauseKeyboardEvents)
                return;
            var fnName = Dungeon.keys[e.keyCode];
            if (fnName) {
                //console.log(fnName);
                Dungeon[fnName]();
            }
        },
        finish: function () {
            $('body').off('keyup', this.onKeyUp);
        },
        start: function (map, playerParty) {
            this.$el.show();
            this.map = map;
            $('body').on('keyup', this.onKeyUp);

            this.playerParty = playerParty;

            this.x = map.entryX;
            this.y = map.entryY;

            this.render();
        },
        x: 0,
        y: 0,
        matrix: undefined,
        render: function () {
            var $map = this.$map;
            $map.empty();

            this.$team.css({
                top: this.y * this.cellSize,
                left: this.x * this.cellSize
            });
            var self = this;
            this.map.eachCell(function (element, x, y) {
                $map.append('<div class="map_passage ' + element.className + '" style="left: ' + x * self.cellSize + 'px; top:' + y * self.cellSize + 'px;"></div>');
            });

            self.$cells = $map.children();
        }
    });

});
