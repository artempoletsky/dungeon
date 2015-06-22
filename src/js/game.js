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







        window.Game = Model.create({
            rand: function(max){
                return Math.floor(Math.random() * max);
            },
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


                var map=DungeonGenerator.generate(20, 20);


                Dungeon.start(map);

                $('.battlefield').hide();

                //Battlefield.fight(playerParty, monstersParty);
                //enemy.invokeSpell(0, player, function(){});
            }
        });


    }
)
;


var Text = {};