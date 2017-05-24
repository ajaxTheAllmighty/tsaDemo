'use strict';
var m = require('mithril');
var ImeiMigrationModule = require('../../modules/imei-migration/imei-migration.js');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');

module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            migrationModule: new ImeiMigrationModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.migrationModule)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
