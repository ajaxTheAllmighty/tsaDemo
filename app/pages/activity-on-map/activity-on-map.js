'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var ActivityOnMapModule = require('../../modules/activity-on-map/activity-on-map.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        var activityOnMap = m.component(new ActivityOnMapModule)
        return {
            activityOnMap: activityOnMap
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                ctrl.activityOnMap
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
