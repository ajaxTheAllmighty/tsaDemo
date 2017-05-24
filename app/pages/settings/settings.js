'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var SettingsModule = require('../../modules/core/settings/settings.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            settingsModule: new SettingsModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.settingsModule)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
