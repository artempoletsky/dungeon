$(function () {
    window.CharacterEditor = ViewModel.create({
        el: '.character_editor',
        shortcuts: {
            $attributes: '.ce-attributes',
            $name: 'input[name=name]',
            $expPoints: '.ce-exp_points',
            $attack: '.ce-attack',
            $dodge: '.ce-dodge',
            $actionPoints: '.ce-actionPoints',
            $health: '.ce-health'
        },
        events: {
            'click .ce-save': 'save',
            'click .ce-revert': 'revert',
            'click .ce-inc': 'onIncClick',
            'click .ce-dec': 'onDecClick',
            'click .ce-close': 'hide',
            'sort .ce-skill': 'onSort',
            'mousedown .ce-inc': 'disableSelect',
            'mousedown .ce-dec': 'disableSelect'
        },
        onSort: function (e) {
            var $el = $(e.currentTarget);
            var $parent = $el.parent();

        },
        hide: function () {
            this.$el.hide();
        },
        disableSelect: function (e) {
            e.preventDefault();
        },
        initialize: function () {
            this.$('.ce-skills_container').sortable({
                items: '.ce-skill',
                cancel: '.own',
                container: '.ce-skills_list'
            });
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


            var ownSkills = _.map(this.character.spells, function (spell) {
                return {
                    name: spell.name,
                    own: true,
                    class: spell.getClass()
                }
            });

            this.prop('ownSkills').reset(ownSkills);

            var availableSkills = _.map(Skills, function (Class, className) {
                return {
                    name: Class.prototype.name,
                    available: Class.prototype.availableForPlayer,
                    class: className
                }
            });
            availableSkills = _.filter(availableSkills, function (obj) {
                if (!obj.available) {
                    return false;
                }
                if (_.find(ownSkills, function (own) {
                    return own.name == obj.name;
                })) {
                    return false;
                }
                return true;
            });
            this.prop('availableSkills').reset(availableSkills);


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
        recalculateDerivedStats: function () {
            this.$attack.html(this.character.getBaseAttack());
            _.each(['maxHealth', 'dodge', 'apPerTurn', 'maxAP', 'startAP', 'initiative'], function (key) {
                this.prop(key, this.character.prop(key));
            }, this);

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
        autoParseBinds: true,
        defaults: {
            ownSkills: new Collection(),
            availableSkills: new Collection()
        },
        show: function (character, isInitial) {
            this.character = character || Player.mainCharacter;
            this.$el.show();

            this.renderAttributes();
            this.prop('isNotInitial', !isInitial);
            this.$name.val(this.character.name);


            this.revert();
        },
        savedProps: {},
        renderAttributes: function () {
            var $cont = this.$attributes.empty();
            var self = this;
            _.each(this.attributesList, function (attribute) {
                self.savedProps[attribute] = self.character.prop(attribute);
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
