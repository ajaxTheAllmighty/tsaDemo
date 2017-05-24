'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var CalendarModule = require('../../modules/sapsan/calendar/calendar.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            calendar: new CalendarModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.calendar)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
