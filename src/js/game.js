$(function () {
    window.Game = Model.create({
        language: 'ru',
        initialize: function () {

            var playerParty = [];
            var monstersParty =[];

            for(var i=0;i<4;i++){
                var c=new Brigand(1);
                c.enemy=false;
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


            Battlefield.fight(playerParty, monstersParty);
            //enemy.invokeSpell(0, player, function(){});
        }
    });
});


var Text = {};