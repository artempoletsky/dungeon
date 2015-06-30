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
    getMovableCell: function(x, y){
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

            if (!newMatrix[cell.y]) {
                newMatrix[cell.y] = [];
            }
            var Class = MapCellClasses[cell.class] || MapCell;


            newMatrix[cell.y][cell.x] = new Class({
                x: x,
                y: y,
                type: cell.content,
                className: cell.content,
                dungeonLevel: data.dungeonLevel,
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
    }
});


var DungeonGenerator = Class.create({
    backgroundImages: ['bg1', 'bg2'],
    mapObjects: {
        0: [undefined],//common
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
    entry: undefined,


    generate: function (size, level, quest) {

        var self = this;
        var numberSize = 20;

        switch (size) {
            case 'Small':
                numberSize = 20;
                break;
            case 'Medium':
                numberSize = 35;
                break;
            case 'Big':
                numberSize = 50;
                break;
        }

        var matrix = InitalMazeGenerator.generate(numberSize, numberSize);
        var roomCells = [];

        _.eachMatrix(matrix, function (cell) {
            var Class;
            if (cell.content && cell.content != 'door') {
                Class = self.randomMapObject(0, self.mapObjects);
            }
            cell.class = Class;
            if (cell.content == 'room') {
                roomCells.push(cell);
            }

        });
        var entry = roomCells[rand(roomCells.length)];

        var map= new Map({
            matrix: matrix,
            backgroundClassName: this.backgroundImages[rand(this.backgroundImages.length)],
            entryX: entry.x,
            entryY: entry.y,
            dungeonLevel: level
        });

        if(quest){
            quest.prepareMap(map);
        }

        return map;
    }
});