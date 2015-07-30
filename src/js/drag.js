$.fn.startDrag = function (options) {
    if (options.pageX) {
        options = {
            event: options
        }
    }

    var $el = this;
    var event = options.event;
    var startOffset = $el.offset();

    $el.css('position', options.isAbsolute ? 'absolute' : 'relative');

    $el.addClass('dragged');

    $el.offset(startOffset);
    var startX = event.pageX;
    var startY = event.pageY;

    $('body').on('mousemove.drag_move', function (e) {
        $el.offset({
            left: startOffset.left - startX + e.pageX,
            top: startOffset.top - startY + e.pageY
        });

        $el.trigger('drag');
        if (options.callback) {
            options.callback(e);
        }
    });


    this.trigger('startDrag');
    return this;
};

$.fn.stopDrag = function (resetPosition) {
    $('body').off('mousemove.drag_move');
    if (resetPosition) {
        this.css({
            position: '',
            left: '',
            top: ''
        });
    }
    this.trigger('stopDrag').removeClass('dragged');
    return this;
};

$.fn.sortableContainer = function (options) {
    var $self = this;

    if (!options.selector) {
        options = { selector: options};
    }

    var targetIndex;

    var dragCanceled = false;
    var $el;
    var oldIndex;
    $self.on('mousedown.sortable', options.selector, function (e) {

        e.preventDefault();
        dragCanceled = false;

        setTimeout(function () {
            if (dragCanceled) {
                return;
            }



            $el = $(e.currentTarget);
            oldIndex = $el.index();
            var width = $el.outerWidth();
            var height = $el.outerHeight();



            $el.before('<div id="sortable_helper" style="float: ' + $el.css('float') + ';width:' + $el.outerWidth(true) + 'px; height: ' + $el.outerHeight(true) + 'px;"></div>');



            var $helper = $('#sortable_helper');

            if(options.container){
                var helperHtml=$helper.clone().removeAttr('id').addClass('sortable_empty_helper')[0].outerHTML;
                $self.find(options.container+':empty').append(helperHtml);
            }

            var $children = $self.find(options.selector).add($self.find('.sortable_empty_helper'));

            var offsets = _.map($children, function (element) {
                return $(element).offset();
            });

            var helperIndex = $helper.index();

            $el.startDrag({
                isAbsolute: true,
                event: e,
                callback: function () {
                    var elOffset = $el.offset();
                    var minOffsetSum = Infinity;
                    var minIndex = -1;
                    _.each(offsets, function (offset, index) {

                        var offsetSum = Math.abs(offset.left - elOffset.left) + Math.abs(offset.top - elOffset.top);
                        if (offsetSum < minOffsetSum) {
                            minOffsetSum = offsetSum;
                            minIndex = index;
                        }
                    });


                    if (helperIndex < minIndex) {
                        $children.eq(minIndex).after($helper);
                    } else {
                        $children.eq(minIndex).before($helper);
                    }
                    targetIndex = minIndex;
                }
            });
        }, options.delay);

    });

    $('body').on('mouseup.sortable', function (e) {
        dragCanceled = true;


        if ($el) {
            var $helper = $('#sortable_helper')


            $helper.after($el);
            $helper.remove();

            $('.sortable_empty_helper').remove();

            $el.stopDrag(true);

            $self.trigger($.Event('sort', {
                oldIndex: oldIndex,
                newIndex: targetIndex
            }));
            $el = undefined;
        }


    });

    return this;
};