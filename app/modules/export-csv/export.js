'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
var Modal = require('../../components/modal-window/modal-window.js');
module.exports = function (config) {
    var _state = 'default'; //loading, done
    var _fileUrl = '';

    var isReport = config.isReport;
    var reportCode = config.reportCode || null;
    var gridView = config.gridView || null;
    var where = config.where || null;
    var rowsCount = config.rowsCount || 0;

    function startExport(){
        _state = 'loading';
        Helper.getCsv(exportDone, {"context": this, "module": "ExportCsvModule", "function": "startExport"}, isReport, (isReport ? reportCode : gridView), where);
    }

    function exportDone(data){
        _fileUrl = data.file;
        _state = 'done';
        m.redraw();
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function view(){
        switch(_state){
            case 'default':
                return new Modal({
                    id: 'exportCsv',
                    state: 'show',
                    content: [
                        m("button", {class: "btn btn-system btn-system-primary", style: "width: 100%;", onclick: startExport},
                            isReport ? t('ganerateReportBtn', 'ExportCsvModule') : t('exportCsvBtn', 'ExportCsvModule', {rowsCount: rowsCount})
                        )
                    ],
                    isStatic: false,
                    header: isReport ? t('modalReportHeaderDefault', 'ExportCsvModule') : t('modalExportHeaderDefault', 'ExportCsvModule'),
                    isFooter: false,
                    isFullScreen: false,
                    modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                    zIndex: 1005,
                    onCancel: function(){
                        _state = 'hidden';
                    }
                })
                break;
            case 'loading':
                return new Modal({
                    id: 'exportCsv',
                    state: 'show',
                    content: [
                        m("img", {
                            class: "grid-loading-modal__body--loader",
                            src: "dist/assets/images/loading.gif"
                        }),
                        isReport ? t('modalReportHeaderDefault', 'ExportCsvModule') : t('modalExportHeaderDefault', 'ExportCsvModule'),
                        m("p", {class: "grid-loading-modal__message"}, t('loadingModalBodyWarningMsg', 'GridModule'))
                    ],
                    isStatic: true,
                    header: t('modalHeaderLoading', 'ExportCsvModule'),
                    isFooter: false,
                    isFullScreen: false,
                    modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                    zIndex: 1005
                })
            break;
            case 'done':
                return new Modal({
                    id: 'exportCsv',
                    state: 'show',
                    content: [
                        m("a[download]", {class: "btn btn-system btn-system-primary export-modal__download-btn", href: _fileUrl, target: "_blank", onclick: function(){_state = "hidden";}}, t('downloadBtn', 'ExportCsvModule'))
                    ],
                    isStatic: false,
                    header: isReport ? t('reportReadyHeader', 'ExportCsvModule') : t('exportReadyHeader', 'ExportCsvModule'),
                    isFooter: false,
                    isFullScreen: false,
                    modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                    zIndex: 1005,
                    onCancel: function(){
                        _state = 'hidden';
                    }
                })
            break;
            case 'hidden':
                return m("div", {class: 'hidden'}, []);
            break;
        }
    }

    return{
        view: view
    }
};