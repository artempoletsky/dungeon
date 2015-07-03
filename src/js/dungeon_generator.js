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

        var map = new Map({
            matrix: matrix,
            backgroundClassName: this.backgroundImages[rand(this.backgroundImages.length)],
            entryX: entry.x,
            entryY: entry.y,
            dungeonLevel: level
        });

        if (quest) {
            quest.prepareMap(map);
        }

        return map;
    }
});