'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
module.exports = function (config) {
    var selectedUser = config.selectedUser;
    var _state = 'loading';
    var _sourceGrid;
    var _selectedRoute = false;
    var _newRouteCode = false;
    var _routeList = {};
    var _routesCodes = [];
    var _routeSalepoints = {};
    var _routeSalepointsSelected = [];
    var _salepointsAdded = 0;
    var _lastSelectedSalepoint = false;
    var _shiftPressed = false;
    var _salepointIndexCodeArray = [];
    var _showSourceGrid = false;
    var _isDragging = false;

    function getUserRoutes(){
        Helper.getData(buildRouteList, {"context": this, "module": "ManageSalepointInRoutesModule", "function": "getUserRoutes"}, '*', 'VIEW_ST_ROUTE', "WHERE ROU_USE_CODE = " + selectedUser);
    }

    function buildRouteList(data){
        _routeList = data;
        data.map(function(routeObj){
            _routesCodes.push(routeObj['ROU_CODE'])
        });
        _state = 'routesLoaded';
        m.redraw();
    }

    function routeChanged(){
        _showSourceGrid = false;
        _routeSalepoints = {};
        _routeSalepointsSelected = [];
        _salepointIndexCodeArray = [];
        _selectedRoute = {
            code: this.options[this.selectedIndex].value,
            group: this.options[this.selectedIndex].getAttribute('data-group'),
            name: this.options[this.selectedIndex].innerText
        };
        _sourceGrid = new GridModule({
            moduleId: Globals.registerModule('grid'),
            allowNew: false,
            allowDrag: true,
            onDragStart: function(){
                _isDragging = true;
            },
            onDragEnd: function(){
                _isDragging = false;
            },
            gridView: 'VIEW_ST_SALEPOINT',
            perPage: 50,
            showSelectColumn: true,
            staticFilters: {
                '1': {
                    showCustomText: true,
                    andOrCondition: "AND",
                    condition: "notIn",
                    fieldTitle: t('salepointSourceGridStaticFilterLabel', 'RM_manageSalepointModule', {route: _selectedRoute.name}),
                    fieldName: "SAL_CODE",
                    filterField: "SAL_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: (Object.keys(_routeSalepoints).length > 0 ? Object.keys(_routeSalepoints).join(',') : 0)
                }
            }
        });
        Helper.getData(getSalepointFromRoute, {"context": this, "module": "ManageSalepointInRoutesModule", "function": "routeChanged"}, 'SAL_CODE', 'VIEW_ST_ROUTE_SALEPOINT', "WHERE ROS_ROU_CODE = " + _selectedRoute.code);
    }

    function getSalepointFromRoute(data){
        _state = 'salepointsLoaded';
        if(data.length > 0){
            _showSourceGrid = false;
            var salCodes = [];
            data.map(function(salObj){
                salCodes.push(salObj['SAL_CODE']);
            })
            getSalepointsData(salCodes);
        }else{
            _showSourceGrid = true;
            m.redraw();
        }
    }

    //drag and drop
    function getSalepointCodes(ev){
        ev.preventDefault();
        if(ev.dataTransfer.getData("codes") != ''){
            var salepointCodes = ev.dataTransfer.getData("codes").split(',');
            getSalepointsData(salepointCodes);
        }
    }

    function getSalepointsData(salCodes){
        Helper.getData(addSalepointsToRoute, {"context": this, "module": "ManageSalepointInRoutesModule", "function": "getSalepointsData"}, 'SAL_CODE, SAL_ID, SAL_NAME, SAL_ADDRESS, LOC_NAME', 'VIEW_ST_SALEPOINT', "WHERE SAL_CODE IN ("+salCodes.join(',')+")");
    }

    function addSalepointsToRoute(data){
        data.map(function(salObj){
            if(typeof _routeSalepoints[salObj['SAL_CODE']] == 'undefined'){
                _routeSalepoints[salObj['SAL_CODE']] = salObj;
            }
        });
        var staticFilters = {
            '1': {
                showCustomText: true,
                andOrCondition: "AND",
                condition: "notIn",
                fieldTitle: t('salepointSourceGridStaticFilterLabel', 'RM_manageSalepointModule', {route: _selectedRoute.name}),
                fieldName: "SAL_CODE",
                filterField: "SAL_CODE",
                id: "1",
                isGroupCondition: true,
                type: "INT",
                value: (Object.keys(_routeSalepoints).length > 0 ? Object.keys(_routeSalepoints).join(',') : 0)
            }
        };
        _showSourceGrid = true;
        _sourceGrid.refresh({
            staticFilters: staticFilters
        });
        m.redraw();
    }

    function allowDrop(ev){
        ev.preventDefault();
    }

    function selectSalepointRow(){
        var key = parseInt(this.getAttribute('data-key'));
        var rowIndex = parseInt(this.getAttribute('data-index'));
        if(!_shiftPressed){
            _lastSelectedSalepoint = rowIndex;
            if(this.checked){
                _routeSalepointsSelected.push(key);
            }else{
                var index = _routeSalepointsSelected.indexOf(key);
                if(index != -1){
                    _routeSalepointsSelected.splice(index, 1);
                }
            }
        }else{
            var start = rowIndex;
            var end = _lastSelectedSalepoint;
            if(rowIndex > _lastSelectedSalepoint){
                start = _lastSelectedSalepoint;
                end = rowIndex;
            }

            for (var i = start; i < end+1; i++) {
                var key = _salepointIndexCodeArray[i];
                //check all
                if(this.checked){
                    if(_routeSalepointsSelected.indexOf(key) == -1){
                        _routeSalepointsSelected.push(key);
                    }
                }else{
                    var index = _routeSalepointsSelected.indexOf(key);
                    if(index != -1){
                        _routeSalepointsSelected.splice(index, 1);
                    }
                }
            }
            m.redraw();
        }
    }

    function saveRoute(){
        if(Object.keys(_routeSalepoints).length > 0){
            //create new route
            _salepointsAdded = 0;
            Helper.insertData(deactivateOldRoute, {"context": this, "module": "ManageSalepointInRoutesModule", "function": "saveRoute"}, 'ST_ROUTE', 'ROU_NAME, ROU_GROUP, ROU_USE_CODE, ROU_IS_ACTIVE, CMP_CODE', "'"+_selectedRoute.name+"', '"+_selectedRoute.group+"' ,"+selectedUser+",1,"+Globals.getUserData()['CMP_CODE']);
        }else{
            GlobalInfoSystemMessage.init({
                state: "show",
                header: t('routeSavingErrorHeader', 'RM_manageSalepointModule'),
                messages: [t('routeSavingErrorNoSalepoint1', 'RM_manageSalepointModule'), t('routeSavingErrorNoSalepoint2', 'RM_manageSalepointModule')],
                afterClose: null
            });
        }
    }

    function deactivateOldRoute(data){
        var insertedKey = data[0]['key'];
        if(Helper.isNumeric(insertedKey)){
            _newRouteCode = insertedKey;
            Helper.updateData(addSalepointsToNewRoute, {"context": this, "module": "ManageSalepointInRoutesModule", "function": "deactivateOldRoute"}, 'ROU_IS_ACTIVE = 0', 'ST_ROUTE', "ROU_CODE = "+_selectedRoute.code);
        }else{
            //error
            GlobalSystemMessage.init({
                state: 'show',
                header: t('header', 'Helper'),
                messages: ['Ошибка создания маршрута!'],
                messagesToShow: ['Ошибка создания маршрута!'],
                afterClose: null
            });
        }
    }

    function addSalepointsToNewRoute(){
        Helper.objectToArray(_routeSalepoints).map(function(salObj){
            Helper.insertData(salepointAddedToNewRoute, {"context": this, "module": "ManageSalepointInRoutesModule", "function": "addSalepointsToNewRoute"}, 'ST_ROUTE_SALEPOINT', 'ROS_ROU_CODE, ROS_SAL_CODE', "'"+_newRouteCode+"',"+salObj['SAL_CODE']);
        })
    }

    function salepointAddedToNewRoute(){
        _salepointsAdded++;
        if(Object.keys(_routeSalepoints).length == _salepointsAdded){
            GlobalInfoSystemMessage.init({
                state: "show",
                header: t('savingRouteModalHeader', 'RM_manageSalepointModule'),
                messages: [t('savingRouteModalMessage', 'RM_manageSalepointModule')],
                afterClose: function(){
                    _selectedRoute = false;
                    _routeSalepoints = {};
                    getUserRoutes();
                }
            });
        }
    }

    function removeSalepointsFromRoute(){
        _routeSalepointsSelected.map(function(salCode){
            delete _routeSalepoints[salCode];
        })
        _routeSalepointsSelected = [];
        var staticFiltersArray = {
            '1': {
                andOrCondition: "AND",
                condition: "notIn",
                fieldTitle: t('salepointSourceGridStaticFilterLabel', 'RM_manageSalepointModule', {route: _selectedRoute.name}),
                fieldName: "SAL_CODE",
                filterField: "SAL_CODE",
                id: "1",
                isGroupCondition: true,
                type: "INT",
                value: (Object.keys(_routeSalepoints).length > 0 ? Object.keys(_routeSalepoints).join(',') : 0)
            }
        };
        _sourceGridConfig.staticFiltersArray = staticFiltersArray;
        _showSourceGrid = true;
        _sourceGrid.refresh({
            staticFiltersArray: staticFiltersArray
        });
        m.redraw();
    }
    
    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {

    }

    function view(ctrl) {
        switch(_state){
            case 'loading':
                getUserRoutes();
                return m("div", {class: "b-manage-route-salepoint"}, [
                    'LOADING...'
                ]);
            break;
            case 'routesLoaded':
                return m("div", {class: "b-manage-route-salepoint"}, [
                    m("div", {class: "b-manage-route-salepoint__source-wrapper"}, [
                        m("div", {class: "component-container source-salepoint-grid_empty"}, [
                            m("p", t('instructionRow1', 'RM_manageSalepointModule')),
                            m("p", t('instructionRow2', 'RM_manageSalepointModule')),
                            m("p", t('instructionRow3', 'RM_manageSalepointModule')),
                            m("p", t('instructionRow4', 'RM_manageSalepointModule')),
                            m("p", t('instructionRow5', 'RM_manageSalepointModule'))
                        ])
                    ]),
                    m("div", {class: "b-manage-route-salepoint__destination-wrapper"}, [
                        m("div", {class: "salepoint-destination__tools-container component-container clearfix"}, [
                            m("select", {class: "form-control sdtc__choose-route-select", onchange: routeChanged}, [
                                m("option", {disabled: "disabled", selected: true}, t('chooseRoutePlaceholder', 'RM_manageSalepointModule')),
                                _routeList.map(function(routeObj){
                                    return m("option", {value: routeObj['ROU_CODE'], "data-group": routeObj['ROU_GROUP']}, routeObj['ROU_NAME'])
                                })
                            ]),
                            m("button", {class: "btn btn-system btn-success sdtc__save-route-btn", disabled: "disabled"}, t('saveRouteBtnDisabled', 'RM_manageSalepointModule'))
                        ]),
                        m("div", {class: "salepoint-destination__grid component-container clearfix"}, [
                            m("table", {class: "table table-bordered table-header salepoint-destination__table_header"}, [
                                m("thead", [
                                    m("tr", {}, [
                                        m("th", {class: "dsth__sal-code"}, t('salepointTableColumnCode', 'RM_manageSalepointModule')),
                                        m("th", {class: "dsth__sal-name"}, t('salepointTableColumnName', 'RM_manageSalepointModule')),
                                        m("th", {class: "dsth__sal-address"}, t('salepointTableColumnAddress', 'RM_manageSalepointModule')),
                                        m("th", {class: "dsth__sal-bdn"}, t('salepointTableColumnDirection', 'RM_manageSalepointModule'))
                                    ])
                                ]),
                                m("tbody", [
                                    Helper.objectToArray(_routeSalepoints).map(function(salObj){
                                        return m("tr", [
                                            m("td", {class: "dsth__sal-code"}, salObj['SAL_ID']),
                                            m("td", {class: "dsth__sal-name"}, salObj['SAL_NAME']),
                                            m("td", {class: "dsth__sal-address"}, salObj['SAL_ADDRESS']),
                                            m("td", {class: "dsth__sal-bdn"}, salObj['LOC_NAME'])
                                        ])
                                    })
                                ])
                            ])
                        ])
                    ])
                ]);
            break;
            case 'salepointsLoaded':
                var moduleConfig = function(el){
                    el.onkeydown = function(e){
                        if(e.keyCode == 16){
                            _shiftPressed = true;
                        }
                    }
                    el.onkeyup = function(e){
                        if(e.keyCode == 16){
                            _shiftPressed = false;
                        }
                    }
                }

                return m("div", {class: "b-manage-route-salepoint", config: moduleConfig}, [
                    m("div", {class: "b-manage-route-salepoint__source-wrapper"}, [
                        (_showSourceGrid ? m.component(_sourceGrid) : 'Loading...')
                    ]),
                    m("div", {class: "b-manage-route-salepoint__destination-wrapper"}, [
                        m("div", {class: "salepoint-destination__tools-container component-container clearfix"}, [
                            m("select", {class: "form-control sdtc__choose-route-select", onchange: routeChanged}, [
                                m("option", {disabled: "disabled", selected:"selected"}, t('chooseRoutePlaceholder', 'RM_manageSalepointModule')),
                                _routeList.map(function(routeObj){
                                    return m("option", {value: routeObj['ROU_CODE'], selected: (routeObj['ROU_CODE'] == _selectedRoute.code ? "selected" : "")}, routeObj['ROU_NAME'])
                                })
                            ]),
                            (_routeSalepointsSelected.length > 0 ?
                                m("button", {class: "btn btn-system btn-system-primary sdtc__remove-salepoint-btn", onclick: removeSalepointsFromRoute}, t('removeSalepointsBtn', 'RM_manageSalepointModule', {count: _routeSalepointsSelected.length}) ) :
                                m("button", {class: "btn btn-system btn-success sdtc__save-route-btn", onclick: saveRoute}, t('saverouteBtn', 'RM_manageSalepointModule', {count: Object.keys(_routeSalepoints).length}) )
                            )
                        ]),
                        m("div", {class: "salepoint-destination__grid component-container clearfix"}, [
                            m("div", {class: "salepoint-destination__drag-container"+(_isDragging ? '_drag' : ''), ondrop: getSalepointCodes, ondragover: allowDrop}, [
                                m("table", {class: "table table-bordered table-striped table-header salepoint-destination__table_header"}, [
                                    m("thead", [
                                        m("tr", [
                                            m("th", {class: "dsth__select"}),
                                            m("th", {class: "dsth__sal-code"}, t('salepointTableColumnCode', 'RM_manageSalepointModule')),
                                            m("th", {class: "dsth__sal-name"}, t('salepointTableColumnName', 'RM_manageSalepointModule')),
                                            m("th", {class: "dsth__sal-address"}, t('salepointTableColumnAddress', 'RM_manageSalepointModule')),
                                            m("th", {class: "dsth__sal-bdn"}, t('salepointTableColumnDirection', 'RM_manageSalepointModule'))
                                        ])
                                    ]),
                                    m("tbody", [
                                        Helper.objectToArray(_routeSalepoints).map(function(routeObj, index){
                                            var key = routeObj['SAL_CODE'];
                                            _salepointIndexCodeArray[index] = key;
                                            return m("tr", {class: (_routeSalepointsSelected.indexOf(key) != -1 ? "selected-row" : "")}, [
                                                m("td", {class: "dsth__select"},
                                                    m("input", {type: "checkbox", "data-index": index, "data-key": key, checked: (_routeSalepointsSelected.indexOf(key) != -1 ? "checked" : ""), onchange: selectSalepointRow})
                                                ),
                                                m("td", {class: "dsth__sal-code"}, routeObj['SAL_ID']),
                                                m("td", {class: "dsth__sal-name"}, routeObj['SAL_NAME']),
                                                m("td", {class: "dsth__sal-address"}, routeObj['SAL_ADDRESS']),
                                                m("td", {class: "dsth__sal-bdn"}, routeObj['LOC_NAME'])
                                            ])
                                        })
                                    ])
                                ])
                            ])
                        ]),
                    ])
                ]);
            break;
        }
    }

    return{
        controller: controller,
        view: view
    }
}

