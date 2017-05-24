'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
module.exports = function (config) {
    var _state = 'default';
    var user = config.user || false;
    var _userArray = [];
    var _startDate = '';
    var _endDate = '';
    //var _userAc;
    var _userRouteTemplate = [];
    var _isTemplateNeedSave = false;
    var _userRoutes = [];
    var _calendarList = [];
    var _isCalendarNeedSave = false;
    var _routeInserted = 0;
    var _calendarDayInserted = 0;

    function parseDate(str, delimiter) {
        if(typeof delimiter == 'undefined'){
            delimiter = '-';
        }
        if(str){
            var m = str.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
            if(m) {
                return {d: m[1], m: m[2], y: m[3]};
            }else{
                var m = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
                if(m){
                    return {d:m[3], m:m[2], y:m[1]};
                }
            }
        }
        return false;
    }

    function getNameDayOfWeek(day){
        switch(day){
            case 1: return 'Monday'; break;
            case 2: return 'Tuesday'; break;
            case 3: return 'Wednesday'; break;
            case 4: return 'Thursday'; break;
            case 5: return 'Friday'; break;
            case 6: return 'Saturday'; break;
            case 0: return 'Sunday'; break;
        }
    }

    function loadUserList(){
        Helper.getData(userListLoaded, {"context": this, "module": "RouteCalendarModule", "function": "loadUserList"}, 'USE_CODE, USE_NAME', 'ST_USER', "WHERE 1=1");
    }

    function userListLoaded(data){
        _userArray = data;
        _state = "loaded";
        m.redraw();
    }

    function loadUserRouteTemplate(){
        Helper.getData(userRouteTemplateLoaded, {"context": this, "module": "RouteCalendarModule", "function": "loadUserRouteTemplate"}, 'ROU_CODE, ROU_NAME', 'VIEW_ST_ROUTE_TEMPLATES', "WHERE USE_CODE = "+user.code);
    }

    function userRouteTemplateLoaded(data){
        _userRouteTemplate = data;
        _isTemplateNeedSave = false;
        loadUserRoutes();
    }

    function loadUserRoutes(){
        Helper.getData(userRoutesLoaded, {"context": this, "module": "RouteCalendarModule", "function": "loadUserRoutes"}, 'ROU_CODE, ROU_NAME', 'VIEW_ST_ROUTE', "WHERE ROU_USE_CODE = "+user.code);
    }

    function userRoutesLoaded(data){
        _state = "loaded";
        _userRoutes = data;
        if(_startDate && _endDate){
            checkRouteCalendar();
        }else{
            m.redraw();
        }
    }

    function dayRouteChanged(){
        var index = this.getAttribute('data-index');
        var value = isNaN(parseInt(this.value)) ? false : parseInt(this.value);
        var title = this.options[this.selectedIndex].innerText;
        _userRouteTemplate[index] = {ROU_CODE: value, ROU_NAME: title};
        _isTemplateNeedSave = true;
    }

    function calendarRouteChanged(){
        var index = this.getAttribute('data-index');
        var routeCode = isNaN(parseInt(this.value)) ? false : parseInt(this.value);
        var routeName = this.options[this.selectedIndex].innerText;
        _calendarList[index]['ROU_CODE'] = routeCode;
        _calendarList[index]['ROU_NAME'] = routeName;
        _isCalendarNeedSave = true;
    }

    function addDayRoute(){
        _userRouteTemplate.push(false);
        _isTemplateNeedSave = true;
    }

    function removeDayRoute(){
        var index = this.getAttribute('data-index');
        _userRouteTemplate.splice(index, 1);
        _isTemplateNeedSave = true;
    }

    var checkRouteCalendar = Helper.debounce(function(){
        Helper.getData(routeCalendarLoaded, {"context": this, "module": "RouteCalendarModule", "function": "checkRouteCalendar"}, 'VIS_USE_CODE, VIS_DATE_FORMATTED, VIS_DAYNAME, ROU_CODE, ROU_NAME', 'VIEW_ST_VISIT_CALENDAR', "WHERE (VIS_DATE BETWEEN CONVERT (DATETIME, '"+_startDate+"',  104) AND CONVERT (DATETIME, '"+_endDate+"',  104)) AND (VIS_USE_CODE = " + user.code + ")");
    }, 250);

    function routeCalendarLoaded(data){
        _isCalendarNeedSave = false;
        _calendarList = data;
        m.redraw();
    }

    function showRouteSalepoints(){
        var routeCode = this.getAttribute('data-code');
        var routeName = this.getAttribute('data-name');

        if(typeof routeCode === 'undefined'|| routeCode === 'null' || routeCode === 'false'){
            routeSalepointsLoaded([], {routeName: t('noRouteLabel', 'RM_routeCalendarModule')});
        }else{
            Helper.getDataEx(routeSalepointsLoaded, {routeName: routeName}, {"context": this, "module": "RouteCalendarModule", "function": "showRouteSalepoints"}, '*', 'VIEW_ST_ROUTE_SALEPOINT', "WHERE ROS_ROU_CODE = " + routeCode);
        }
    }

    function routeSalepointsLoaded(data, params){
        GlobalInfoSystemMessage.init({
            state: "show",
            header: t('routeInfoModalHeader', 'RM_routeCalendarModule', {route: params.routeName, count: data.length}),
            messages: [],
            content: m("table", {class: "table table-bordered table-striped"}, [
                m("thead",
                    m("tr", [
                        m("th", 'Код ТТ'),
                        m("th", 'Имя ТТ'),
                        m("th", 'Примечания'),
                    ])
                ),
                m("tbody", [
                    data.map(function(salepointObj){
                        return m("tr", [
                            m("td", salepointObj['SAL_ID']),
                            m("td", salepointObj['SAL_NAME']),
                            m("td", salepointObj['SAL_NOTES']),
                        ])
                    })
                ])
            ]),
            afterClose: null
        });
    }

    function dateRangeChanged(){
        _startDate = $('#startDate').val();
        _endDate = $('#endDate').val();
        if(_startDate && _endDate && user){
            checkRouteCalendar();
        }
    }

    function shapeCalendar(){
        var errors = [];
        if(_isTemplateNeedSave){
            errors.push(t('saveErrorNeedSaveTamplate', 'RM_routeCalendarModule'));
        }

        if(_userRouteTemplate.length === 0){
            errors.push(t('saveErrorNoRoutes', 'RM_routeCalendarModule'));
        }

        if(!_startDate || !_endDate){
            errors.push(t('saveErrorNoDates', 'RM_routeCalendarModule'));
        }

        if(errors.length > 0){
            GlobalInfoSystemMessage.init({
                state: "show",
                header: t('shapeCalendarError', 'RM_routeCalendarModule'),
                messages: errors,
                afterClose: null
            });
        }else{
            _calendarList = [];

            var sD = parseDate(_startDate);
            var eD = parseDate(_endDate);
            var start = new Date(sD.y, sD.m-1, sD.d, 0, 0, 0);
            var end = new Date(eD.y, eD.m-1, eD.d, 0, 0, 0);
            var routeCounter = 0;

            //if(start < new Date()){
            //    var today = new Date();
            //    start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            //}

            var now = new Date();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            while (start <= end){
                var dateRoute = _userRouteTemplate[routeCounter];
                if(start >= today){
                    _calendarList.push({
                        VIS_DATE_FORMATTED: ('0' + start.getDate()).slice(-2) + '.' + ('0' + (start.getMonth()+1)).slice(-2) + '.' + start.getFullYear(),
                        VIS_DAYNAME: getNameDayOfWeek(start.getDay()),
                        ROU_CODE: dateRoute['ROU_CODE'],
                        ROU_NAME: dateRoute['ROU_NAME']
                    });
                }
                routeCounter++;
                if(routeCounter >= _userRouteTemplate.length){
                    routeCounter = 0;
                }
                start.setDate(start.getDate() + 1);
            }
            _isCalendarNeedSave = true;
        }
    }

    function trySaveCalendar(){
        GlobalDialogModule.init({
            state: "show",
            header: t('saveCalendarModalHeader', 'RM_routeCalendarModule'),
            cancelBtn: t('cancelBtn', 'App'),
            confirmBtn: t('saveCalendarModalSaveBtn', 'RM_routeCalendarModule'),
            messages: [
                t('saveCalendarModalConfirmRow1', 'RM_routeCalendarModule'),
                t('saveCalendarModalConfirmRow2', 'RM_routeCalendarModule', {user: user.name}),
                t('saveCalendarModalConfirmRow3', 'RM_routeCalendarModule'),
                t('saveCalendarModalConfirmRow4', 'RM_routeCalendarModule')
            ],
            cancelCallback: null,
            confirmCallback: function(){
                removeOldCalendar();
            }
        });
    }

    function removeOldCalendar(){
        var start = _calendarList[0]['VIS_DATE_FORMATTED'];
        var end = _calendarList[_calendarList.length - 1]['VIS_DATE_FORMATTED'];
        Helper.execQuery(addNewCalendar,  {"context": this, "module": "RouteCalendarModule", "function": "removeOldCalendar"}, "DELETE FROM ST_VISIT_CALENDAR WHERE (VIS_USE_CODE = " + user.code + ") AND (VIS_DATE BETWEEN CONVERT (DATETIME,'"+start+"',  104) AND CONVERT (DATETIME, '"+end+"',  104))");
    }

    function addNewCalendar(){
        _calendarDayInserted = 0;
        for (var i = 0; i < _calendarList.length; i++) {
            var routeCode = _calendarList[i]['ROU_CODE'];
            if(typeof routeCode === 'undefined' || !routeCode || routeCode === null){
                routeCode = 'NULL';
            }
            Helper.insertData(calendarDayInserted, {"context": this, "module": "RouteCalendarModule", "function": "addNewCalendar"}, "ST_VISIT_CALENDAR", 'VIS_USE_CODE, VIS_ROU_CODE, VIS_DATE ,CMP_CODE', user.code+","+routeCode+", CONVERT (DATETIME, '"+_calendarList[i]['VIS_DATE_FORMATTED']+"',  104), " + Globals.getUserData()['CMP_CODE']);
        }
    }

    function calendarDayInserted(){
        _calendarDayInserted++;
        if(_calendarDayInserted === _calendarList.length){
            calendarSaved();
        }
    }

    function calendarSaved(){
        GlobalInfoSystemMessage.init({
            state: "show",
            header: t('calendarModalSavedHeader', 'RM_routeCalendarModule'),
            messages: [t('calendarModalSavedMessage', 'RM_routeCalendarModule')],
            afterClose: null
        });
        _isCalendarNeedSave = false;
        m.redraw();
    }

    function trySaveTemplate(){
        GlobalDialogModule.init({
            state: "show",
            header: t('saveTemplateModalHeader', 'RM_routeCalendarModule'),
            cancelBtn: t('cancelBtn', 'App'),
            confirmBtn: t('saveTemplateModalConfirmBtn', 'RM_routeCalendarModule'),
            messages: [
                t('saveTemplateModalConfirmRow1', 'RM_routeCalendarModule'),
                t('saveTemplateModalConfirmRow2', 'RM_routeCalendarModule', {user: user.name}),
                t('saveTemplateModalConfirmRow3', 'RM_routeCalendarModule'),
                t('saveTemplateModalConfirmRow4', 'RM_routeCalendarModule'),
            ],
            cancelCallback: null,
            confirmCallback: function(){
                removeOldTemplate();
            }
        });
    }

    function removeOldTemplate(){
        Helper.execQuery(addNewTemplate,  {"context": this, "module": "RouteCalendarModule", "function": "removeOldTemplate"}, 'DELETE FROM ST_ROUTE_TEMPLATE WHERE RTM_USE_CODE = ' + user.code);
    }

    function addNewTemplate(){
        _routeInserted = 0;
        for (var i = 0; i < _userRouteTemplate.length; i++) {
            var routeCode = _userRouteTemplate[i]['ROU_CODE'];
            if(typeof routeCode === 'undefined' || !routeCode || routeCode === null){
                routeCode = 'NULL';
            }
            Helper.insertData(routeInserted, {"context": this, "module": "RouteCalendarModule", "function": "addNewTemplate"}, "ST_ROUTE_TEMPLATE", 'RTM_USE_CODE, RTM_ROU_CODE, RTM_SHOW_ORDER ,CMP_CODE', user.code+","+routeCode+","+(i+1)+","+Globals.getUserData()['CMP_CODE']);
        }
    }

    function routeInserted(){
        _routeInserted++;
        if(_routeInserted === _userRouteTemplate.length){
            templateSaved();
        }
    }

    function templateSaved(){
        GlobalInfoSystemMessage.init({
            state: "show",
            header: t('templateModalSavedHeader', 'RM_routeCalendarModule'),
            messages: [t('templateModalSavedMessage', 'RM_routeCalendarModule')],
            afterClose: null
        });
        _isTemplateNeedSave = false;
        m.redraw();
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        loadUserRouteTemplate();
    }

    function view(ctrl) {
        switch(_state){
            case 'default':
                return m("div", {class: "m-route-calendar_default_view"});
            break;
            case 'loading':
                return m("div", {class: "m-route-calendar_loading_view"}, 'Loading data');
            break;
            case 'loaded':
                var datePickerRange = function(el){
                    $(el).each(function() {
                        $(this).datepicker("clearDates", {weekStart: 1, format: 'dd-mm-yyyy', language: Globals.getLangApp()});
                    });
                }

                return m("div", {class: "m-route-calendar"}, [
                    m("div", {class: "route-calendar__route-settings component-container"}, [
                        m("div", {class: "route-settings__template-container clearfix"}, [
                            m("div", {class: "route-template__header"}, [
                                m("div", {class: "route-template__info"}, t('templateLabel', 'RM_routeCalendarModule', {count: _userRouteTemplate.length})),
                                m("button", {class: "btn btn-system btn-system-primary route-template__add-route-btn", onclick: addDayRoute, disabled: (!user ? true : false)}, t('addRouteBtn', 'RM_routeCalendarModule')),
                                m("button", {class: "btn btn-system btn-success route-template__save-template-btn", onclick: trySaveTemplate, disabled: (!user ? true : false)}, t('saveTemplateBtn', 'RM_routeCalendarModule')+(_isTemplateNeedSave ? ' *' : ''))
                            ])
                        ]),
                        m("div", {class: "route-settings__route-list-container"}, [
                            m("table", {class: "table table-bordered table-striped route-settings__route-list-table"}, [
                                m("thead", [
                                    m("tr", [
                                        m("th", t('templateTableColumnDay', 'RM_routeCalendarModule')),
                                        m("th", t('templateTableColumnRoute', 'RM_routeCalendarModule')),
                                        m("th", {class: "route-list-table__remove-route-column"}, '')
                                    ])
                                ]),
                                m("tbody", [
                                    _userRouteTemplate.map(function(route, index){
                                        return m("tr", [
                                            m("td", index+1),
                                            m("td",
                                                m("select", {class: "form-control route-table-select", 'data-index': index, onchange: dayRouteChanged}, [
                                                    m("option", {value: false}, t('noRouteLabel', 'RM_routeCalendarModule')),
                                                    _userRoutes.map(function(userRoute, index){
                                                        return m("option", {selected: (userRoute['ROU_CODE'] == route['ROU_CODE'] ? true : false), value: userRoute['ROU_CODE']}, userRoute['ROU_NAME'])
                                                    })
                                                ])
                                            ),
                                            m("td",
                                                m("span", {class: "route-template__remove-route-btn", 'data-index': index, onclick: removeDayRoute}, '×')
                                            )
                                        ])
                                    })
                                ])
                            ])
                        ]),
                    ]),
                    m("div", {class: "route-calendar__calendar-list component-container"}, [
                        m("div", {class: "b-calendar-list-control-panel"}, [
                            m("label", {class: "b-calendar-list-control-panel__datepicker-label"}, t('dataRangeLabel', 'RM_routeCalendarModule')),
                            m("div", {class: "input-group input-daterange b-calendar-list-control-panel__datepicker-container", config: datePickerRange}, [
                                m("input", {id: "startDate", placeholder: t('startDate', 'RM_routeCalendarModule'), type: "text", class: "form-control", name: "start", value: (_startDate ? _startDate : ''), onchange: dateRangeChanged}),
                                m("span", {class: "input-group-addon"}, ' - '),
                                m("input", {id: "endDate", placeholder: t('endDate', 'RM_routeCalendarModule'), type: "text", class: "form-control", name: "end", value: (_endDate ? _endDate : ''), onchange: dateRangeChanged})
                            ]),
                            m("button", {class: "btn btn-system btn-system-primary b-calendar-list-control-panel__shape-calendar", onclick: shapeCalendar, disabled: (!user ? true : false)}, t('shapeCalendarBtn', 'RM_routeCalendarModule')),
                            m("button", {class: "btn btn-system btn-success b-calendar-list-control-panel__save-calendar", onclick: trySaveCalendar, disabled: (!user ? true : false)}, t('saveCalendarBtn', 'RM_routeCalendarModule')+(_isCalendarNeedSave ? ' *' : ''))
                        ]),
                        m("div", {class: "b-calendar-list-table-container"}, [
                            m("table", {class: "table table-bordered table-striped route-calendar-table"}, [
                                m("thead", [
                                    m("tr", [
                                        m("th", t('calendarTableColumnDate', 'RM_routeCalendarModule')),
                                        m("th", t('calendarTableColumnDay', 'RM_routeCalendarModule')),
                                        m("th", t('calendarTableColumnRoute', 'RM_routeCalendarModule')),
                                        m("th", {class: "route-calendar-table__show-salepoint-btn-column"}, ''),
                                    ])
                                ]),
                                m("tbody", [
                                    _calendarList.map(function(route, index){
                                        return m("tr", [
                                            m("td", route['VIS_DATE_FORMATTED']),
                                            m("td", t(route['VIS_DAYNAME'], 'RouteCalendarModule')),
                                            m("td",
                                                m("select", {class: "form-control route-table-select", 'data-index': index, onchange: calendarRouteChanged}, [
                                                    m("option", {value: false}, t('noRouteLabel', 'RM_routeCalendarModule')),
                                                    _userRoutes.map(function(userRoute, index){
                                                        return m("option", {selected: (userRoute['ROU_CODE'] == route['ROU_CODE'] ? true : false), value: userRoute['ROU_CODE']}, userRoute['ROU_NAME'])
                                                    })
                                                ])
                                            ),
                                            m("td", {class: "route-calendar-table__show-salepoint-btn-column"},
                                                m("button", {class: "btn btn-link btn-system-link btn-system-link_dashed ", "data-code": route['ROU_CODE'], "data-name": route['ROU_NAME'], onclick: showRouteSalepoints}, t('salepointListInRouteBtn', 'RM_routeCalendarModule'))
                                            )
                                        ])
                                    })
                                ])
                            ])
                        ])
                    ])
                ])
            break;
        }
    }

    return{
        controller: controller,
        view: view
    }
};