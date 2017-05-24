'use strict';
var m = require('mithril');
var MenuModule = require('../../modules/core/menu/menu.js')();
var TopMenuModule = require('../../modules/core/top-menu/top-menu.js')();
module.exports = function(config){
    var content = config.content;
    function controller() {
        var menuModule = Object.create(MenuModule);
        var topMenuModule = Object.create(TopMenuModule);
        return {
            menu: menuModule,
            topMenuModule: topMenuModule
        }
    }

    function view(ctrl){
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
                content
            ]),
            m("div", {class: "system-message"}, [
                m.component(GlobalSystemMessage),
                m.component(GlobalDialogModule),
                m.component(GlobalInfoSystemMessage),
            ])
        ]);
    }

    return{
        controller: controller,
        view: view
    }
}
