window.MapCell = Class.extend({
    enter: function () {

    },
    dungeonLevel: 0,
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
        this.className = props.className || 'wall';
        this.type = props.type;
        this.index = props.index;
        this.dungeonLevel = props.dungeonLevel;
        this.data = props.data;
    },
    getClass: function () {
        var result = 'MapCell';
        var self = this;
        _.each(MapCellClasses, function (constructor, name) {
            if (self instanceof constructor) {
                result = name;
                return false;
            }
        });
        return result;
    }
});

var MapCellClasses = {};


var Map = Class.extend({
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
        if (cell.className == 'wall') {
            return false;
        }
        return cell;
    },
    matrix: undefined,
    backgroundClassName: undefined,
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
        _.eachMatrix(data.matrix, function (cell, x, y) {

            if (!newMatrix[y]) {
                newMatrix[y] = [];
            }
            var Class = MapCellClasses[cell.class] || MapCell;


            newMatrix[y][x] = new Class({
                x: x,
                y: y,
                type: cell.type,
                className: cell.className,
                dungeonLevel: data.dungeonLevel,
                data: cell.data,
                index: i
            });

            i++;
        });
        this.backgroundClassName = data.backgroundClassName;
        this.entryX = data.entryX;
        this.entryY = data.entryY;

        var entry = newMatrix[data.entryY][data.entryX];
        entry.className = 'entry';
        newMatrix[entry.y][entry.x] = new MapCell(entry);

        this.matrix = newMatrix;
    },
    toJSON: function () {
        var cells = [];
        this.eachCell(function (cell, x, y) {
            if (cell.className != 'wall') {
                var obj = {
                    index: cell.index,
                    className: cell.className,
                    type: cell.type
                };
                if (MapCellClasses[cell.class]) {
                    obj.class = cell.class;
                }
                if (cell.data) {
                    obj.data = cell.data;
                }
                cells.push(obj);
            }
        });
        return {
            width: this.matrix[0].length,
            height: this.matrix.length,
            cells: cells
        }
    }
});


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
    var entryX, entryY;

    _.each(data.cells, function (cell) {
        var y = cell.index / data.width | 0;
        var x = cell.index % data.width;

        matrix[y][x] = cell;
        if (cell.className == 'entry') {
            entryX = x;
            entryY = y;
        }
    });

    return new Map({
        matrix: matrix,
        //backgroundClassName: this.backgroundImages[rand(this.backgroundImages.length)],
        entryX: entryX,
        entryY: entryY
        //dungeonLevel: level
    });
}