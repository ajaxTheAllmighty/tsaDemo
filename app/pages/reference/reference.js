'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var modal = require('../../components/modal-window/modal-window.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        var Grid = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'grid',
            allowNew: true,
            gridView: Globals.getCurrentMenuItem()['MNU_VIEW_NAME'],
            perPage: 50,
            staticFilters: [],
            showSelectColumn: true,
            contextActionsList: ['rowMode'],
            isModal: false
        });
        return {
            content: m.component(Grid)
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: ctrl.content
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
