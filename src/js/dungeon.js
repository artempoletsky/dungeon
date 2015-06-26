$(function () {

    window.MapCell = Class.extend({
        enter: function () {

        },
        className: '',
        type: '',
        x: 0,
        y: 0,
        sneak: 0,
        index: 0,
        constructor: function (props) {
            this.x = props.x;
            this.y = props.y;
            this.className = props.className||'wall';
            this.type = props.type;
            this.index = props.index;
        }
    });


    window.Dungeon = ViewModel.create({
        mapObjects: {
            0: [MapCell],//common
            1: [],//uncommon
            2: [],//rare
            3: []//legendary
        },
        randomMapObject: function (minRarity, rarityHash) {
            var random = Math.random();
            var rarity = 0;
            if (random < 0.001) {
                rarity = 3;
            } else if (random < 0.4 * 0.4) {
                rarity = 2;
            } else if (random < 0.4) {
                rarity = 1;
            }

            if (rarity < minRarity) {
                rarity = minRarity;
            }

            var array = rarityHash[rarity];
            return array[rand(array.length)];
        },
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
        neighbors: function (x, y, range) {
            var result = [];
            for (var i = y - range; i < y + range; i++) {
                for (var j = x - range; j < x + range; j++) {
                    if (i == y && j == x) {
                        continue;
                    }
                    if (this.matrix[i] && this.matrix[i][j])
                        result.push(this.matrix[i][j]);
                }
            }
            return result;
        },
        checkVisibility: function (x, y) {
            var perception = 5;
            var self = this;
            _.each(this.neighbors(x, y, 2), function (cell) {
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
            if (!this.matrix[y] || !this.matrix[y][x]) {
                return;
            }
            var nextCell = this.matrix[y][x];
            if (nextCell.className=='wall') {
                return;
            }


            nextCell.enter();

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
        start: function (matrix, level, playerParty) {
            this.$el.show();
            $('body').on('keyup', this.onKeyUp);
            this.dungeonLevel = level;
            this.playerParty = playerParty;
            var newMatrix = [];
            this.matrix = newMatrix;
            //this.x = map.startX;
            //this.y = map.startY;
            var self = this;


            var roomCells = [];
            var i=0;
            DungeonGenerator.eachMatrix(matrix, function (cell) {
                if (!newMatrix[cell.y]) {
                    newMatrix[cell.y] = [];
                }
                var Class;

                if(cell.content&&cell.content!='door'){
                    Class= self.randomMapObject(0, self.mapObjects);
                }
                if (!Class) {
                    Class = MapCell;
                }

                newMatrix[cell.y][cell.x] = new Class({
                    x: cell.x,
                    y: cell.y,
                    type: cell.content,
                    className: cell.content,
                    index: i
                });
                i++;

                if (cell.content == 'room') {
                    roomCells.push(newMatrix[cell.y][cell.x]);
                }

            });
            var entry = roomCells[rand(roomCells.length)];
            entry.className = 'entry';
            this.x = entry.x;
            this.y = entry.y;

            newMatrix[entry.y][entry.x] = new MapCell(entry);

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
                $map.append('<div class="map_passage ' + element.className + '" style="left: ' + x * self.cellSize + 'px; top:' + y * self.cellSize + 'px;"></div>');
            });

            self.$cells = $map.children();
        }
    });

});
