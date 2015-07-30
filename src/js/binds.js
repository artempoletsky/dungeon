(function () {
    var tabsHash = {};

    _.getOrCreate = function (hash, key, defaultValue) {
        if (!hash[key]) {
            hash[key] = _.cloneDeep(defaultValue);
        }
        return hash[key];
    };

    var defaultHash = {heads: [], bodies: []};


    ViewModel.binds.tabsHead = function ($el, value) {
        var split = value.split(/\s*,\s*/);
        var key = split[0];
        var selector = split[1];
        var hash = _.getOrCreate(tabsHash, key, defaultHash);
        hash.heads.push($el);
        $el.on('click', selector, function (e) {
            var index = $(e.currentTarget).index();
            _.each(hash.bodies, function ($container) {
                $container.children().eq(index).show().siblings().hide();
            });
        });
    };

    ViewModel.binds.tabsBody = function ($el, value) {
        _.getOrCreate(tabsHash, value, defaultHash).bodies.push($el);
        $el.children().hide().eq(0).show();
    };

}());
