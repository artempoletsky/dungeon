var CharacterAI = Class.extend({
    turn: function (self, callback) {
        var i = 0;
        this.whileAsync(function () {
            for(i=0;i<self.spells.length;i++){
                if(Battlefield.canUseSpell(self, i)){
                    return true;
                }
            }
            return false;
        }, function (callback) {
            var target = Battlefield.playerParty[0];
            if (target) {
                self.invokeSpell(i, target, callback);
            }
        }, callback);
    },
    whileAsync: function (cond, invokeFn, callback) {
        var cb = function () {
            if (cond()) {
                invokeFn(cb);
            } else {
                callback();
            }
        }
        cb();
    }
});

var stupid = new CharacterAI();
