'use strict';
var m = require('mithril');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var ShipmentProcessModule = require('../../modules/sapsan/shipment-process/shipment-process.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        return {
            shipmentModule: new ShipmentProcessModule
        }
    },
    view: function (ctrl) {
        var pageConfig = {
            content: [
                m.component(ctrl.shipmentModule)
            ]
        };
        return m.component(FullPageTemplate, pageConfig);
    }
}
