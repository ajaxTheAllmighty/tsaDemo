'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var ModalLoading = require('../../../components/modal-window/loading-modal-window.js');
var Modal = require('../../../components/modal-window/modal-window.js');
var TableComponent = require('../../../components/table/table.js');
var VisitDetailsModule = require('./visit-details.js');
module.exports = function (config) {
    var _state = 'loading';
    var _VisitTable = '';
    var _RouteTable = '';
    var _visitCount = 0;
    var _salepointCount = 0;
    var _visitData = [];
    var _routeData = [];
    var _salepointsInRoute = [];
    var _salepointsInRouteVisited = [];
    var _LegendModal = '';
    var _VisitDetailsModal = '';

    var date = config.date;
    var routeCode = config.routeCode;
    var routeName = config.routeName;
    var userCode = config.userCode;
    var userName = config.userName;

    function detailsLoaded(data){
        _visitData = data;
        _visitCount = data.length;
        Helper.getData(routeSalepointsLoaded, {"context": this, "module": "VM-day-details", "function": "detailsLoaded"}, '*', 'VIEW_ST_ROUTE_SALEPOINT', "WHERE ROU_CODE = "+routeCode);
    }

    function routeSalepointsLoaded(data){
        data.map(function(salepointObj){
            _salepointsInRoute.push(salepointObj['SAL_CODE']);
        });
        _routeData = data;
        _salepointCount = data.length;
        checkVisits();
    }

    function checkVisits(){
        var visitDataForTable = [];
        var routeDataForTable = [];

        //prepare data for visit table
        _visitData.map(function(visitObj){
            var visitColor = '#000000';
            //visit in route
            if(_salepointsInRoute.indexOf(visitObj['VIS_SAL_CODE']) !== -1){
                //mark salepoint as visited
                if(_salepointsInRouteVisited.indexOf(visitObj['VIS_SAL_CODE']) === -1){
                    _salepointsInRouteVisited.push(visitObj['VIS_SAL_CODE']);
                }
            }else{
                visitColor = '#aa64d2';
            }
            visitDataForTable.push({
                key: visitObj['VIS_CODE'],
                SAL_NAME: {value: visitObj['SAL_NAME'], style: "color: "+visitColor+";"},
                COL4: {value: visitObj['COL4'], style: "color: "+visitColor+";"},
                VIS_START_DATE_FORMATTED: {value: visitObj['VIS_START_DATE_FORMATTED'], style: "color: "+visitColor+";"},
                VIS_FINISH_DATE_FORMATTED: {value: visitObj['VIS_FINISH_DATE_FORMATTED'], style: "color: "+visitColor+";"},
                VIS_CANCELLED: {value: visitObj['VIS_CANCELLED'], style: "color: "+visitColor+";"},
                VIS_COORDINATE: {value: visitObj['VIS_COORDINATE'], style: "color: "+visitColor+";"}
            });
        });

        //prepare data for route table
        _routeData.map(function(salepointObj){
            var salepointColor = '#000000';
            if(_salepointsInRouteVisited.indexOf(salepointObj['SAL_CODE']) === -1){
                salepointColor = '#DC0451';
            }
            routeDataForTable.push({
                SAL_NAME: {value: salepointObj['SAL_NAME'], style: "color: "+salepointColor+";"},
                COL4: {value: salepointObj['COL4'], style: "color: "+salepointColor+";"}
            });
        });

        drawVisitTable(visitDataForTable);
        drawRouteTable(routeDataForTable);
        _state = 'loaded';
        m.redraw();
    }

    function drawRouteTable(data){
        _RouteTable = new TableComponent({
            tableClass: 'table-bordered table-striped table-hover',
            columns: [
                {name: 'SAL_NAME', title: 'Имя ТТ'},
                {name: 'COL4', title: 'Владелец'}
            ],
            data: data,
            isFlat: false,
            isSelectColumn: false,
            style: "height: calc(100% - 30px);"
        });
    }

    function drawVisitTable(data){
        _VisitTable = new TableComponent({
            tableClass: 'table-bordered table-striped table-hover',
            columns: [
                {name: 'SAL_NAME', title: 'Имя ТТ'},
                {name: 'COL4', title: 'Адрес ТТ'},
                {name: 'VIS_START_DATE_FORMATTED', title: 'Начало'},
                {name: 'VIS_FINISH_DATE_FORMATTED', title: 'Завершение'},
                {name: 'VIS_CANCELLED', title: 'Отменен'},
                {name: 'VIS_COORDINATE', title: 'GPS'}
            ],
            data: data,
            isFlat: false,
            isSelectColumn: false,
            style: "height: calc(100% - 30px);",
            onClick: function(visitCode){
                showVisitDetails(visitCode);
            }
        });
    }

    function showVisitDetails(visitCode){
        _VisitDetailsModal = new Modal({
            id: 'visitDetailsModal',
            state: 'show',
            content: [
                new VisitDetailsModule({
                    visitCode: visitCode
                })
            ],
            isStatic: false,
            header: 'Документы в визите',
            isFooter: false,
            isFullScreen: true
        })
    }

    function showLegend(){
        _LegendModal = new Modal({
            id: 'surveyInformModal',
            state: 'show',
            content: [
                m("div", {class: "VM-day-details__legend-content", style: 'text-align: left;'}, [
                    m("div", {class: "VM-day-details__legend-item"}, [
                        m("div", {class: "VM-day-details__legend-color-box", style: "background: #dc0451"}),
                        'Красный цвет в правой таблице - торговые точки не посещены.'
                    ]),
                    m("div", {class: "VM-day-details__legend-item"}, [
                        m("div", {class: "VM-day-details__legend-color-box", style: "background: #aa64d2"}),
                        'Фиолетовый цвет в левой таблице - торговые точки посещены вне маршрута.'
                    ]),
                    m("div", {class: "VM-day-details__legend-item"}, [
                        m("div", {class: "VM-day-details__legend-color-box", style: "background: #000000"}),
                        'Черный цвет - точки заявлены на маршрут и посещены.'
                    ])
                ])
            ],
            isStatic: false,
            header: 'Легенда',
            isFooter: true,
            isFullScreen: false,
            modalSizeParams: {width: '600px', height: false, padding: '15% 0 0 0'},
            zIndex: 1005,
            confirmBtn: 'Ок',
            cancelBtn: 'none',
            onConfirm: function(){
                _LegendModal = '';
            }
        })
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        Helper.getData(detailsLoaded, {"context": this, "module": "VM-day-details", "function": "controller"}, '*', 'VIEW_ST_VISIT', "WHERE USE_CODE = "+userCode+" AND (VIS_START_DATE BETWEEN CONVERT(DATETIME,'"+date+"',104) AND (CONVERT(DATETIME,'"+date+"',104) + 1))");
    }

    function view() {
        switch(_state){
            case 'loading':
                return new ModalLoading({header: "Загрузка данных"})
            break;
            case 'loaded':
                return m("div", {class: "VM-day-details"}, [
                    m("div", {class: "VM-day-details__tools-container component-container"}, [
                        m("div", {class: "VM-day-details__tools-hint"}, 'Для просмотра деталей кликните на строку c визитом.'),
                        m("button", {class: "VM-day-details__legend-btn btn btn-system btn-system-primary", onclick: showLegend}, 'Легенда')
                    ]),
                    m("div", {class: "VM-day-details__data-container"}, [
                        m("div", {class: "VM-day-details__visit-data-container component-container"}, [
                            m("h3", 'Визиты "'+userName+'" (записей: ' + _visitCount + ')'),
                            _VisitTable
                        ]),
                        m("div", {class: "VM-day-details__route-data-container component-container"}, [
                            m("h3", 'Точки из маршрута "'+routeName+'" (записей: ' + _salepointCount + ')'),
                            _RouteTable
                        ]),
                    ]),
                    _LegendModal,
                    _VisitDetailsModal
                ])
            break;
        }
    }

    return {
        controller: controller,
        view: view
    }
}