'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var UserTreeModule = require('../../modules/user-tree/user-tree.js');
module.exports = {
    controller: function () {
        console.log('reference');
        Globals.isAuth();
        var userTree = m.component(new UserTreeModule)
        return {
            userTree: userTree
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                ctrl.userTree
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
