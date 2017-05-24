'use strict';
var m = require('mithril');
var MenuModule = require('../../modules/core/menu/menu.js')();
var TopMenuModule = require('../../modules/core/top-menu/top-menu.js')();
module.exports = {
    controller: function (config) {
        var menuModule = Object.create(MenuModule);
        var topMenuModule = Object.create(TopMenuModule);
        return {
            menu: menuModule,
            topMenuModule: topMenuModule,
            content: config.content
        }
    },

    view: function(ctrl) {
        return m("div", {class: "fullscreen-page"},[
            m("header", [
                m("div", {class: "header__top-menu"}, [
                    m.component(ctrl.topMenuModule)
                ]),
                m("div", {class: "header__main-menu"},
                    m.component(ctrl.menu)
                )
            ]),
            m("div", {class: "fullscreen-page__content"},[
                ctrl.content
            ]),
            m("div", {class: "system-message"}, [
                m.component(GlobalSystemMessage),
                m.component(GlobalDialogModule),
                m.component(GlobalInfoSystemMessage),
            ])
        ]);
    }
}
