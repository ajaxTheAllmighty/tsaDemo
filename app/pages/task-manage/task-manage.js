'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var TaskManageModule = require('../../modules/task-manage/task-manage.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            taskManageModule: new TaskManageModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.taskManageModule)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
