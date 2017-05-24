'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var RoutesModule = require('../../modules/routes/routes.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            routeModule: new RoutesModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.routeModule)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
