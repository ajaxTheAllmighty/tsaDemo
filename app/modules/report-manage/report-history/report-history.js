'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function (config) {
    var state = 'default';
    var reportCode;
    var zIndex = config.zIndex || 1005;

    function load(repCode){
        state = 'opened';
        reportCode = repCode;
        m.redraw();
    }

    function downloadReport(data){
        console.log(data);
        window.open(Config.reportBackupFolder+data[0]['REH_REPORT_VIEW']+"_"+data[0]['REH_REPORT_VERSION']+".xlsm", '_blank');
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        return {
            GridModule: new GridModule({
                allowNew: false,
                gridView: 'VIEW_WT_REPORT_HISTORY',
                perPage: 50,
                staticFilters: {
                    1:{
                        andOrCondition: "AND",
                        condition: "equal",
                        fieldName: 'REH_REP_CODE',
                        fieldTitle: "Код",
                        filterField: 'REH_REP_CODE',
                        id: "1",
                        isGroupCondition: true,
                        type: "INT",
                        value: reportCode
                    }
                },
                additionalColumns: {
                    openReportBtn: {
                        name: "",
                        width: 100,
                        button: {
                            name: "Скачать",
                            width: 100,
                            onclick: function () {
                                var reportKey = this.getAttribute('data-key');
                                Helper.getData(downloadReport, {"context": this, "module": "Report History", "function": "view"}, '*', 'VIEW_WT_REPORT_HISTORY', "WHERE REH_CODE = " + reportKey);
                            }
                        }
                    }
                },
                moduleId: Globals.registerModule('grid')
            })
        }
    }

    function view(ctrl){
        switch(state){
            case 'default':
                return m("div", {class: "b-report-history_default"});
            break;
            case 'opened':
                var gridConfig = {
                    allowNew: false,
                    gridView: 'VIEW_WT_REPORT_HISTORY',
                    perPage: 50,
                    state: 'loading',
                    staticFilters: {
                        1:{
                            andOrCondition: "AND",
                            condition: "equal",
                            fieldName: 'REH_REP_CODE',
                            fieldTitle: "Код",
                            filterField: 'REH_REP_CODE',
                            id: "1",
                            isGroupCondition: true,
                            type: "INT",
                            value: reportCode
                        }
                    },
                    additionalColumns: {
                        openReportBtn: {
                            name: "",
                            width: 100,
                            button: {
                                name: "Скачать",
                                width: 100,
                                onclick: function () {
                                    var reportKey = this.getAttribute('data-key');
                                    Helper.getData(downloadReport, {"context": this, "module": "Report History", "function": "view"}, '*', 'VIEW_WT_REPORT_HISTORY', "WHERE REH_CODE = " + reportKey);
                                }
                            }
                        }
                    },
                    id: Globals.registerModule('grid')
                };

                return new Modal({
                    id: 'reportHistoryModal',
                    state: 'show',
                    header: "Список версий отчета",
                    content: [
                        m.component(ctrl.GridModule)
                    ],
                    isStatic: false,
                    isFooter: false,
                    isFullScreen: false,
                    modalSizeParams: {width: '98%', height: '100%', padding: '5% 0 5% 0'},
                    zIndex: zIndex,
                    //confirmBtn: t('saveBtn', 'App'),
                    //onConfirm: saveCard,
                    onCancel: function(){state = 'default';}
                });
        }
    }

    return{
        load: load,
        controller: controller,
        view: view
    }
};