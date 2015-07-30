(function () {
    var tabsHash = {};

    _.getOrCreate = function (hash, key, defaultValue) {
        if (!hash[key]) {
            hash[key] = _.cloneDeep(defaultValue);
        }
        return hash[key];
    };

    var getHash = function (key) {
        return _.getOrCreate(tabsHash, key, {heads: [], bodies: []});
    };


    ViewModel.binds.tabsHead = function ($el, value) {
        var split = value.split(/\s*,\s*/);
        var key = split[0];
        var selector = split[1];
        var hash = getHash(key);
        hash.heads.push($el);
        $el.on('click', selector, function (e) {
            var index = $(e.currentTarget).index();
            _.each(hash.bodies, function ($container) {
                $container.children().eq(index).show().siblings().hide();
            });
        });
    };

    ViewModel.binds.tabsBody = function ($el, value) {
        getHash(value).bodies.push($el);
        $el.children().hide().eq(0).show();
    };

}());
