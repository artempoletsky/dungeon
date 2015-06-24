$(function () {

    window.Dungeon = ViewModel.create({
        mapObjects: {
            0: [undefined],//common
            1: ['chest', 'monster'],//uncommon
            2: ['trap'],//rare
            3: ['bossMonster']//legendary
        },
        randomObject: function (minRarity, rarityHash) {
            var rand = Math.random();
            var rarity = 0;
            if (rand < 0.001) {
                rarity = 3;
            } else if (rand < 0.4 * 0.4) {
                rarity = 2;
            } else if (rand < 0.4) {
                rarity = 1;
            }

            if (rarity < minRarity) {
                rarity = minRarity;
            }

            var array = rarityHash[rarity];
            return array[Math.floor(Math.random() * array.length)];
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
                    if(this.matrix[i]&&this.matrix[i][j])
                    result.push(this.matrix[i][j]);
                }
            }
            return result;
        },
        checkVisibility: function (x, y) {
            var perception=5;
            var self=this;
            _.each(this.neighbors(x, y, 2), function (cell) {
                if (!cell.visibilityChecked) {
                    cell.visibilityChecked = true;
                    if(perception+rand(10)>cell.sneak+rand(10)){
                        self.markVisible(cell);
                    }
                }
            });
        },
        markVisible: function(cell){
            cell.visibilityChecked=true;

            this.$cells.eq(cell.index).attr('class', 'map_passage '+cell.content);
        },
        move: function (x, y) {
            if (!this.matrix[y] || !this.matrix[y][x]) {
                return;
            }
            var nextCell = this.matrix[y][x];
            if (!nextCell.content) {
                return;
            }


            switch (nextCell.content){
                case 'monster': alert('fight'); break;
                case 'trap': alert('trap'); break;
            }
            if(nextCell.content!='door'&&nextCell.content!='entry')
            nextCell.content=nextCell.lastContent;

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
            var self = this;


            var roomCells = [];
            DungeonGenerator.eachMatrix(matrix, function (cell) {
                if (cell.content == 'room') {
                    roomCells.push(cell);
                }
                if (cell.content && cell.content != 'door') {
                    cell.lastContent = cell.content;
                    cell.content = self.randomObject(0, self.mapObjects) || cell.content;
                    if (cell.content == 'trap' || cell.content == 'monster') {
                        cell.sneak = rand(5);
                    }
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
            var i = 0;
            DungeonGenerator.eachMatrix(this.matrix, function (element, x, y) {
                element.index = i;
                i++;
                var className = '';
                if (element.content != 'trap' && element.content != 'monster') {
                    className = element.content;
                } else {
                    className = element.lastContent;
                }
                $map.append('<div class="map_passage ' + className + '" style="left: ' + x * self.cellSize + 'px; top:' + y * self.cellSize + 'px;"></div>');
            });

            self.$cells=$map.children();
        }
    });

});
