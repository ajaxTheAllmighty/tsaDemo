'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
module.exports = {
    controller: function() {
        Globals.isAuth();
        Globals.setCurrentMenuItem(false);
        function content(){
            return '';
        }
        return {
            content: content
        }
    },
    view: function(ctrl) {
        var pageConfig = {
            content: [
                ctrl.content
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
