'use strict';
var m = require('mithril');
var Locator = require('../../modules/maps/locator/locator.js');
var FullPageTemplate = require('../../templates/fullscreen-without-menu/fullscreen-without-menu.js');

module.exports = {
    controller: function () {
        Globals.isAuth();
        var locator = m.component(new Locator({salCode: Globals.getRelocateData().salepoint}))
        return {
            locator: locator
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                ctrl.locator
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
