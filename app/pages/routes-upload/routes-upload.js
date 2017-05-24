'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var RoutesUploadModule = require('../../modules/sapsan/routes-upload/routes-upload.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            routesUploadModule: new RoutesUploadModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.routesUploadModule)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
