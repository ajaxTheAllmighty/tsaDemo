'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
var ManageSalepointInRoutesModule = require('./manage-salepoint/manage-salepoint.js');
var RouteCalendarModule = require('../../modules/route-calendar/route-calendar.js');
module.exports = function () {
    var _state = 'selectUser';
    var _ManageUserRoutesModule;
    var _RouteCalendarModule;
    var _manageRouteSalepoints;
    var _userPicker;
    var _selectedUser = false;

    function toStep1(){
        _userPicker = m.component(new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'picker',
            onRowClick: function(user){
                getUserData(user.key)
            },
            gridView: 'VIEW_ST_USER',
            perPage: 50,
            staticFilters: []
        }));
        _selectedUser = false;
        _state = 'selectUser';
    }

    function toStep2(){
        _ManageUserRoutesModule = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'key-grid',
            allowNew: true,
            gridView: 'VIEW_ST_ROUTE',
            keyField: {name: "ROU_USE_CODE", value: _selectedUser.code},
            staticFilters: {
                1:{
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldTitle: "Код ТП",
                    fieldName: "ROU_USE_CODE",
                    filterField: "ROU_USE_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: _selectedUser.code
                }
            }
        });
        _state = 'manageRoutes';
    }

    function toStep3(){
        _state = 'manageSalepoints';
        _manageRouteSalepoints = new ManageSalepointInRoutesModule({
            selectedUser: _selectedUser.code
        });
    }

    function toStep4(){
        _state = 'routeCalendar';
        _RouteCalendarModule = new RouteCalendarModule({
            user: _selectedUser
        });
    }

    function getUserData(useCode){
        Helper.getData(userDataLoaded, {"context": this, "module": "RoutesModule", "function": "getUserData"}, '*', 'VIEW_ST_USER', "WHERE USE_CODE = " + useCode);
    }

    function userDataLoaded(data){
        _selectedUser = {code: data[0]['USE_CODE'], name: data[0]['USE_NAME']};
        _state = 'manageRoutes';
        _ManageUserRoutesModule = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'key-grid',
            allowNew: true,
            gridView: 'VIEW_ST_ROUTE',
            keyField: {name: "ROU_USE_CODE", value: _selectedUser.code},
            staticFilters: {
                1:{
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldTitle: t('gridStaticFilterLabel', 'RoutesManageModule'),
                    fieldName: "ROU_USE_CODE",
                    filterField: "ROU_USE_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: _selectedUser.code
                }
            }
        });
        m.redraw();
    }

    function showSalepointsCountInRoutes(){
        if(_selectedUser){
            Helper.getData(salepointsCountInRouteLoaded, {"context": this, "module": "RoutesModule", "function": "showSalepointsCountInRoutes"}, '*', 'VIEW_ST_ROUTE_SALEPOINT_COUNT', "WHERE ROU_USE_CODE = " + _selectedUser.code);
        }
    }

    function salepointsCountInRouteLoaded(data){
        GlobalInfoSystemMessage.init({
            state: "show",
            header: t('salepointCountModalHeader', 'RoutesManageModule'),
            messages: [],
            content: m("table", {class: "table table-bordered"}, [
                m("thead",
                    m("tr", [
                        m("th", t('salepointCountTableColumnRoute', 'RoutesManageModule')),
                        m("th", t('salepointCountTableColumnCount', 'RoutesManageModule')),
                    ])
                ),
                m("tbody", [
                    data.map(function(routeObj){
                        return m("tr", [
                            m("td", routeObj['ROU_NAME']),
                            m("td", routeObj['SAL_COUNT']),
                        ])
                    })
                ])
            ]),
            afterClose: null
        });
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        _userPicker = m.component(new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'picker',
            onRowClick: function(user){
                getUserData(user.key)
            },
            gridView: 'VIEW_ST_USER',
            perPage: 50,
            staticFilters: []
        }));
    }

    function view() {
        switch(_state){
            case 'selectUser':
                return m("div", {class: "m-routes"}, [
                    m("div", {class: "m-routes__step-menu component-container clearfix"}, [
                        m("button", {class: "btn btn-link btn-system-link active"}, t('stepChooseUser', 'RoutesManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", disabled: "disabled"}, t('stepEditUser', 'RoutesManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", disabled: "disabled"}, t('stepSalepoints', 'RoutesManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", disabled: "disabled"}, t('stepCalendar', 'RoutesManageModule')),
                    ]),
                    m("div", {class: "m-route__content"}, [
                        _userPicker
                    ])
                ])
            break;
            case 'manageRoutes':
                return m("div", {class: "m-routes"}, [
                    m("div", {class: "m-routes__step-menu component-container clearfix"}, [
                        m("button", {class: "btn btn-link btn-system-link", onclick: toStep1}, _selectedUser.name),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link active"}, t('stepEditUser', 'RoutesManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", onclick : toStep3}, t('stepSalepoints', 'RoutesManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", onclick : toStep4}, t('stepCalendar', 'RoutesManageModule')),
                    ]),
                    m("div", {class: "m-route__content"}, [
                        m.component(_ManageUserRoutesModule)
                    ])
                ])
            break;
            case 'manageSalepoints':
                return m("div", {class: "m-routes"}, [
                    m("div", {class: "m-routes__step-menu component-container clearfix"}, [
                        m("button", {class: "btn btn-link btn-system-link", onclick: toStep1}, _selectedUser.name),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", onclick : toStep2}, t('stepEditUser', 'RoutesManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link active"}, t('stepSalepoints', 'RoutesManageModule')),
                        m("button", {class: "btn btn-system btn-system-primary step-menu__show-salepoints-in-routes-btn", onclick: showSalepointsCountInRoutes}, t('showSalepointsInRouteBtn', 'RoutesManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", onclick : toStep4}, t('stepCalendar', 'RoutesManageModule')),
                    ]),
                    m("div", {class: "m-route__content"}, [
                        m.component(_manageRouteSalepoints)
                    ])
                ])
            break;
            case 'routeCalendar':
                return m("div", {class: "m-routes"}, [
                    m("div", {class: "m-routes__step-menu component-container clearfix"}, [
                        m("button", {class: "btn btn-link btn-system-link", onclick: toStep1}, _selectedUser.name),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", onclick : toStep2}, t('stepEditUser', 'RoutesManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", onclick : toStep3}, t('stepSalepoints', 'RoutesManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link active"}, t('stepCalendar', 'RoutesManageModule')),
                    ]),
                    m("div", {class: "m-route__content"}, [
                        m.component(_RouteCalendarModule)
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