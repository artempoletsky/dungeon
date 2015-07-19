Class.getClass = function (self, hash, defaultValue) {
    var result = defaultValue;
    _.each(hash, function (constructor, name) {
        if (self.constructor === constructor) {
            result = name;
            return false;
        }
    });
    return result;
};

window.MapCell = Class.extend({
    enter: function () {

    },
    className: '',
    type: '',
    x: 0,
    y: 0,
    sneak: 0,
    index: 0,
    visited: false,
    constructor: function (props) {
        this.x = props.x;
        this.y = props.y;
        this.className = props.type || 'wall';
        this.type = props.type || 'wall';
        this.index = props.index;
        this.map = props.map;
        if (props.data) {
            this.data = _.clone(props.data, true);
        } else {
            this.data = {};
        }

    },
    getClass: function () {
        return Class.getClass(this, MapCellClasses, 'MapCell');
    }
});

var MapCellClasses = {
    Entry: MapCell.extend({
        constructor: function (props) {
            this._super(props);
            this.className = 'entry';
        },
        context: {
            exit_from_dungeon: function () {
                Dungeon.finish();
            }
        },
        enter: function () {
            return this.context;
        }
    })
};


var Map = Class.extend({
    clearCell: function (x, y) {
        this.matrix[y][x] = new MapCell(this.matrix[y][x]);
    },
    /**
     * Возвращает ячейку которая не является стеной или false
     *
     * @param x
     * @param y
     * @returns {*}
     */
    getMovableCell: function (x, y) {
        if (!this.matrix[y] || !this.matrix[y][x]) {
            return false;
        }
        var cell = this.matrix[y][x];
        if (cell.type == 'wall') {
            return false;
        }
        return cell;
    },
    matrix: undefined,
    location: undefined,
    entryX: 0,
    entryY: 0,
    dungeonLevel: 0,
    /**
     * Возвращает ячейки вокруг заданной
     * @param x
     * @param y
     * @param range
     * @returns {Array}
     */
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
    eachCell: function (callback) {
        _.eachMatrix(this.matrix, callback);
    },
    constructor: function (data) {
        //this.matrix = data.matrix;
        var newMatrix = [];
        var i = 0;
        var self = this;

        this.location = data.location;
        this.entryX = data.entryX;
        this.entryY = data.entryY;
        this.dungeonLevel = data.dungeonLevel;

        _.eachMatrix(data.matrix, function (cell, x, y) {

            if (!newMatrix[y]) {
                newMatrix[y] = [];
            }
            var Class = MapCellClasses[cell.class] || MapCell;


            newMatrix[y][x] = new Class({
                x: x,
                y: y,
                type: cell.type,
                map: self,
                data: cell.data,
                index: i
            });

            i++;
        });
        this.width = newMatrix[0].length;
        this.height = newMatrix.length;


        this.matrix = newMatrix;
    },
    toJSON: function () {
        var cells = [];
        this.eachCell(function (cell, x, y) {
            if (cell.type != 'wall') {
                var obj = {
                    index: cell.index,
                    type: cell.type
                };
                var cellClass = cell.getClass();
                if (MapCellClasses[cellClass]) {
                    obj.class = cellClass;
                }
                if (cell.data) {
                    obj.data = cell.data;
                }
                cells.push(obj);
            }
        });
        return {
            entryY: this.entryY,
            entryX: this.entryX,
            width: this.width,
            height: this.height,
            location: this.location,
            cells: cells,
            dungeonLevel: this.dungeonLevel
        }
    }
});


Map.predefined = {};

Map.createMatrix = function (width, height) {
    var result = [];
    for (var y = 0; y < height; y++) {
        result[y] = [];
        for (var x = 0; x < width; x++) {
            result[y][x] = {}
        }
    }
    return result;
};

Map.fromJSON = function (data) {
    var matrix = Map.createMatrix(data.width, data.height);


    _.each(data.cells, function (cell) {
        var y = cell.index / data.width | 0;
        var x = cell.index % data.width;
        matrix[y][x] = cell;
    });

    return new Map({
        matrix: matrix,
        location: data.location,
        entryX: data.entryX,
        entryY: data.entryY,
        dungeonLevel: data.dungeonLevel
    });
}