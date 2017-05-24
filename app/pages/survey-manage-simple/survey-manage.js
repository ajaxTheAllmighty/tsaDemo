'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var SurveyConstructorModule = require('../../modules/survey-manage-simple/survey-manage.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            surveyModule: new SurveyConstructorModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.surveyModule)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
