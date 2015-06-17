$(function () {

    ViewModel.findBinds('.templates');

    var actionPointsBar = ViewModel.create({
        el: '.action_points_bar',
        show: function (points, active_points) {
            if (!active_points) {
                active_points = 0;
            }
            this.$el.empty();
            for (var i = 0; i < points - active_points; i++) {
                this.$el.append('<div class="action_point"></div>');
            }
            for (var i = 0; i < active_points; i++) {
                this.$el.append('<div class="action_point highlight"></div>');
            }
        }
    });

    window.Battlefield = ViewModel.create({
        el: '.battlefield',
        queue: [],
        index: 0,
        shortcuts: {
            $view: '.battlefield_view',
            $queue: '.turns_queue',
            $spells: '.spells'
        },


        renderCharacter: function (character) {
            var $view = $(ViewModel.tmpl.getRawTemplate('character'));

            if (character.enemy) {
                $view.addClass('enemy');
            }

            $view.find('.character_name').html(character.name);


            this.$view.append($view);

            var self = this;
            ViewModel.binds.style.call(ViewModel, $view.find('.health_bar'), '{width: healthBar}', character);

            character.on('damage', function (e) {
                if (this.prop('health') <= 0) {
                    this.off();
                    self.kill(this);
                }
                //self.updateCharacter(this, )

                //console.log(e);
            });
        },

        kill: function (character) {
            var positionIndex = this.all.indexOf(character);
            var queueIndex = this.queue.indexOf(character);
            this.all.splice(positionIndex, 1);
            this.$view.children().eq(positionIndex).remove();
            this.queue.splice(queueIndex, 1);
            this.$queue.children().eq(queueIndex).remove();

            if (character.enemy) {
                this.monstersParty.splice(this.monstersParty.indexOf(character), 1);
                if (this.monstersParty.length == 0) {
                    this.endFight();
                }
            } else {
                this.playerParty.splice(this.playerParty.indexOf(character), 1);
                if (this.playerParty.length == 0) {
                    this.endFight();
                }
            }
        },

        loot: [],

        playerParty: undefined,
        monstersParty: undefined,

        endFight: function () {

            this.fire('endFight', {
                party: this.playerParty,
                loot: this.loot
            });
        },

        fight: function (playerParty, monstersParty) {
            this.loot = [];
            this.playerParty = playerParty;
            this.monstersParty = monstersParty;
            this.all = playerParty.concat(monstersParty);
            var self = this;
            this.queue = _.sortBy(this.all, function (character) {
                return -(character.prop('initiative') + Math.floor(Math.random() * 10));
            });
            this.$view.empty();
            _.each(playerParty, self.renderCharacter, self);
            _.each(monstersParty, function (character) {
                self.renderCharacter(character);
            });

            this.$queue.empty();
            _.each(this.queue, function (character) {
                character.prop('actionPoints', character.prop('startAP'));
                self.$queue.append('<div class="' + (character.enemy ? 'enemy' : '') + '">' + character.name + '</div>');
            });
            this.turn();
        },
        endTurn: function () {
            var self = this;
            var ap = self.currentCharacter.prop('actionPoints');
            ap += self.currentCharacter.prop('apPerTurn');
            var maxAP = self.currentCharacter.prop('maxAP');
            if (ap > maxAP) {
                ap = maxAP;
            }
            self.currentCharacter.prop('actionPoints', ap);

            self.index++;
            if (self.index >= self.queue.length) {
                self.index = 0;
            }
            self.turn();
        },
        turn: function () {
            var self = this;
            var character = this.queue[this.index];

            this.$queue.children().removeClass('current').eq(self.index).addClass('current');

            var positionIndex = this.all.indexOf(character);
            this.$view.children().removeClass('current').eq(positionIndex).addClass('current');

            this.currentCharacter = character;

            if (character.enemy) {
                this.playerCharacter = undefined;
                character.ai.turn(character, function () {
                    self.endTurn();
                });
            } else {
                //player turn
                this.playerCharacter = character;


                actionPointsBar.show(character.prop('actionPoints'));

                var $spells = self.$spells.empty();

                _.each(character.spells, function (spell, index) {
                    $spells.append('<div class="spell character_spell">' + spell.name + '</div>');
                });
                $spells.append('<div class="spell end_turn">end</div>');
            }
        },


        onSpellClick: function (e) {
            var index = $(e.currentTarget).index();
            if (this.playerCharacter) {
                if (this.playerCharacter.enoughAP(index)) {
                    this.activeSpell = index;
                    this.$view.find('.enemy').addClass('highlight');
                }
            }
        },
        onSpellEnter: function (e) {
            var index = $(e.currentTarget).index();
            if (this.playerCharacter) {
                var spell = this.playerCharacter.spells[index];
                actionPointsBar.show(this.playerCharacter.prop('actionPoints'), spell.cost);
            }
        },
        onSpellLeave: function (e) {
            if (this.playerCharacter) {
                actionPointsBar.show(this.playerCharacter.prop('actionPoints'));
            }
        },
        onSpellInvoke: function (e) {
            var index = $(e.currentTarget).index();
            var target = this.all[index];
            this.playerCharacter.invokeSpell(this.activeSpell, target, function () {
            });
            actionPointsBar.show(this.playerCharacter.prop('actionPoints'));

            if (!this.playerCharacter.enoughAP(this.activeSpell)) {
                this.$view.find('.highlight').removeClass('highlight');
            }
        },
        onCharacterEnter: function (e) {
            var index = $(e.currentTarget).index();
            var character = this.all[index];
            var queueIndex = this.queue.indexOf(character);
            this.$queue.children().eq(queueIndex).addClass('highlight');
        },
        onCharacterLeave: function (e) {
            this.$queue.children().removeClass('highlight');
        },
        events: {
            'click .character_spell': 'onSpellClick',
            'click .highlight': 'onSpellInvoke',
            'click .end_turn': 'endTurn',
            'mouseenter .character_spell': 'onSpellEnter',
            'mouseleave .character_spell': 'onSpellLeave',
            'mouseenter .character_view': 'onCharacterEnter',
            'mouseleave .character_view': 'onCharacterLeave'
        }
    })
});
