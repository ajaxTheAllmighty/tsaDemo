'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
module.exports = function (config) {
    var visitCode = config.visitCode;
    var _DocGrid = '';
    var _DocDetailsGrid = '';

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        _DocGrid = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'picker',
            onRowClick: function(document){
                showDocumentDetails(document.key);
            },
            gridView: 'VIEW_VISIT_DETAILS',
            perPage: 50,
            staticFilters: {
                1: {
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldTitle: '',
                    fieldName: "VIS_CODE",
                    filterField: "VIS_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: visitCode
                }
            }
        });
    }

    function showDocumentDetails(docCode){
        _DocDetailsGrid = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'grid',
            gridView: 'VIEW_ST_DOC_DETAILS',
            perPage: 50,
            staticFilters: {
                1: {
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldTitle: '',
                    fieldName: "DOD_DOC_CODE",
                    filterField: "DOD_DOC_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: docCode
                }
            }
        });
    }

    function view() {
        return m("div", {class: "VM-visit-details", style: "width: 100%; height: 100%"}, [
            m("div", {class: "VM-visit-details__document-container", style: "width: 50%; height: 100%; float: left;"}, [
                _DocGrid
            ]),
            m("div", {class: "VM-visit-details__document-details-container", style: "width: calc(50% - 10px); height: 100%; margin-left: 10px; float: left;"}, [
                _DocDetailsGrid
            ])
        ])
    }

    return {
        controller: controller,
        view: view
    }
}