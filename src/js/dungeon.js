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
        move: function (x, y) {
            if (!this.matrix[y] || !this.matrix[y][x]) {
                return;
            }
            var nextCell = this.matrix[y][x];
            if (!nextCell.content) {
                return;
            }
            this.trigger('move', nextCell);
            this.x = x;
            this.y = y;
            this.$team.css({
                top: y * this.cellSize,
                left: x * this.cellSize
            });
        },
        onKeyUp: function (e) {

            var fnName = Dungeon.keys[e.keyCode];
            if (fnName) {
                //console.log(fnName);
                Dungeon[fnName]();
            }
        },
        finish: function () {
            $('body').off('keyup', this.onKeyUp);
        },
        start: function (matrix) {
            $('body').on('keyup', this.onKeyUp);
            this.matrix = matrix;
            //this.x = map.startX;
            //this.y = map.startY;

            var roomCells = [];
            DungeonGenerator.eachMatrix(matrix, function (cell) {

                if (cell.content == 'room') {
                    roomCells.push(cell);
                }
            });
            var entry = roomCells[rand(roomCells.length)];
            entry.content = 'entry';
            this.x = entry.x;
            this.y = entry.y;

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

            DungeonGenerator.eachMatrix(this.matrix, function (element, x, y) {
                $map.append('<div region="' + element.regionID + '" class="map_passage ' + element.content + '" style="left: ' + x * self.cellSize + 'px; top:' + y * self.cellSize + 'px;"></div>');
            });
        }
    });

});
