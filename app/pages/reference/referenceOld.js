'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var modal = require('../../components/modal-window/modal-window.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        var gridConfig = {
            mode: 'grid',
            allowNew: true,
            gridView: Globals.getCurrentMenuItem()['MNU_VIEW_NAME'],
            perPage: 50,
            state: 'loading',
            staticFilters: [],
            id: Globals.registerModule('grid'),
            showSelectColumn: false,
            contextActionsList: ['export, rowMode'],
            isModal: false,
            customContextActions: {
                //test: {
                //    showThreshold: 1,
                //    name: "test action",
                //    action: function(data){
                //        console.log('test action');
                //        console.log(data);
                //    }
                //},
            }
        };

        var grid = m.component(new GridModule, gridConfig)

        return {
            grid: grid
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                ctrl.grid
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
