window.Game = Model.create({
    modulesPath: 'modules/',
    dungeonEditorMode: false,
    loadFile: function (moduleName, file, type) {
        if (type == 'js') {
            $('head').append('<script src="' + this.modulesPath + moduleName + '/js/' + file + '.js' + '" type="text/javascript"></script>')
        } else if (type == 'css') {
            $('head').append('<link rel="stylesheet" href="' + this.modulesPath + moduleName + '/css/' + file + '.css' + '"/>');
        }
    },
    loadWorldMap: function (moduleName, file) {
        this.load(this.modulesPath + moduleName + '/data/world_map/' + file + '.svg', function (data) {
            WorldMap.svg[file] = data;
        });

        this.load(this.modulesPath + moduleName + '/data/world_map/' + file + '.json', function (data) {
            WorldMap.regions[file] = data;
        });
    },
    loadMap: function (moduleName, file) {
        this.loadJson(moduleName, 'maps/' + file, function (data) {
            Map.predefined[file] = data;
        });
    },
    loadDialogs: function (moduleName, file) {
        this.loadJson(moduleName, file, function (data) {
            _.extend(Dialogs.list, data);
        });
    },
    loadLang: function (moduleName, file, language) {
        this.loadJson(moduleName, 'lang/' + file, function (data) {
            if (!Text[language]) {
                Text[language] = {};
            }
            _.extend(Text[language], data);
        });
    },
    loadJson: function (moduleName, file, callback) {
        this.load(this.modulesPath + moduleName + '/data/' + file + '.json', callback);
    },
    loadingQueue: [],
    isLoading: false,
    isReady: false,
    load: function (file, callback) {
        this.loadingQueue.push({
            file: file,
            callback: callback
        });
        if (!this.isLoading) {
            this.isLoading = true;
            var self = this;

            var load = function () {
                var obj = self.loadingQueue.shift();

                $.get(obj.file, function (data) {
                    obj.callback(data);
                    if (self.loadingQueue.length) {
                        load();
                    } else {
                        self.isLoading = false;

                        if (!self.isReady) {
                            self.isReady=true;
                            self.fire('ready');
                        }
                    }
                });
            };
            load();
        }
    },
    loadModule: function (name) {
        var self = this;
        $.get(this.modulesPath + name + '/module.json', function (data) {
            _.each(data.js, function (file) {
                self.loadFile(name, file, 'js');
            });

            _.each(data.css, function (file) {
                self.loadFile(name, file, 'css');
            });

            _.each(data.dialogs, function (file) {
                self.loadDialogs(name, file);
            });

            _.each(data.language, function (language, file) {
                self.loadLang(name, file, language);
            });

            _.each(data.maps, function (file) {
                self.loadMap(name, file);
            });

            _.each(data.worldMap, function (file) {
                self.loadWorldMap(name, file);
            });
        });
    },
    rand: function (max) {
        return Math.floor(Math.random() * max);
    },
    language: 'ru',

    ready: function (callback) {

        if (this.isReady) {
            callback.call(this);
        } else {
            this.one('ready', callback);
        }
    },
    initialize: function () {
        var self = this;
        $(function(){
            $.get('src/modules.json', function (data) {
                _.each(data, self.loadModule, self);
            });
        });
    }
});


Game.ready(function () {
    if (Game.dungeonEditorMode) {
        return;
    }

    var playerParty = [];


    for (var i = 0; i < 4; i++) {
        var c = new MonsterClasses.Brigand(1);
        c.enemy = false;
        playerParty.push(c);
    }

    //

    Player.newGame();

    Player.party = playerParty;

    //WorldMap.setLocation("whiterun");

    //Player.saveGame(0);
    //Player.loadGame(0);
    //Dungeon.start();
    //CharacterEditor.show(Player.mainCharacter, true);


    //Battlefield.fight(playerParty, MapCellClasses.Monster.makeParty(MonsterParties.smallSpidersParty.party,1));
    //return;

    var $form = $('.dungeon_generator');

    $form.find('button').click(function (e) {
        e.preventDefault();
        var formResult = _.foldl($form.serializeArray(), function (result, obj) {
            result[obj.name] = obj.value;
            return result;
        }, {});


        var map = DungeonGenerator.generate(formResult.size, 'default', formResult.level);
        $form.hide();
        Dungeon.start(map);
    });

    /*
     Dialogs.start(Dialogs.list.example);*/
});
//


var Text = {};

