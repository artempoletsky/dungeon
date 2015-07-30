(function () {
    var tabsHash = {};

    _.getOrCreate = function (hash, key, defaultValue) {
        if (!hash[key]) {
            hash[key] = defaultValue;
        }
        return hash[key];
    };

    ViewModel.binds.tabsHead = function ($el, value) {
        var split = value.split(/\s*,\s*/);
        var key = split[0];
        var selector = split[1];
        var hash = _.getOrCreate(tabsHash, key, {heads: [], bodies: []});
        hash.heads.push($el);
        $el.on('click', selector, function (e) {
            var index = $(e.currentTarget).index();
            _.each(hash.bodies, function ($container) {
                $container.children().eq(index).show().siblings().hide();
            });
        });
    };

    ViewModel.binds.tabsBody = function ($el, value) {
        var hash = _.getOrCreate(tabsHash, value, {heads: [], bodies: []});
        hash.bodies.push($el);
        $el.children().hide().eq(0).show();
    };

}());
