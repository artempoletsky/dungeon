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
            $playerParty: '.player_party',
            $monstersParty: '.monsters_party',
            $queue: '.turns_queue',
            $spells: '.spells'
        },


        initialize: function () {

            this.$info = $('.info_box');
        },

        renderCharacter: function (character) {
            var $view = $(ViewModel.tmpl.getRawTemplate('character'));
            $view.find('.character_image').addClass(character.name);

            if (character.enemy) {
                $view.addClass('enemy');
                this.$monstersParty.append($view);
            } else {
                this.$playerParty.append($view);
            }


            var self = this;
            ViewModel.binds.style.call(ViewModel, $view.find('.health_bar'), '{width: healthBar}', character);

            character.on('damage', function (e) {
                if (this.prop('health') <= 0) {
                    this.off();
                    self.kill(this);
                }
                //self.updateCharacter(this, )

            });
        },

        getView: function (character) {
            var $cont = character.enemy ? this.$monstersParty : this.$playerParty;
            return $cont.children().eq(this.getRank(character));
        },

        getRank: function (character) {
            var party = character.enemy ? this.monstersParty : this.playerParty;
            return party.indexOf(character);
        },

        getCharacter: function ($view) {
            var index = $view.index();
            var party = $view.hasClass('enemy') ? this.monstersParty : this.playerParty;
            return party[index];
        },

        kill: function (character) {

            var queueIndex = this.queue.indexOf(character);

            this.getView(character).remove();
            this.queue.splice(queueIndex, 1);
            this.$queue.children().eq(queueIndex).remove();

            var party = character.enemy ? this.monstersParty : this.playerParty;

            party.splice(party.indexOf(character), 1);


            /*
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
             }      */
        },

        loot: [],

        playerParty: undefined,
        monstersParty: undefined,

        endFight: function () {
            this.$el.hide();
            this.fire('endFight', {
                party: this.playerParty,
                loot: this.loot
            });
            $('body').removeClass(this.backgroundClassName);
        },

        fight: function (monstersParty, backgrounds) {
            var playerParty = Player.party;
            if (backgrounds) {
                this.backgroundClassName = backgrounds[rand(backgrounds.length)];
                $('body').addClass(this.backgroundClassName);
            }


            this.$el.show();
            this.loot = [];
            this.playerParty = playerParty;
            this.monstersParty = monstersParty;
            var all = playerParty.concat(monstersParty);
            var self = this;

            this.queue = _.sortBy(all, function (character) {
                return -(character.prop('initiative') + Math.floor(Math.random() * 10));
            });

            this.$playerParty.empty();
            this.$monstersParty.empty();
            _.each(playerParty, self.renderCharacter, self);
            _.each(monstersParty, function (character) {
                self.renderCharacter(character);
            });

            this.$queue.empty();
            _.each(this.queue, function (character) {
                character.prop('actionPoints', character.prop('startAP'));
                self.$queue.append('<div class="queue_item ' + character.name + ' ' + (character.enemy ? 'enemy' : '') + '"></div>');
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


            self.$playerParty.find('.move_highlight').removeClass('move_highlight');
            self.index++;
            if (self.index >= self.queue.length) {
                self.index = 0;
            }


            var party = self.currentCharacter.enemy ? this.playerParty : this.monstersParty;
            if (party.length == 0) {
                this.endFight();
            } else {
                self.turn();
            }

        },
        turn: function () {
            var self = this;
            var character = this.queue[this.index];

            this.$queue.children().removeClass('current').eq(self.index).addClass('current');

            this.$view.find('.current').removeClass('current');
            this.getView(character).addClass('current');

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
                    var inactive = self.canUseSpell(character, index) ? '' : ' inactive';
                    $spells.append('<div class="spell character_spell' + inactive + '">' + spell.name + '</div>');
                });
                $spells.append('<div class="spell switch_position">switch</div>');
                $spells.append('<div class="spell end_turn">end</div>');

                if (character.lastUsedSpell !== undefined) {
                    $spells.children().eq(character.lastUsedSpell).click();
                }

            }
        },

        canUseSpell: function (character, spell_id) {
            if (!character.spells[spell_id]) {
                return false;
            }
            if (!character.enoughAP(spell_id)) {
                return false;
            }
            var spell = character.spells[spell_id];


            var party = this.playerParty;
            var enemyParty = this.monstersParty;
            if (character.enemy) {
                party = this.monstersParty;
                enemyParty = this.playerParty;
            }
            var rank = party.indexOf(character) + 1;
            if (spell.posFrom.indexOf(rank) == -1) {
                return false;
            }


            for (var i = 0; i < spell.posTo.length; i++) {
                if (enemyParty[spell.posTo[i] - 1]) {
                    return true;
                }
            }
            return false;
        },

        highlightRanks: function (isEnemy, ranks, aoe) {
            var $cont = isEnemy ? this.$monstersParty : this.$playerParty;
            _.each(ranks, function (rank) {
                $cont.children().eq(rank - 1).addClass('highlight');
            });
        },

        onSpellClick: function (e) {
            var $button = $(e.currentTarget);
            var index = $button.index();
            if (this.playerCharacter && !$button.hasClass('inactive')) {
                this.$playerParty.find('.move_highlight').removeClass('move_highlight');
                if (this.playerCharacter.enoughAP(index)) {
                    this.activeSpell = index;
                    this.playerCharacter.lastUsedSpell = index;
                    var spell = this.playerCharacter.spells[index];
                    this.highlightRanks(spell.targetEnemy, spell.posTo, spell.aoe);
                    //this.$view.find('.enemy').addClass('highlight');
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
            var target = this.getCharacter($(e.currentTarget));
            var self = this;
            this.playerCharacter.invokeSpell(this.activeSpell, target, function () {
                if (self.playerCharacter.prop('actionPoints') == 0) {
                    self.endTurn();
                }
            });
            actionPointsBar.show(this.playerCharacter.prop('actionPoints'));

            if (!this.playerCharacter.enoughAP(this.activeSpell)) {
                this.$view.find('.highlight').removeClass('highlight');
            }
        },
        onCharacterEnter: function (e) {
            var $view = $(e.currentTarget);
            var index = $view.index();
            var character = $view.hasClass('enemy') ? this.monstersParty[index] : this.playerParty[index];
            var queueIndex = this.queue.indexOf(character);
            var $queueView = this.$queue.children().eq(queueIndex);


            $queueView.addClass('highlight');

            var propsToShow = ['res_physical', 'initiative', 'actionPoints'];

            this.$info.empty().show().offset($view.offset());

            if (character.enemy && this.activeSpell !== undefined) {
                var spell = this.currentCharacter.spells[this.activeSpell];
                var chanceToHit = spell.computeHitChance(this.currentCharacter, character, false);

                var minDamage = _.foldl(spell.getMinDamage(this.currentCharacter, character), function (sum, damage, type) {
                    return sum + damage;
                }, 0);
                var maxDamage = _.foldl(spell.getMaxDamage(this.currentCharacter, character), function (sum, damage, type) {
                    return sum + damage;
                }, 0);

                this.$info.append(this.generateInfoRow('Attack', spell.getAttack(this.currentCharacter)));
                this.$info.append(this.generateInfoRow('Chance to hit', chanceToHit + '%'));
                this.$info.append(this.generateInfoRow('Damage', minDamage + '-' + maxDamage));

            }


            this.$info.append(this.generateInfoRow('Health', character.prop('health') + '/' + character.prop('maxHealth')));
            for (var i = 0; i < propsToShow.length; i++) {
                this.$info.append(this.generateInfoRow(propsToShow[i], character.prop(propsToShow[i])));
            }
        },

        generateInfoRow: function (name, value) {
            return '<li><label>' + name + ':</label> ' + value + '</li>';
        },
        onCharacterLeave: function (e) {
            this.$queue.children().removeClass('highlight');
            this.$info.hide();
        },
        onSwitchPosition: function () {
            if (this.playerCharacter) {
                this.$view.find('.highlight').removeClass('highlight');
                actionPointsBar.show(this.playerCharacter.prop('actionPoints'), 1);

                var index = this.playerParty.indexOf(this.playerCharacter);
                var $party = this.$playerParty.children();
                var newIndex;
                for (var i = 1; i <= this.playerCharacter.prop('speedForward'); i++) {
                    newIndex = index - i;
                    if (newIndex >= 0) {
                        $party.eq(newIndex).addClass('move_highlight');
                    }
                }
                for (var i = 1; i <= this.playerCharacter.prop('speedBack'); i++) {
                    newIndex = index + i;
                    if (newIndex < $party.length) {
                        $party.eq(newIndex).addClass('move_highlight');
                    }
                }
                //var spell = this.playerCharacter.spells[index];
                //actionPointsBar.show(this.playerCharacter.prop('actionPoints'), spell.cost);
            }
        },

        move: function (character, newIndex) {
            if (character.prop('actionPoints') == 0) {
                this.endTurn();
                return;
            }
            character.propAdd('actionPoints', -1);

            var party = character.enemy ? this.monstersParty : this.playerParty;
            var $cont = character.enemy ? this.$monstersParty : this.$playerParty;
            var oldIndex = party.indexOf(character);


            var $view = this.getView(character);

            var $target = $cont.children().eq(newIndex);
            if (newIndex < oldIndex) {
                $target.before($view);
            } else {
                $target.after($view);
            }


            party.splice(oldIndex, 1);
            party.splice(newIndex, 0, character);
        },
        onMove: function (e) {
            this.$playerParty.find('.move_highlight').removeClass('move_highlight');
            this.move(this.playerCharacter, $(e.currentTarget).index());
            this.onSwitchPosition();
        },
        events: {
            'click .character_spell': 'onSpellClick',
            'click .highlight': 'onSpellInvoke',
            'click .end_turn': 'endTurn',
            'click .switch_position': 'onSwitchPosition',
            'click .move_highlight': 'onMove',
            'mouseenter .character_spell': 'onSpellEnter',
            'mouseleave .character_spell': 'onSpellLeave',
            'mouseenter .character_view': 'onCharacterEnter',
            'mouseleave .character_view': 'onCharacterLeave'
        }
    })
});
