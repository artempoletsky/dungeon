$(function () {

        var mapObjects = {
            0: [undefined],//common
            1: ['chest', 'chest', 'chest', 'chest', 'chest', 'monster', 'monster', 'monster', 'monster', 'monster'],//uncommon
            2: ['trap'],//rare
            3: ['bossMonster']//legendary
        }
        var randomObject = function (minRarity, rarityHash) {
            var rand = Math.random();
            var rarity = 0;
            if (rand < 0.02) {
                rarity = 3;
            } else if (rand < 0.4 * 0.4) {
                rarity = 2;
            } else if (rand < 0.4) {
                rarity = 1;
            }

            if (rarity < minRarity) {
                rarity = minRarity;
            }

            var array = rarityHash[rarity];
            return array[Math.floor(Math.random() * array.length)];
        }

        var opDirs = {
            up: 'down',
            left: 'right',
            right: 'left',
            down: 'up'
        };

        var parts = [
            function () {

            }
        ]

        var drawMap = function (chain) {
            var $map = $('.map');
            $map.empty();
            console.log(chain);
            do {
                $map.append('<div class="map_passage ' + chain.content + '"></div>')
                chain = chain.next;
            } while (chain)
        }





        window.Game = Model.create({
            language: 'ru',
            initialize: function () {

                var playerParty = [];
                var monstersParty = [];

                for (var i = 0; i < 4; i++) {
                    var c = new Brigand(1);
                    c.enemy = false;
                    playerParty.push(c);
                    monstersParty.push(new BrigandScout(1));
                }


                Battlefield.on('endFight', function (e) {
                    if (e.party.length > 0) {
                        alert('win!');
                    } else {
                        alert('defeat!');
                    }
                });


                DungeonGenerator.generate(20, 20);
                //drawMap(chain(4));
                //console.log(chain(4));

                $('.battlefield').hide();

                //Battlefield.fight(playerParty, monstersParty);
                //enemy.invokeSpell(0, player, function(){});
            }
        });


    }
)
;


var Text = {};