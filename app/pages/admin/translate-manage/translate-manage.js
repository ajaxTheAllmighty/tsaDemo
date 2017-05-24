'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../../templates/fullscreen/fullscreen.js');
var ProgramManageModule = require('../../../modules/admin/translate-manage/translate-manage.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            programModule: new ProgramManageModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.programModule)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
