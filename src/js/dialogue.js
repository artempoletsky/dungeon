$(function () {
    window.Dialogs = ViewModel.create({
        el: '.dialogs',

        shortcuts: {
            $cue: '.cue',
            $answers: '.answers'
        },

        events: {
            'click a': 'answer'
        },

        dialogDepth: 0,
        answers: [],

        answer: function (e) {
            var answerIndex = $(e.currentTarget).parent().index();
            var answerObject = this.answers[this.dialogDepth][answerIndex];
            var answers = this.answers[this.dialogDepth];
            var cue = answerObject.npc;

            //console.log(this.answers[this.dialogDepth], answerIndex);

            if (answerObject.exit) {
                alert('end');
                return;
            }


            if (!answerObject.dontRemove) {
                answers.splice(answerIndex, 1);
            }

            if (answerObject.separate) {
                this.dialogDepth++;
                this.answers.push(answerObject.answers.slice(0));
                answers = answerObject.answers;
            } else if (answerObject.answers) {
                //insert new answers
                answers.splice.apply(answers, [answerIndex, 0].concat(answerObject.answers));
            }

            if (_.size(answers) == 0) {
                this.dialogDepth--;
                this.answers.pop();
                if (this.dialogDepth < 0) {
                    alert('end');
                } else {
                    answers = this.answers[this.dialogDepth];
                }
            }

            this.render(cue, answers);
        },

        start: function (dialog) {
            this.answers = [dialog.answers.slice(0)];
            this.dialogDepth = 0;
            this.render(dialog.npc, this.answers[0]);
        },
        getText: function (id) {
            return  Text[Game.language][id];
        },
        render: function (cue, answers) {
            var self = this;
            this.$cue.html(self.getText(cue));
            this.$answers.empty().append(_.foldl(answers, function (result, answerObject) {
                result += '<li><a>' + self.getText(answerObject.player) + '</a></li>';
                return result;
            }, ''))
        }
    });

    Dialogs.list = {};

});