'use strict';
var m = require('mithril');
module.exports = function () {
    var o = {};
    function init($options){
        o = $.extend({
            perPage: 50,
            step: 50,
            min: 50,
            max: 500,
            onStepChange: function(perPage, event) {}
        }, $options || {});
    }

    function stepUp() {
        if(o.perPage + o.step <= o.max){
            o.perPage += o.step;
            o.onStepChange.call(this, o.perPage);
        }
    }

    function stepDown() {
        if(o.perPage - o.step >= o.min){
            o.perPage -= o.step;
            o.onStepChange.call(this, o.perPage);
        }
    }

    function controller() {
        return {
            perPage: function () {
              return o.perPage;
            },
            stepUp: stepUp,
            stepDown: stepDown
        }
    }

    function view(ctrl) {
        return m("span", {class: "grid-tools__spinner"}, [
            m("input", {class: "spinner__input", type: "text", value: ctrl.perPage(), disabled: "disabled"}),
            m("div", {class: "spinner__button-container"}, [
                m("a", {class: "spinner__up-button", onclick: ctrl.stepUp}),
                m("a", {class: "spinner__down-button", onclick: ctrl.stepDown})
            ])
        ]);
    }

    return{
        init: init,
        controller: controller,
        view: view
    }
};