'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var VisitManageModule = require('../../modules/visit-manage/visit-manage.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            visitManageModule: new VisitManageModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.visitManageModule)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
