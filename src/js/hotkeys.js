(function () {
    var eventsBinded = false;
    var hotkeys = [];
    var vm;
    var bind = function () {
        eventsBinded = true;
        var pressed = [];
        $('body').keydown(function (e) {
            var key = e.key.toLowerCase();

            //console.log(pressed);
            if (pressed.indexOf(key) == -1) {
                pressed.push(key);
            }
        }).keyup(function (e) {
                var key = e.key.toLowerCase();
                if (vm) {
                    var combination = pressed.join('+');
                    //console.log(combination ,hotkeys);
                    if (pressed.length > 1 && hotkeys.indexOf(combination) != -1) {
                        vm.$el.trigger('key:' + combination);
                    }
                    vm.$el.trigger('key:' + key);
                }
                _.pull(pressed, key);
            });
    };

    window.HotKeys = {
        focus: function (viewModel) {
            if (!eventsBinded) {
                bind();
            }
            vm = viewModel;
            hotkeys = (viewModel.hotkeys || '').split(/\s+/);
        }
    };
}());
