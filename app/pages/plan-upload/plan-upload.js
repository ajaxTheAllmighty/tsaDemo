'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var PlanUploadModule = require('../../modules/sapsan/plan-upload/plan-upload.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            planModule: new PlanUploadModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.planModule)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
