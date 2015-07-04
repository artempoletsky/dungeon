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
        cellSize: 50,
        cellsVisible: 4,
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
        get$Cell: function (cell) {
            return this.$map.find('.map_cell[index=' + cell.index + ']');
        },
        markVisible: function (cell) {
            this.get$Cell(cell).attr('class', 'map_cell ' + cell.className);
        },
        pauseKeyboardEvents: false,

        move: function (x, y) {
            var nextCell = this.map.getMovableCell(x, y);

            if (!nextCell) {
                return;
            }


            nextCell.enter();

            nextCell.visited = true;

            if (nextCell.className == 'door') {
                nextCell.className = 'door opened';
            }

            //if (nextCell.content != 'door' && nextCell.content != 'entry')
            //    nextCell.content = nextCell.lastContent;

            this.x = x;
            this.y = y;

            this.markVisible(nextCell);
            //this.trigger('move', nextCell);

            this.checkVisibility(x, y);
            this.render();

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
            var self = this;


            var matrix = this.map.matrix;

            var line = function (x0, y0, x1, y1) {
                var dx = x0 - x1;
                var dy = y0 - y1;
                var result = [];

                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) {
                        return line(x1, y1, x0, y0);
                    }

                    for (var x = x0; x <= x1; x += 1) {
                        var y = Math.round(y1 + dy * (x - x1) / dx);
                        //console.log(x0, x1);
                        if (matrix[y])
                            result.push(matrix[y][x]);
                        else
                            result.push(undefined);
                    }
                } else {

                    if (dy > 0) {
                        return line(x1, y1, x0, y0);
                    }

                    for (var y = y0; y <= y1; y += 1) {
                        var x = Math.round(x1 + dx * (y - y1) / dy);
                        //console.log(x0, x1);
                        if (matrix[y])
                            result.push(matrix[y][x]);
                        else
                            result.push(undefined);
                    }
                }

                result.shift();
                result.pop();
                return result;
            };
            for (var i = 0; i < this.cellsVisible * 2 + 1; i++) {
                for (var j = 0; j < this.cellsVisible * 2 + 1; j++) {
                    var x = self.x - this.cellsVisible + i;
                    var y = self.y - this.cellsVisible + j;
                    var className = "wall";
                    var index = -1;
                    var noVision = "";
                    if (matrix[y] && matrix[y][x]) {
                        className = matrix[y][x].className;
                        index = matrix[y][x].index;
                    }
                    /*if (Math.pow(x - self.x, 2) + Math.pow(y - self.y, 2) > 16) {
                     noVision = 'no_vision';
                     } else {*/

                    _.each(line(x, y, self.x, self.y), function (cell) {
                        if (cell) {
                            var _name = cell.className;
                            if (_name == 'wall' || _name == 'door') {
                                noVision = 'no_vision';
                                return false;
                            }
                        } else {
                            noVision = 'no_vision';
                            return false;
                        }
                    });


                    //}

                    $map.append('<div index="' + index + '" class="map_cell ' + className + ' ' + noVision + '" style="left: ' + i * self.cellSize + 'px; top:' + j * self.cellSize + 'px;"></div>');

                }
            }

            var teamPos = this.cellSize * (this.cellsVisible);

            this.$team.css({
                top: teamPos,
                left: teamPos
            });


            //self.$cells = $map.children();
        }
    });

});
