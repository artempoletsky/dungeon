(function () {


    var eachMatrix = function (matrix, callback, thisArg) {
        var height = matrix.length;
        var width = matrix[0].length;

        var br = false;

        for (var i = 0; i < height; i++) {

            for (var j = 0; j < width; j++) {
                if (callback.call(thisArg, matrix[i][j], j, i) === false) {
                    br = true;
                    break;
                }
            }
            if (br) {
                break;
            }
        }
    };

    var rand = function (max) {
        return Math.floor(Math.random() * max);
    }


    var placeRoom = function (martix) {
        var width = 3 + rand(2) * 2;
        var height = 3 + rand(2) * 2;

        var checkIntersects = function (width, height, x, y) {
            if (x < 0) {
                x = 0;
            }
            if (y < 0) {
                y = 0;
            }
            for (var w = 0; w < width; w++) {
                for (var h = 0; h < height; h++) {

                    var el = martix[h + y][w + x];
                    if (el.content) {
                        return true;
                    }
                }
            }
            return false;
        }


        var room = function (width, height, x, y) {
            for (var w = 0; w < width; w++) {
                for (var h = 0; h < height; h++) {
                    DungeonGenerator.fill(w + x, h + y, 'room');
                }
            }
        }


        for (var i = 0; i < 10; i++) {
            var x = 1 + rand((martix[0].length - width - 2) / 2) * 2;
            var y = 1 + rand((martix.length - height - 2) / 2) * 2;
            if (!checkIntersects(width + 2, height + 2, x - 1, y - 1)) {
                room(width, height, x, y);
                break;
            }
        }
    }


    var checkSiblings = function (matrix, x, y) {

        for (var i = x - 1; i < x + 2; i++) {
            for (var j = y - 1; j < y + 2; j++) {
                try {
                    if (matrix[j][i].content) {
                        return true;
                    }
                } catch (e) {

                }
            }
        }
        return false;
    }


    window.DungeonGenerator = Class.create({


        eachRandom: function (array, callback) {
            while (array.length) {
                var index = rand(array.length);
                callback(array[index]);
                array.splice(index, 1);
            }
        },

        neighbors: function (x, y, range) {
            if (!range) {
                range = 1;
            }
            var result = [];
            var m = this.matrix;
            if (m[y - range])
                result.push(m[y - range][x]);
            if (m[y + range])
                result.push(m[y + range][x]);
            if (m[y][x - range])
                result.push(m[y][x - range]);
            if (m[y][x + range])
                result.push(m[y][x + range]);
            return result;
        },

        maze: function (x, y) {
            var self = this;

            var current = self.matrix[y][x];
            if (current.content) {
                return;
            }
            self.fill(x, y, 'passage');


            var walls = _.map(this.neighbors(x, y, 2), function(cell){
                return {
                    cell: cell,
                    parent: current
                }
            });

            this.eachRandom(walls, function (el) {
                var cell=el.cell;
                if (!cell.content) {

                    var x = el.parent.x;
                    var y = el.parent.y;
                    var wallX = (x + cell.x) / 2;
                    var wallY = (y + cell.y) / 2;
                    self.fill(wallX, wallY, 'passage');
                    self.fill(cell.x, cell.y, 'passage');

                    current=cell;

                    //x=cell.x;
                    //y=cell.y;

                    _.each(self.neighbors(cell.x, cell.y, 2), function (cell) {
                        if (!cell.content) {
                            //cell._x = x;
                            // cell._y = y;
                            walls.push({
                                cell: cell,
                                parent: current
                            });
                        }
                    });
                    //self.maze(cell.x, cell.y);
                }
                ///self.maze(x, y);
            });


        },

        placeDoors: function () {
            var self = this;
            var matrix = this.matrix;
            var merged = [1];

            var canPlaceDoor = function (cell) {
                if (!cell.content) {
                    var x = cell.x;
                    var y = cell.y;

                    var notMerged = function (reg1, reg2) {
                        if (reg1 && reg2 && reg1 != reg2) {
                            if (merged.indexOf(reg1) == -1 || merged.indexOf(reg2) == -1) {
                                if (merged.indexOf(reg1) == -1) {
                                    cell.merge = reg1;
                                } else {
                                    cell.merge = reg2;
                                }
                                return true;
                            }
                        }
                        return false;
                    }

                    //checks if neighbors not empty and different regions
                    if (matrix[y][x - 1] && matrix[y][x + 1]) {
                        if (notMerged(matrix[y][x - 1].regionID, matrix[y][x + 1].regionID)) {
                            return true;
                        }
                    }

                    if (matrix[y - 1] && matrix[y + 1]) {
                        if (notMerged(matrix[y - 1][x].regionID, matrix[y + 1][x].regionID)) {
                            return true;
                        }
                    }
                }
                return false;
            }


            _.each(this.regions, function (cells, index) {


                if (merged.indexOf(index) != -1 && index != 1) {
                    return;
                }


                var doors = {};
                _.each(cells, function (cell) {

                    _.each(self.neighbors(cell.x, cell.y), function (cell) {
                        if (canPlaceDoor(cell)) {
                            if (!doors[cell.merge]) {
                                doors[cell.merge] = [];
                            }
                            doors[cell.merge].push(cell);
                            //cell.content = 'door';
                        }
                    });


                });


                _.each(doors, function (doors, region) {
                    if (merged.indexOf(region) != -1 && 0.2 < Math.random()) {
                        return;
                    }

                    merged.push(region);
                    var door = doors[rand(doors.length)];
                    door.content = 'door';
                });
            });
        },

        removeDeadEnds: function () {
            var self = this;
            var matrix = self.matrix;
            var isDeadEnd = function (cell) {
                if (!cell.content) {
                    return false;
                }
                var x = cell.x, y = cell.y;
                var walls = 0;
                if (!matrix[y - 1] || !matrix[y - 1][x].content)
                    walls++;

                if (!matrix[y + 1] || !matrix[y + 1][x].content)
                    walls++;

                if (!matrix[y][x + 1] || !matrix[y][x + 1].content)
                    walls++;

                if (!matrix[y][x - 1] || !matrix[y][x - 1].content)
                    walls++;

                return walls > 2;
            }
            var found;
            do {
                found = false;
                eachMatrix(matrix, function (cell, x, y) {
                    if (isDeadEnd(cell)) {
                        found = true;
                        cell.content = undefined;
                    }
                });
            } while (found)
        },


        findEmptySpace: function () {
            var matrix = this.matrix;
            var found = undefined;
            eachMatrix(matrix, function (element, x, y) {
                if (!checkSiblings(matrix, x, y) && x % 2 && y % 2) {
                    found = element;
                    return false;
                }
            });
            return found;
        },

        fill: function (x, y, content) {
            var cell = this.matrix[y][x];
            cell.content = content;
            cell.regionID = this.regionID;
            this.regions[this.regionID].push(cell);
        },

        addRegion: function () {

            this.regionID++;
            this.regions[this.regionID] = [];
        },

        generate: function (width, height) {
            this.width = width;
            this.height = height;

            this.regions = [];
            this.regionID = 0;

            var matrix = [];
            for (var i = 0; i < height; i++) {
                var row = [];
                for (var j = 0; j < width; j++) {
                    row[j] = {
                        x: j,
                        y: i
                    };
                }
                matrix[i] = row;
            }
            this.matrix = matrix;

            var $map = $('.map');
            $map.empty();

            //var startX = Math.floor(Math.random() * width);
            //var startY = Math.floor(Math.random() * height);

            //matrix[startY][startX].content = 'start';

            var rooms = Math.floor(width * height / 100);
            for (var i = 0; i < rooms; i++) {
                this.addRegion();
                placeRoom(matrix);
            }
            var self = this;


            var cell;
            while (cell = this.findEmptySpace()) {
                this.addRegion();
                this.maze(cell.x, cell.y);
            }

            this.placeDoors();

            this.removeDeadEnds();

            eachMatrix(matrix, function (element, x, y) {
                $map.append('<div region="' + element.regionID + '" class="map_passage ' + element.content + '" style="left: ' + x * 20 + 'px; top:' + y * 20 + 'px;"></div>');
            });


        }
    });

    var goodFunction = DungeonGenerator.fill;
}());

