(function () {

    window.rand = function (max) {
        return Math.floor(Math.random() * max);
    }

    _.eachMatrix = function (matrix, callback, thisArg) {
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
    }

    _.eachRandom = function (array, callback, thisArg) {
        while (array.length) {
            var index = rand(array.length);
            if (callback.call(thisArg, array[index], index) === false) {
                break;
            }
            array.splice(index, 1);
        }
    };


    window.InitalMazeGenerator = Class.create({


        roomSize: 2,
        roomIntersectionPadding: 1,
        roomPlacingAttempts: 10,
        randomDoorChance: 0.01,


        placeRoom: function () {
            var width = 3 + rand(this.roomSize) * 2;
            var height = 3 + rand(this.roomSize) * 2;
            var self = this;
            var matrix = this.matrix;


            var checkIntersects = function (width, height, x, y) {
                if (x < 0) {
                    x = 0;
                }
                if (y < 0) {
                    y = 0;
                }
                for (var w = 0; w < width; w++) {
                    for (var h = 0; h < height; h++) {

                        var el = matrix[h + y][w + x];
                        if (el.type) {
                            return true;
                        }
                    }
                }
                return false;
            }


            var room = function (width, height, x, y) {
                for (var w = 0; w < width; w++) {
                    for (var h = 0; h < height; h++) {
                        self.fill(w + x, h + y, 'room');
                    }
                }
            }


            var padding = this.roomIntersectionPadding;
            for (var i = 0; i < this.roomPlacingAttempts; i++) {
                var x = 1 + rand((matrix[0].length - width - 2) / 2) * 2;
                var y = 1 + rand((matrix.length - height - 2) / 2) * 2;
                if (!checkIntersects(width + padding * 2, height + padding * 2, x - padding, y - padding)) {
                    this.addRegion();
                    room(width, height, x, y);
                    break;
                }
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
            if (current.type) {
                return;
            }
            self.fill(x, y, 'passage');


            var walls = _.map(this.neighbors(x, y, 2), function (cell) {
                return {
                    cell: cell,
                    parent: current
                }
            });

            _.eachRandom(walls, function (el) {
                var cell = el.cell;
                if (!cell.type) {

                    var x = el.parent.x;
                    var y = el.parent.y;
                    var wallX = (x + cell.x) / 2;
                    var wallY = (y + cell.y) / 2;
                    self.fill(wallX, wallY, 'passage');
                    self.fill(cell.x, cell.y, 'passage');

                    current = cell;

                    _.each(self.neighbors(cell.x, cell.y, 2), function (cell) {
                        if (!cell.type) {
                            walls.push({
                                cell: cell,
                                parent: current
                            });
                        }
                    });
                }
            });


        },

        placeDoors: function () {
            var self = this;
            var matrix = this.matrix;


            var canPlaceDoor = function (cell) {
                if (!cell.type) {
                    var x = cell.x;
                    var y = cell.y;
                    //checks if neighbors not empty and different regions
                    var left = matrix[y][x - 1], right = matrix[y][x + 1];
                    if (left && right) {
                        if (left.regionID && right.regionID && left.regionID != right.regionID) {
                            cell.data = left.regionID + ' ' + right.regionID;
                            return true;
                        }
                    }

                    if (matrix[y - 1] && matrix[y + 1]) {
                        var top = matrix[y - 1][x], bottom = matrix[y + 1][x];
                        if (top.regionID && bottom.regionID && top.regionID != bottom.regionID) {
                            cell.data = top.regionID + ' ' + bottom.regionID;
                            return true;
                        }
                    }
                }
                return false;
            }

            var doors = [];

            _.eachMatrix(matrix, function (cell) {
                if (canPlaceDoor(cell)) {
                    doors.push(cell);
                }
            });


            var merged = {};

            _.each(this.regions, function (region, id) {
                if (region)
                    merged[id] = [];
            });


            var isConnected = function (region1, region2) {
                return merged[region1].indexOf(region2) != -1
            };

            var connect = function (region1, region2) {
                if (region1 == region2 || isConnected(region1, region2)) {
                    return;
                }

                merged[region1].push(region2);
                merged[region2].push(region1);

                _.each(merged[region1], function (region) {
                    connect(region, region2);
                });

                _.each(merged[region2], function (region) {
                    connect(region, region1);
                });
            }


            _.eachRandom(doors, function (cell) {
                var regions = cell.data.split(' ');
                if (!isConnected(regions[0], regions[1]) || Math.random() < self.randomDoorChance) {
                    connect(regions[0], regions[1]);
                    cell.type = 'door';
                }
            });
        },

        removeDeadEnds: function () {
            var self = this;
            var matrix = self.matrix;
            var isDeadEnd = function (cell) {
                if (!cell.type) {
                    return false;
                }
                var x = cell.x, y = cell.y;
                var walls = 0;
                if (!matrix[y - 1] || !matrix[y - 1][x].type)
                    walls++;

                if (!matrix[y + 1] || !matrix[y + 1][x].type)
                    walls++;

                if (!matrix[y][x + 1] || !matrix[y][x + 1].type)
                    walls++;

                if (!matrix[y][x - 1] || !matrix[y][x - 1].type)
                    walls++;

                return walls > 2;
            }
            var found;
            do {
                found = false;
                _.eachMatrix(matrix, function (cell, x, y) {
                    if (isDeadEnd(cell)) {
                        found = true;
                        cell.type = undefined;
                    }
                });
            } while (found)
        },


        findEmptySpace: function () {
            var matrix = this.matrix;
            var found = undefined;

            var checkSiblings = function (x, y) {
                var found = false;
                if (matrix[y][x].type) {
                    return true;
                }
                _.each(self.neighbors(x, y), function (cell) {
                    if (cell.type) {
                        found = true;
                        return false;
                    }
                });
                return found;
            };

            var self = this;
            _.eachMatrix(matrix, function (element, x, y) {

                if (x % 2 && y % 2)
                    if (!checkSiblings(x, y)) {
                        found = element;
                        return false;
                    }
            });
            return found;
        },

        fill: function (x, y, content) {
            var cell = this.matrix[y][x];
            cell.type = content;
            cell.regionID = this.regionID;
            //cell.data = this.regionID;
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


            //var startX = Math.floor(Math.random() * width);
            //var startY = Math.floor(Math.random() * height);

            //matrix[startY][startX].type = 'start';

            var rooms = Math.floor(width * height / 100);
            for (var i = 0; i < rooms + 3; i++) {
                this.placeRoom();
            }


            var cell;
            var i = 100;
            while ((cell = this.findEmptySpace()) && i-- > 0) {
                if (i == 0) {
                    debugger;
                }
                this.addRegion();
                this.maze(cell.x, cell.y);
            }

            this.placeDoors();

            this.removeDeadEnds();


            return this.matrix;


        }
    });

}());

