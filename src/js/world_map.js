$(function () {
    window.WorldMap = ViewModel.create({
        el: '.world_map',
        shortcuts: {
            $team: '.team',
            $svg: 'svg'
        },
        events: {
            'mouseleave path': 'onPathLeave',
            'click path': 'onPathClick',
            'mouseenter path': 'onPathEnter'
        },
        onPathEnter: function (e) {

        },
        onPathLeave: function (e) {

        },
        onPathClick: function (e) {
            var id = e.currentTarget.id;
            if (Player.currentSave.currentLocation != id) {
                this.setLocation(id, true);
            } else {
                var data = this.regions[id];
                if (data.map) {
                    var self = this;
                    this.$el.hide();
                    Dungeon.startPredefined(data.map);
                }
            }

        },
        setLocation: function (regionID, animate) {
            Player.currentSave.currentLocation = regionID;
            var data = this.regions[regionID];
            var css = {
                left: data.median.x + 'px',
                top: data.median.y + 'px'
            };
            if (!animate)
                this.$team.css(css);
            else
                this.$team.animate(css);
        },
        getData: function (e) {
            return this.regions[e.currentTarget.id];
        },
        initialize: function () {
            this.$svg.empty();
            var self = this;
            Game.ready(function () {
                self.addRegionsFromSVG('main');
            });
        },
        addRegionsFromSVG: function (name) {
            var self = this;
            $(WorldMap.svg[name]).find('path').each(function (index) {
                self.addRegion(this, WorldMap.regions[name][index]);
            });
        },
        regions: {},
        regionsLength: 0,
        addRegion: function (element, data) {
            element.removeAttribute('style');
            element.id = data.id;
            this.regions[data.id] = data;
            data.index = this.regionsLength;
            this.$svg.append(element);
            this.regionsLength++;
        }
    });

    WorldMap.svg = {};
    WorldMap.regions = {};


});

