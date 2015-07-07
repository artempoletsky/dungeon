$(function () {
    window.CharacterEditor = ViewModel.create({
        el: '.character_editor',
        shortcuts: {
            $attributes: '.ce-attributes',
            $name: 'input[name=name]',
            $expPoints: '.ce-exp_points',
            $attack: '.ce-attack',
            $dodge: '.ce-dodge',
            $health: '.ce-health'
        },
        events: {
            'click .ce-save': 'save',
            'click .ce-revert': 'revert',
            'click .ce-inc': 'onIncClick',
            'click .ce-dec': 'onDecClick',
            'click .ce-close': 'hide',
            'mousedown .ce-inc': 'disableSelect',
            'mousedown .ce-dec': 'disableSelect'
        },
        hide: function(){
            this.$el.hide();
        },
        disableSelect: function (e) {
            e.preventDefault();
        },
        revert: function (e) {
            if (e) {
                e.preventDefault();
            }
            var self = this;
            this.attributesPoints = this.character.prop('attributesPoints');
            this.$expPoints.html(this.attributesPoints);
            this.$attributes.find('input').each(function (index, input) {
                self.character.prop(input.name, self.savedProps[input.name]);
                input.value = self.savedProps[input.name];
            });
            this.recalculateDerivedStats();
        },
        changeAttribute: function ($input, add) {
            if (this.attributesPoints - add < 0) {
                return;
            }
            var val = $input.val() * 1;
            var name = $input.attr('name');
            if (val + add < this.savedProps[name]) {
                return;
            }
            if (val + add > Character.ATTRIBUTE_CAP) {
                return;
            }
            $input.val(val + add);
            this.character.prop(name, val + add);
            this.attributesPoints -= add;
            this.$expPoints.html(this.attributesPoints);
            this.recalculateDerivedStats();
        },
        recalculateDerivedStats: function(){
            this.character.reset();
            this.$attack.html(this.character.getBaseAttack());
            this.$health.html(this.character.prop('maxHealth'));
            this.$dodge.html(this.character.prop('dodge'));
        },
        onIncClick: function (e) {
            this.changeAttribute($(e.currentTarget).prev(), 1);
        },
        onDecClick: function (e) {
            this.changeAttribute($(e.currentTarget).next(), -1);
        },
        save: function (e) {
            e.preventDefault();
            var self = this;
            _.each(this.$el.find('input'), function (obj) {
                var name = obj.name;
                if (name != 'name') {
                    self.character.prop(name, obj.value * 1);
                } else {
                    self.character.name = obj.value;
                }
            });
            self.character.prop('attributesPoints', this.attributesPoints);
        },
        attributesList: ['strength', 'agility', 'perception', 'speed'],
        show: function (isInitial) {
            this.character = Player.mainCharacter;
            this.$el.show();
            //console.log(Spells);
            this.renderAttributes();
            this.$name.val(this.character.name);
            this.revert();
        },
        savedProps: {},
        renderAttributes: function () {
            var $cont = this.$attributes.empty();
            var self=this;
            _.each(this.attributesList, function (attribute) {
                self.savedProps[attribute]=self.character.prop(attribute);
                $cont.append('<div class="ce-attribute">' +
                    '<label>' + attribute + '</label> ' +
                    '<span class="ce-num"> <i class="ce-dec">-</i> ' +
                    '<input name="' + attribute + '" class="ce-value" value="" disabled="disabled"/> ' +
                    '<i class="ce-inc">+</i>' +
                    '</span></div>');
            });
        }
    });
});
