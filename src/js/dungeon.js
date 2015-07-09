$(function () {

    window.Dungeon = ViewModel.create({
        el: '.dungeon',
        shortcuts: {
            $map: '.map',
            $team: '.team',
            $context: '.context',
            $autoMap: '#auto_map'
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
        events: {
            'click .context button': 'onContextClick',
            //'key:w': 'up',
            'key:arrowup': 'up',
            'key:shift+s': 'quickSave',
            'key:shift+l': 'quickLoad',
            'key:arrowdown': 'down',
            //'key:a': 'left',
            'key:arrowleft': 'left',
            //'key:d': 'right',
            'key:arrowright': 'right'
        },
        quickSave: function(){
            Player.quickSave();
        },
        quickLoad: function(){
            Player.quickLoad();
        },
        hotkeys: 'shift+s shift+l',
        initialize: function () {

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

        clearCell: function (x, y) {
            this.map.clearCell(x, y);
            this.markVisible(this.map.matrix[y][x])
        },
        move: function (x, y) {
            var nextCell = this.map.getMovableCell(x, y);

            if (!nextCell) {
                return;
            }


            this.x = x;
            this.y = y;

            var context = nextCell.enter();

            nextCell.visited = true;

            if (nextCell.className == 'door') {
                nextCell.className = 'door opened';
            }



            this.setContext(context);


            this.markVisible(nextCell);
            //this.trigger('move', nextCell);

            this.checkVisibility(x, y);
            this.render();

        },

        finish: function () {
            this.$el.hide();
            if (this.saveOnExit) {
                this.setSave(this.saveOnExit, this.save());
            }

            Player.currentDungeon = undefined;
           // $('body').off('keyup', this.onKeyUp);
            WorldMap.$el.show();

            this.fire('finish');
        },
        autoMapCellSize: 10,

        saveOnExit: false,
        getSave: function (id) {
            return Player.getSaveData('dungeons')[id];
        },
        setSave: function (id, value) {
            Player.getSaveData('dungeons')[id] = value;
        },
        startPredefined: function (id, x, y) {
            var save = this.getSave(id);
            if (!save) {
                var map = Map.fromJSON(Map.predefined[id]);
                if (x) {
                    this.startFrom(map, x, y);
                } else {
                    this.start(map);
                }
            } else {
                this.load(save);
            }
            this.saveOnExit = id;
        },

        start: function (map) {
            this.startFrom(map, map.entryX, map.entryY);
        },

        startFrom: function (map, x, y) {

            HotKeys.focus(this);
            this.$el.show();
            Player.currentDungeon = this;
            this.map = map;
            //$('body').on('keyup', this.onKeyUp);

            this.playerParty = Player.party;

            this.x = x;
            this.y = y;

            this.ctx = this.$autoMap[0].getContext('2d');

            this.$autoMap[0].width = this.autoMapCellSize * this.map.width;
            this.$autoMap[0].height = this.autoMapCellSize * this.map.height;

            this.automapSave = [];
            this.move(this.x, this.y);
            this.saveOnExit = false;
        },
        load: function (data) {
            var map = Map.fromJSON(data.map);
            this.startFrom(map, data.x, data.y);
            var width = map.width;
            var ctx = this.ctx;
            var cellSize = this.autoMapCellSize;

            _.each(data.automap, function (color, index) {
                if (color) {
                    var x = index % width;
                    var y = index / width | 0;
                    ctx.fillStyle = color;
                    ctx.fillRect(cellSize * x, cellSize * y, cellSize, cellSize);
                }
            });

            this.automapSave = _.clone(data.automap);
        },
        save: function () {
            return {
                automap: _.clone(this.automapSave),
                map: this.map.toJSON(),
                x: this.x,
                y: this.y
            }
        },

        x: 0,
        y: 0,
        matrix: undefined,


        onContextClick: function (e) {
            var name = $(e.currentTarget).data('name');
            this.contextAction[name].call(this);
        },
        setContext: function (actions) {
            var self = this;
            var $context = self.$context.empty();
            this.contextAction = actions;
            _.each(actions, function (fn, name) {
                $context.append('<button data-name="' + name + '">' + name + '</button>');
            });
        },

        automapSave: [],
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
                    var stepX = -dx / Math.abs(dx);

                    for (var x = x0; x != x1; x += stepX) {
                        var y = y1 + dy * (x - x1) / dx;

                        if (dy > 0) {
                            y = Math.floor(y);
                        } else {
                            y = Math.ceil(y);
                        }

                        if (matrix[y])
                            result.push(matrix[y][x]);
                        else
                            result.push(undefined);
                    }
                } else {
                    if (dy == 0) {
                        return [];
                    }
                    var stepY = -dy / Math.abs(dy);


                    for (var y = y0; y != y1; y += stepY) {
                        var x = x1 + dx * (y - y1) / dy;

                        if (dx > 0) {
                            x = Math.floor(x);
                        } else {
                            x = Math.ceil(x);
                        }
                        //console.log(x0, x1);
                        if (matrix[y])
                            result.push(matrix[y][x]);
                        else
                            result.push(undefined);
                    }
                }

                //result.pop();
                result.shift();

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

                    if (!noVision) {
                        if (className == 'wall') {
                            this.ctx.fillStyle = "#666";
                        } else if (className == "entry") {
                            this.ctx.fillStyle = "#0c0";
                        } else {
                            this.ctx.fillStyle = "#fff";
                        }
                        if (x == self.x && y == self.y) {
                            this.ctx.fillStyle = "#FF9B62";
                        }
                        this.automapSave[index] = this.ctx.fillStyle;
                        this.ctx.fillRect(this.autoMapCellSize * x, this.autoMapCellSize * y, this.autoMapCellSize, this.autoMapCellSize);
                    }

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
