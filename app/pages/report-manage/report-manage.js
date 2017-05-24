'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');

module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            grid: new GridModule({
                moduleId: Globals.registerModule('grid'),
                mode: 'grid',
                allowNew: true,
                gridView: Globals.getCurrentMenuItem()['MNU_VIEW_NAME'],
                perPage: 50,
                staticFiltersArray: []
            })
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: m.component(ctrl.grid)
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
