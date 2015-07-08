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


                $.ajax({
                    url: obj.file+'?'+Math.random(),

                    success: function (data) {
                        obj.callback(data);
                        if (self.loadingQueue.length) {
                            load();
                        } else {
                            self.isLoading = false;

                            if (!self.isReady) {
                                self.isReady = true;
                                self.fire('ready');
                            }
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        console.log(textStatus);
                        console.log(errorThrown);
                        console.log(obj.file);
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
    getText: function (id) {
        return  Text[this.language][id];
    },
    language: 'ru',

    ready: function (callback) {

        if (this.isReady) {
            callback.call(this);
        } else {
            this.one('ready', callback);
        }
    },
    config: undefined,
    initialize: function () {
        var self = this;
        $(function () {
            $.get('src/config.json', function (data) {
                self.config = data;
                _.each(data.modules, self.loadModule, self);
            });
        });
    }
});



var Text = {};

