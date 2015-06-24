$(function () {


    window.Game = Model.create({
        modulesPath: 'modules/',
        loadFile: function (moduleName, file, type) {
            if (type == 'js') {
                $('head').append('<script src="' + this.modulesPath + moduleName + '/js/' + file + '.js' + '" type="text/javascript"></script>')
            } else if (type == 'css') {
                $('head').append('<link rel="stylesheet" href="' + this.modulesPath + moduleName + '/css/' + file + '.css' + '"/>');
            } else if (type == 'dialogs') {
                this.load(this.modulesPath + moduleName + '/data/' + file + '.json', function (data) {
                    _.extend(Dialogs.list, data);
                });
            }
        },
        loadLang: function (moduleName, file, language) {
            this.load(this.modulesPath + moduleName + '/data/lang/' + file + '.json', function (data) {
                if (!Text[language]) {
                    Text[language] = {};
                }
                _.extend(Text[language], data);
            });
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
                            if(!self.isReady){
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
                    self.loadFile(name, file, 'dialogs');
                });

                _.each(data.language, function (language, file) {
                    self.loadLang(name, file, language);
                });
            });
        },
        rand: function (max) {
            return Math.floor(Math.random() * max);
        },
        language: 'ru',

        ready: function(calback){
            if(this.isReady){
                calback.call(this);
            }else {
                this.one('ready', calback);
            }
        },
        initialize: function () {
            var self = this;
            $.get('src/modules.json', function (data) {
                _.each(data, self.loadModule, self);
            });
        }
    });


    Game.ready(function(){
        var playerParty = [];
        var monstersParty = [];

        for (var i = 0; i < 4; i++) {
            var c = new Brigand(1);
            c.enemy = false;
            playerParty.push(c);
            monstersParty.push(new BrigandScout(1));
        }


        Battlefield.on('endFight', function (e) {
            if (e.party.length > 0) {
                alert('win!');
            } else {
                alert('defeat!');
            }
        });


        var map = DungeonGenerator.generate(20, 20);


        Dungeon.start(map);

        $('.battlefield').hide();

        Dialogs.start(Dialogs.list.example);
    });
    //
});


var Text = {};

