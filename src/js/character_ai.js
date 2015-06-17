var CharacterAI = Class.extend({
    turn: function (self, callback) {
        this.whileAsync(function () {
            return self.enoughAP(0);
        }, function (callback) {
            var target = Battlefield.playerParty[0];
            if(target){
                self.invokeSpell(0, target, callback);
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
