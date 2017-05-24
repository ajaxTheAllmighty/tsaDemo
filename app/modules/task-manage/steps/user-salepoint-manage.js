'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function (config) {
    var task = config.task;
    var onModeChange = config.onModeChange;
    var _state = 'loading';
    var _mode = 'salepoint';
    var _userSourceGrid;
    var _userDestGrid;
    var _itemsToAttach = 0;
    var _salepointSourceGrid;
    var _salepointDestGrid;
    var _itemsToAttach = 0;
    var _needUpdateSource = true;
    var _itemAttachedCount = 0;
    var _salepointAttachedCount = 0;
    var _needUpdateSource = true;
    var _modalWindow = '';

    function startDetailsLoaded(data){
        if(data[0]['USE_CODE'] > data[0]['SAL_CODE']){
            _mode = 'user';
            loadUserDestGrid();
        }else{
            loadSalepointDestGrid();
        }
        onModeChange(_mode);
        _state = 'loaded';
        m.redraw();
    }

    function loadUserDestGrid(){
        _userDestGrid = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: "grid",
            allowNew: false,
            gridView: "VIEW_ST_TASK_DETAILS",
            perPage: 50,
            staticFilters: {
                1: {
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldTitle: '',
                    fieldName: "TAD_TAH_CODE",
                    filterField: "TAD_TAH_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: task.code
                },
                2: {
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "notNull",
                    fieldTitle: '',
                    fieldName: "TAD_USE_CODE",
                    filterField: "TAD_USE_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT"
                    //value: task.code
                }
            },
            customContextActions: {
                remove: {
                    showThreshold: 1,
                    name: "Удалить",
                    action: function(data){
                        removeDetails(data.selectedRows);
                    }
                }
            },
            showSelectColumn: true,
            onLoad: function(obj){
                if(_needUpdateSource){
                    loadUserSourceGrid(_userDestGrid.getSqlCondition());
                    _needUpdateSource = false;
                }
            }
        });
    }

    function loadSalepointDestGrid(){
        _salepointDestGrid = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: "grid",
            allowNew: false,
            gridView: "VIEW_ST_TASK_DETAILS",
            perPage: 50,
            staticFilters: {
                '1': {
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldTitle: '',
                    fieldName: "TAD_TAH_CODE",
                    filterField: "TAD_TAH_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: task.code
                },
                2: {
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "notNull",
                    fieldTitle: '',
                    fieldName: "TAD_SAL_CODE",
                    filterField: "TAD_SAL_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT"
                    //value: task.code
                }
            },
            customContextActions: {
                remove: {
                    showThreshold: 1,
                    name: "Удалить",
                    action: function(data){
                        removeDetails(data.selectedRows);
                    }
                }
            },
            showSelectColumn: true,
            onLoad: function(obj){
                if(_needUpdateSource){
                    loadSalepointSourceGrid(_salepointDestGrid.getSqlCondition());
                    _needUpdateSource = false;
                }
            }
        });
    }

    function loadSalepointSourceGrid(destWhere){
        _salepointSourceGrid = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: "grid",
            allowNew: false,
            gridView: "VIEW_ST_SALEPOINT",
            perPage: 50,
            staticFilters: {
                '1': {
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "notIn",
                    fieldTitle: '',
                    fieldName: "SAL_CODE",
                    filterField: "SAL_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: 'SELECT TAD_SAL_CODE FROM VIEW_ST_TASK_DETAILS ' + destWhere
                }
            },
            showSelectColumn: true,
            onLoad: function(obj){
                _itemsToAttach = obj.dataCount;
            },
            onRowCheck: function(obj){
                _itemsToAttach = obj.dataCount;
                if(_itemsToAttach === 0){
                    _itemsToAttach = _salepointSourceGrid.getTotalRows();
                }
            }
        });
        m.redraw();
    }

    function loadUserSourceGrid(destWhere){
        _userSourceGrid = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: "grid",
            allowNew: false,
            gridView: "VIEW_ST_USER",
            perPage: 50,
            staticFilters: {
                '1': {
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "notIn",
                    fieldTitle: '',
                    fieldName: "USE_CODE",
                    filterField: "USE_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: 'SELECT TAD_USE_CODE FROM VIEW_ST_TASK_DETAILS ' + destWhere
                }
            },
            showSelectColumn: true,
            onLoad: function(obj){
                _itemsToAttach = obj.dataCount;
            },
            onRowCheck: function(obj){
                _itemsToAttach = obj.dataCount;
                if(_itemsToAttach === 0){
                    _itemsToAttach = _userSourceGrid.getTotalRows();
                }
            }
        });
        m.redraw();
    }

    function removeDetails(detailsArray){
        Helper.execQuery(dataAttached, {"context": this, "module": "TaskManage UserSalepoint Step", "function": "removeDetails"}, "DELETE FROM ST_TASK_DETAILS WHERE TAD_TAH_CODE = " + task.code + " AND TAD_CODE IN ("+detailsArray.join(',')+")");
    }

    function removeDetailsWithAnotherType(){
        if(_mode === 'user'){
            Helper.execQuery(dataAttached, {"context": this, "module": "TaskManage UserSalepoint Step", "function": "removeDetailsWithAnotherType"}, "DELETE FROM ST_TASK_DETAILS WHERE TAD_TAH_CODE = " + task.code + " AND TAD_SAL_CODE IS NOT NULL");
        }else{
            Helper.execQuery(dataAttached, {"context": this, "module": "TaskManage UserSalepoint Step", "function": "removeDetailsWithAnotherType"}, "DELETE FROM ST_TASK_DETAILS WHERE TAD_TAH_CODE = " + task.code + " AND TAD_USE_CODE IS NOT NULL");
        }
    }

    function prepareToAttach(){
        if(_itemsToAttach === 0 ){
            console.log('nothing to attach');
            return;
        }

        if(_mode === 'user'){
            if(_userSourceGrid.getSelectedRows().length > 0){
                removeDetailsWithAnotherType();
                _itemAttachedCount = 0;
                _userSourceGrid.getSelectedRows().map(function(userCode){
                    Helper.insertData(itemAttached, {"context": this, "module": "TaskManage UserSalepoint Step", "function": "attachToTask"}, 'ST_TASK_DETAILS', 'TAD_TAH_CODE, TAD_USE_CODE', task.code + ',' + userCode);
                });
                _state = 'loading';
            }else{
                _modalWindow = new Modal({
                    id: 'taskManageModal',
                    state: 'show',
                    content: [
                        'Вы действительно хотите прикрепить к задаче все записи из таблицы?'
                    ],
                    isStatic: false,
                    header: 'Управление задачей',
                    isFooter: true,
                    isFullScreen: false,
                    modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                    zIndex: 1005,
                    confirmBtn: 'Ок',
                    cancelBtn: 'Отмена',
                    onConfirm: function(){
                        _state = 'loading';
                        removeDetailsWithAnotherType();
                        Helper.execQuery(dataAttached, {"context": this, "module": "TaskManage UserSalepoint Step", "function": "attachToTask"}, "EXEC ADJREC_ADD_USER_TASK @IN_SRC_VIEW_NAME = 'VIEW_ST_USER', @IN_SRC_WHERE_CLAUSE = '" + _userSourceGrid.getSqlCondition() + "', @IN_TAH_CODE = '" + task.code + "'");
                        _modalWindow = '';
                    }
                })
            }
        }else{
            if(_salepointSourceGrid.getSelectedRows().length > 0){
                removeDetailsWithAnotherType();
                _itemAttachedCount = 0;
                _salepointSourceGrid.getSelectedRows().map(function(salepointCode){
                    Helper.insertData(itemAttached, {"context": this, "module": "TaskManage UserSalepoint Step", "function": "attachToTask"}, 'ST_TASK_DETAILS', 'TAD_TAH_CODE, TAD_SAL_CODE', task.code + ',' + salepointCode);
                });
                _state = 'loading';
            }else{
                _modalWindow = new Modal({
                    id: 'taskManageModal',
                    state: 'show',
                    content: [
                        'Вы действительно хотите прикрепить к задаче все записи из таблицы?'
                    ],
                    isStatic: false,
                    header: 'Управление задачей',
                    isFooter: true,
                    isFullScreen: false,
                    modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                    zIndex: 1005,
                    confirmBtn: 'Ок',
                    cancelBtn: 'Отмена',
                    onConfirm: function(){
                        _state = 'loading';
                        removeDetailsWithAnotherType();
                        Helper.execQuery(dataAttached, {"context": this, "module": "TaskManage UserSalepoint Step", "function": "attachToTask"}, "EXEC ADJREC_ADD_SALEPOINT_TASK @IN_SRC_VIEW_NAME = 'VIEW_ST_SALEPOINT', @IN_SRC_WHERE_CLAUSE = '" + _salepointSourceGrid.getSqlCondition() + "', @IN_TAH_CODE = '" + task.code + "'");
                        _modalWindow = '';
                    }
                })
            }
        }

    }

    function showSuccessWindow(){
        _modalWindow = new Modal({
            id: 'taskManageModal',
            state: 'show',
            content: [
                'Данные успешно сохранены'
            ],
            isStatic: false,
            header: 'Сохранение деталей задачи',
            isFooter: true,
            isFullScreen: false,
            modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
            zIndex: 1005,
            confirmBtn: 'Ок',
            cancelBtn: 'none',
            onConfirm: function(){
                _state = 'loaded';
                if(_mode === 'user'){
                    loadUserDestGrid();
                    _userSourceGrid = '';
                }else{
                    loadSalepointDestGrid();
                    _salepointSourceGrid = '';
                }
                _modalWindow = '';
            }
        });
        _needUpdateSource = true;
        m.redraw();
    }

    function itemAttached(){
        _itemAttachedCount++;
        if(_itemAttachedCount === _itemsToAttach){
            if(_mode === 'user'){
                loadUserDestGrid();
                _userSourceGrid = '';
            }else{
                loadSalepointDestGrid();
                _salepointSourceGrid = '';
            }
            _state = 'success';
            showSuccessWindow();
        }
    }
    
    function dataAttached(){
        _state = 'success';
        showSuccessWindow();
    }

    function changeMode(mode){
        _mode = mode;
        if(_mode === 'user'){
            loadUserDestGrid();
        }else{
            loadSalepointDestGrid();
        }
        _needUpdateSource = true;
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        //get task details
        Helper.getData(startDetailsLoaded, {"context": this, "module": "TaskManage UserSalepoint Step", "function": "controller"}, 'COUNT(TAD_SAL_CODE) AS SAL_CODE, COUNT(TAD_USE_CODE) AS USE_CODE', 'VIEW_ST_TASK_DETAILS', "WHERE TAD_TAH_CODE = " + task.code);
    }

    function view(){
        switch(_state){
            case 'loading':
                return m("div", {class: "TM-userSalepoint"}, [
                    new Modal({
                        id: 'taskManageLoadingModal',
                        state: 'show',
                        content: [
                            m("img", {
                                class: "grid-loading-modal__body--loader",
                                src: "dist/assets/images/loading.gif"
                            }),
                            'Идет обработка данных...',
                            m("p", {class: "grid-loading-modal__message"}, t('loadingModalBodyWarningMsg', 'GridModule'))
                        ],
                        isStatic: true,
                        header: 'Обработка данных',
                        isFooter: false,
                        isFullScreen: false,
                        modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                        zIndex: 1005
                    })
                ])
            break;
            case 'loaded':
                return m("div", {class: "TM-userSalepoint"}, [
                    m("div", {class: "TM-userSalepoint__source-container"}, [
                        m("div", {class: "TM-userSalepoint__source-grid-container"},
                            _mode === 'user' ? _userSourceGrid : _salepointSourceGrid
                        )
                    ]),
                    m("div", {class: "TM-userSalepoint__add-btn-container"}, [
                        m("button", {class: "btn btn-default TM-userSalepoint__add-btn", onclick: prepareToAttach}, [
                            '>>',
                            m("br"),
                            '(' + (_mode === 'user' ? _itemsToAttach : _itemsToAttach) + ')'
                        ])
                    ]),
                    m("div", {class: "TM-userSalepoint__dest-container"}, [
                        _mode === 'user' ? _userDestGrid : _salepointDestGrid
                    ]),
                    _modalWindow
                ])
            break;
            case 'success':
                return m("div", {class: "TM-userSalepoint"},
                    _modalWindow
                )
            break;
        }
    }

    return {
        controller: controller,
        view: view,
        changeMode: changeMode
    }
}