$(function () {
    window.MainMenu = ViewModel.create({
        el: '.main_menu',
        shortcuts: {
            $list: '.main_menu_list',
            $savesMenu: '.saves_menu',
            $savesList: '.saves',
            $saveName: '.save_name input'
        },
        events: {
            'click a': 'runAction',
            'click .sm-save_game': 'saveGame',
            'click .saves li': 'chooseSave',
            'click .sm-cancel': 'cancelSave'
        },
        chooseSave: function (e) {
            var index = $(e.currentTarget).index();
            if (this.savesMenuMode) {
                this.choosenSaveId = index;
                this.$saveName.val(Player.getSaves()[index].name);
            } else {
                Player.loadGame(index);
                this.cancelSave();
                this.$el.hide();
            }
        },
        saveGame: function () {
            Player.saveGame(this.choosenSaveId, this.$saveName.val());
            this.cancelSave();
            this.$el.hide();
        },
        cancelSave: function () {
            this.$savesMenu.hide();
        },
        showSavesMenu: function (isSave) {
            this.savesMenuMode = isSave;
            this.choosenSaveId = undefined;
            this.$savesMenu.show();
            if (isSave) {
                this.$savesMenu.addClass('save_mode');
                this.$saveName.val('Untitled');
            } else {
                this.$savesMenu.removeClass('save_mode');
            }

            var $list = this.$savesList.empty();
            _.each(Player.getSaves(), function (save, index) {
                $list.append('<li>' + save.name + '</li>')
            });
        },
        runAction: function (e) {
            var index = $(e.currentTarget).parent().index();
            this.elements[index].action.call(this);
        },
        elements: [
            {
                text: 'continue_game',
                action: function () {
                    if (this.isPause) {
                        this.$el.hide();
                    }
                }
            },
            {
                text: 'start_new_game',
                action: function () {
                    $('.scene').hide();
                    Player.newGame();
                    this.$el.hide();
                }
            },
            /*{
             text: 'tutorial',
             action: function () {

             }
             }, */
            {
                text: 'load_game',
                action: function () {
                    this.showSavesMenu(false);
                }
            },
            {
                text: 'save_game',
                action: function () {
                    this.showSavesMenu(true);
                }
            },
            {
                text: 'exit',
                action: function () {

                }
            }
        ],
        onKeyUp: function (e) {

            if (e.key == "F4") {
                if (this.$el.css('display') != 'block') {
                    this.show(true);
                }
            }
        },
        show: function (isPause) {
            this.isPause = isPause;
            if (isPause) {
                this.$save.show();
            } else {
                this.$save.hide();
            }
            if (Player.getSaves().length == 0) {
                this.$continue.hide();
                this.$load.hide();
            } else {
                this.$continue.show();
                this.$load.show();
            }

            if (isPause) {
                this.$continue.show();
            }
            this.$el.show();
        },
        render: function () {
            this.$list.empty();
            _.each(this.elements, function (obj) {
                this.$list.append('<li class="' + obj.text + '"><a>' + Game.getText(obj.text) + '</a></li>');
            }, this);
        },
        initialize: function () {
            var self = this;
            Game.ready(function () {
                self.render();
                self.$save = self.$('.save_game');
                self.$load = self.$('.load_game');
                self.$continue = self.$('.continue_game');
                self.show();
                $('body').on('keyup', function (e) {
                    self.onKeyUp(e);
                });
            });
        }
    });


    window.SceneMenu = ViewModel.create({
        el: '.scene_menu',
        events: {
            'click .show_main_menu': 'showMainMenu',
            'click .show_character_menu': 'showCharacterMenu',
            'click .show_journal': 'showJournal'
        },
        showMainMenu: function () {
            MainMenu.show(true);
        },
        showCharacterMenu: function () {
            CharacterEditor.show(false);
        },
        showJournal: function () {
            // CharacterEditor.show(false);
        }
    });
});