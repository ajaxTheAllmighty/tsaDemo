'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
var ReportFilterModule = require('../../modules/report/report-filter/report-filter.js');
var FullPageTemplate = require('../../templates/fullscreen/fullscreen.js');
var Modal = require('../../components/modal-window/modal-window.js');
var MenuModule = require('../../modules/core/menu/menu.js')();
var TopMenuModule = require('../../modules/core/top-menu/top-menu.js')();
var ExportCsvModule = require('../../modules/export-csv/export.js');
module.exports = function(){
    var _ReportFilter = false;
    var _reportData;
    var _modal = '';
    var _ExportCsv = '';

    function reportDataLoaded(data){
        _reportData = data[0];
        console.log('reportData');
        console.log(_reportData);
        _ReportFilter = new ReportFilterModule({
            id: 'reportFilters-'+Globals.registerModule('report-filter'),
            state: 'default',
            view: _reportData['REP_VIEW_NAME'],
            reportName: _reportData['REP_VIEW_NAME'],
            activeFilter: false
        });
        _ReportFilter.init({
            view: _reportData['REP_VIEW_NAME'],
            reportName: _reportData['REP_VIEW_NAME'],
            activeFilter: false
        });
        m.redraw();
    }

    function showExport(code){
        _ExportCsv = new ExportCsvModule({
            isReport: true,
            reportCode: code
        });
    }

    function controller() {
        Globals.isAuth();
        var menuModule = Object.create(MenuModule);
        var topMenuModule = Object.create(TopMenuModule);
        return {
            grid: new GridModule({
                moduleId: Globals.registerModule('grid'),
                allowNew: false,
                gridView: Globals.getCurrentMenuItem()['MNU_VIEW_NAME'],
                perPage: 50,
                staticFilters: [],
                showSelectColumn: false,
                additionalColumns: {
                    openReportBtn: {
                        name: "",
                        width: 100,
                        button: {
                            name: t('openReportBtn', 'ReportPage'),
                            width: 100,
                            onclick: function () {
                                _modal = new Modal({
                                    id: 'reportLoadingModal',
                                    state: 'show',
                                    header: t('modalReportHeader', 'ReportFilterModule'),
                                    content: [
                                        m("img", {class: "grid-loading-modal__body--loader", src: "dist/assets/images/loading.gif"}),
                                        m.trust(t('modalReportBodyMsg', 'ReportFilterModule'))
                                    ],
                                    isStatic: true,
                                    isFooter: false,
                                    isFullScreen: false,
                                    modalSizeParams: {width: '60%', height: false, padding: '5% 0 5% 0'},
                                    zIndex: 1005
                                });
                                var reportKey = this.getAttribute('data-key');
                                showExport(reportKey);
                            }
                        }
                    }
                }
            }),
            menu: menuModule,
            topMenuModule: topMenuModule
        }
    }
    function view(ctrl) {
        return m("div", {class: "fullscreen-page"},[
            m("header", [
                m("div", {class: "header__top-menu"}, [
                    m.component(ctrl.topMenuModule)
                ]),
                m("div", {class: "header__main-menu"},
                    m.component(ctrl.menu)
                )
            ]),
            m("div", {class: "fullscreen-page__content"},[
                m.component(ctrl.grid),
                _ReportFilter ? m.component(_ReportFilter) : ''//m.component(_ReportFilter)
            ]),
            m("div", {class: "system-message"}, [
                m.component(GlobalSystemMessage),
                m.component(GlobalDialogModule),
                m.component(GlobalInfoSystemMessage),
                _ExportCsv
            ])
        ]);
    }

    return {
        controller: controller,
        view: view
    }
};
