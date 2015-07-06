$(function () {
    window.MainMenu = ViewModel.create({
        el: '.main_menu',
        shortcuts: {
            $list: '.main_menu_list'
        },
        events: {
            'click a': 'runAction'
        },
        runAction: function (e) {
            var index = $(e.currentTarget).index();
            this.elements[index].action.call(this);
        },
        elements: [
            {
                text: 'continue_game',
                action: function () {

                }
            },
            {
                text: 'start_new_game',
                action: function () {

                }
            },
            {
                text: 'tutorial',
                action: function () {

                }
            },
            {
                text: 'load_game',
                action: function () {

                }
            },
            {
                text: 'save_game',
                action: function () {

                }
            },
            {
                text: 'exit',
                action: function () {

                }
            }
        ],
        show: function (isPause) {

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
            });
        }
    });
});