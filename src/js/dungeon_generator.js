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
                    DungeonGenerator.fill(w+x,h+y, 'room');
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

        maze: function (x, y) {
            var self = this;
            var neighbors = function (x, y) {
                var result = [];
                if (self.matrix[y - 2])
                    result.push(self.matrix[y - 2][x]);
                if (self.matrix[y + 2])
                    result.push(self.matrix[y + 2][x]);
                if (self.matrix[y][x - 2])
                    result.push(self.matrix[y][x - 2]);
                if (self.matrix[y][x + 2])
                    result.push(self.matrix[y][x + 2]);
                return result;
            }

            var current = self.matrix[y][x];
            if (current.content) {
                return;
            }
            self.fill(x, y, 'passage');


            this.eachRandom(neighbors(x, y), function (cell) {

                if (!cell.content) {

                    var wallX = (x + cell.x) / 2;
                    var wallY = (y + cell.y) / 2;
                    self.fill(wallX, wallY, 'passage');
                    self.maze(cell.x, cell.y);
                }
                ///self.maze(x, y);
            });


        },

        placeDoors: function () {

            var matrix = this.matrix;
            eachMatrix(matrix, function (element, x, y) {
                if (!element.content) {
                    if (matrix[y][x - 1] && matrix[y][x + 1])
                        if (matrix[y][x - 1].content && matrix[y][x + 1].content)
                            if (matrix[y][x - 1].regionID && matrix[y][x + 1].regionID)
                                if (matrix[y][x - 1].regionID != matrix[y][x + 1].regionID) {
                                    element.content = 'door';
                                }

                    if (matrix[y - 1] && matrix[y + 1])
                        if (matrix[y - 1][x].content && matrix[y + 1][x].content)
                            if (matrix[y - 1][x].regionID && matrix[y + 1][x].regionID)
                                if (matrix[y - 1][x].regionID != matrix[y + 1][x].regionID) {
                                    element.content = 'door';
                                }
                }

            });
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

            for (var i = 0; i < 10; i++) {
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

            eachMatrix(matrix, function (element, x, y) {
                $map.append('<div region="' + element.regionID + '" class="map_passage ' + element.content + '" style="left: ' + x * 20 + 'px; top:' + y * 20 + 'px;"></div>');
            });


        }
    });

    var goodFunction = DungeonGenerator.fill;
}());

