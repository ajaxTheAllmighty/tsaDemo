'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var SurveyLandingModule = require('../../modules/survey-landing/survey-landing.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            module: new SurveyLandingModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.module)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
