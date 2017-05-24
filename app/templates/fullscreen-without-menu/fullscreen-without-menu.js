'use strict';
var m = require('mithril');
module.exports = {
    controller: function (config) {
        return {
            content: config.content
        }
    },

    view: function(ctrl) {
        return m("div", {class: "fullscreen-without-menu-page"},[
            ctrl.content,
            m("div", {class: "system-message"}, [
                m.component(GlobalSystemMessage),
                m.component(GlobalDialogModule),
                m.component(GlobalInfoSystemMessage),
            ])
        ]);
    }
}
