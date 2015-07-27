_.whileAsync= function (cond, invokeFn, callback) {
    var cb = function () {
        var c=cond();
        if (c) {
            invokeFn(cb, c);
        } else {
            if(callback)
                callback();
        }
    }
    cb();
};

var CharacterAI = Class.extend({
    turn: function (self, callback) {
        var i = 0;
        _.whileAsync(function () {
            for(i=0;i<self.spells.length;i++){
                if(Battlefield.canUseSpell(self, i)){
                    return true;
                }
            }
            return false;
        }, function (callback) {
            var target = Player.party.at(0);
            if (target) {
                self.spells[i].invoke([target], callback);
            }
        }, callback);
    }
});



var stupid = new CharacterAI();
