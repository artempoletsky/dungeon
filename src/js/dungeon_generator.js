_.rarity = function (objects, a) {
    a = a || 1;
    var random = Math.random() * a;
    objects = _.sortBy(objects, 'rarity');

    var result = _.find(objects, function (obj) {
        return obj.rarity > random;
    });

    if(result){
        return result.object;
    }
};

var DungeonTypes = {
    default: {
        backgrounds: [ 'bg1', 'bg2'],
        mapObjects: []
    }
};

var DungeonGenerator = Class.create({




    generateFromMatrix: function (matrix, location, level, quest) {
        var self = this;

        var roomCells = [];

        location = location || 'default';


        var dungeonSettings = DungeonTypes[location];


        _.eachMatrix(matrix, function (cell) {
            var Class;
            if (cell.type && cell.type != 'door') {
                Class = _.rarity(dungeonSettings.mapObjects, 100);
            }
            cell.class = Class;
            if (cell.type == 'room') {
                roomCells.push(cell);
            }

        });
        var entry = roomCells[rand(roomCells.length)];

        entry.class = 'Entry';

        var map = new Map({
            matrix: matrix,
            location: location,
            entryX: entry.x,
            entryY: entry.y,
            dungeonLevel: level
        });

        if (quest) {
            quest.prepareMap(map);
        }

        return map;
    },

    generate: function (size, location, level, quest) {

        var numberSize = 21;

        switch (size) {
            case 'Small':
                numberSize = 21;
                break;
            case 'Medium':
                numberSize = 35;
                break;
            case 'Big':
                numberSize = 51;
                break;
        }

        var matrix = InitalMazeGenerator.generate(numberSize, numberSize);
        return this.generateFromMatrix(matrix, location, level, quest);
    }
});