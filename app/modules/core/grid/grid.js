'use strict';
var m = require('mithril');
var ColumnModelModule = require('./column-model.js');
var Helper = require('../../../components/helper.js')();
var SqlHelper = require('../../../components/sql-helper.js')();
var SpinnerComponent = require('../../../components/spinner/spinner.js');
var PaginationComponent = require('../../../components/pagination/pagination.js');
var Modal = require('../../../components/modal-window/modal-window.js');
var FilterModule = require('../filter/filter.js');
var GroupEditModule = require('../group-edit/group-edit.js');
var ExportCsvModule = require('../../export-csv/export.js');

module.exports = function (config) {
    //PUBLIC
    var moduleId = config.moduleId || 'GridModule';
    var gridView = config.gridView || false;
    var mode = config.mode || 'grid'; //picker, key-grid
    var additionalColumns = config.additionalColumns || {};
    var showSelectColumn = config.showSelectColumn;
    var staticFilters = config.staticFilters || [];
    var contextActionsList = config.contextActionsList || ['rowMode'];
    console.log(contextActionsList);
    var customContextActions = config.customContextActions || {};
    var allowNew = config.allowNew;
    var allowDrag = config.allowDrag || false;

    var cardFieldObject = config.cardFieldObject || false;
    var keyField = config.keyField || false;
    var isModal = config.isModal || false;
    var modalHeader = config.modalHeader || false;
    var zIndex = config.zIndex || 1000;
    //events
    var onRowClick = config.onRowClick || function(key){};
    var onRowCheck = config.onRowCheck || function(object){};
    var onLoad = config.onLoad || function(object){};
    var onClose = config.onClose || null;
    var onDragStart = config.onDragStart || null;
    var onDragEnd = config.onDragEnd || null;

    //PRIVATE
    var _state = 'loading';
    var _viewDataFilter;
    var _activeFilterValue = 'active';
    var _isActiveFilter = false;
    var _whereClause = '';
    var _currentPage = 1;
    var _perPage = 50;
    var _orderState = {field: false, state: false};
    var _currentFilters = [];
    var _gridData = [];
    var _gridDataCount = [];
    var _rowMode = 'multi'; //single/multi
    var _needRemoveColumnsSize = false;

    //column with checkbox
    var _selectedRows = [];
    var _lastCheckedIndex = false;
    var _shiftPressed = false;
    var _keyIndexArray = [];
    var _mainCheckboxChecked = false;

    //context actions
    var _contextActions = {
        export: {
            showThreshold: 0,
            name: t('exportCsvBtn', 'GridModule'),
            action: function(){
                showExport();
            }
        },
        groupEdit: {
            showThreshold: 2,
            name: t('groupEdit', 'GridModule'),
            action: function(){
                showGroupEdit(_selectedRows);
            }
        },
        rowMode: {
            showThreshold: 0,
            name: _rowMode === 'single' ? t('multiRowMode', 'GridModule') : t('singleRowMode', 'GridModule'),
            action: rowsModeToggle
        }
    };

    //MODULES & COMPONENTS
    var ColumnModel;
    var _Spinner;
    var _Pagination;
    var _Filter = false;
    var _Card = false;
    var _ExportCsv = false;
    var _GroupEdit = false;

    ///////////////////////////////
    //      GRID FUNCTIONS       //
    ///////////////////////////////

    function getGridColumns(){
        //try{
        //    Helper.getData(gridColumnsLoaded, {"context": this, "module": "Grid module", "function": "getGridColumns"},
        //        '*',
        //        'VIEW_ISC_TABLE_FILTER',
        //        "WHERE (TABLE_NAME = '" + gridView + "' AND TRF_USR_CODE = " + Globals.getUserData()['USR_CODE']  + " AND TRF_FIELD_ACCESS > 0) OR (TABLE_NAME = '" + gridView + "' AND TRF_USR_CODE = " + Globals.getUserData()['USR_CODE']  + " AND FIL_IS_PRIMARY_KEY = 1) OR (TABLE_NAME = '" + gridView + "' AND TRF_USR_CODE = " + Globals.getUserData()['USR_CODE']  + " AND FIL_SHOW_IN_FILTER = 1)",
        //        "FIL_SHOW_ORDER");
        //}catch(e){
        //    _state = 'error';
        //    console.log('Unable get view column list!');
        //    console.log('Error! ' + e.name + ":" + e.message + "\n" + e.stack);
        //}
        var columns = [];
        switch(gridView){
            case 'VIEW_ST_SALEPOINT':
                columns = SalepointColumns;
                break;
            case 'VIEW_ST_PRODUCTS':
                columns = ProductColumns;
                break;
            case 'VIEW_ST_USER':
                columns = UsersColumns;
                break;
        }
        gridColumnsLoaded(columns);
    }

    function gridColumnsLoaded(columns){
        ColumnModel = new ColumnModelModule(columns, additionalColumns);
        //try{
        //    Helper.getData(getViewFilterData, {"context": this, "module": "Grid module", "function": "columnsLoaded"}, 'FIL_USE_HIERARCHY, FIL_LOC_HIERARCHY,FIL_USE_SINGLE_HIERARCHY, FIL_USE_COMPANY, FIL_USE_ACTIVITY', 'ST_FILTER', "WHERE (FIL_IS_PRIMARY_KEY = 1) AND (FIL_VIEW_NAME = '" + gridView + "')");
        //}catch(e){
        //    _state = 'error';
        //    console.log('Unable get view default filter data!');
        //    console.log('Error! ' + e.name + ":" + e.message + "\n" + e.stack);
        //}
        getViewFilterData();
    }

    //get default view filter data
    function getViewFilterData(data){
        //_viewDataFilter = data[0];
        getGridDataRequest();
    }

    function getGridDataRequest(){
        _state = 'loading';
        _mainCheckboxChecked = false;
        var start = (_currentPage - 1)*_perPage;
        var end = (_currentPage)*_perPage;
        var orderExpression = null;
        var whereClauseResult = SqlHelper.buildWhereClause(_viewDataFilter, _activeFilterValue);
        _selectedRows = [];
        _keyIndexArray = [];
        _lastCheckedIndex = false;
        _whereClause = whereClauseResult.where;
        _isActiveFilter = whereClauseResult.isActiveFilter;
        if(_orderState.field){
            orderExpression = _orderState.field + ' ' + _orderState.state;
        }
        //try{
        //    Helper.getData(getGridData, {"context": this, "module": "Grid module", "function": "getGridDataRequest"}, ColumnModel.getColumnsForQuery().join(','), gridView, _whereClause + SqlHelper.buildWhere(_currentFilters) + SqlHelper.buildWhere(staticFilters), orderExpression, start ,end);
        //}catch(e){
        //    _state = 'error';
        //    console.log('Unable get grid data!');
        //    console.log('Error! ' + e.name + ":" + e.message + "\n" + e.stack);
        //}
        var gridData = [];
        switch(gridView){
            case 'VIEW_ST_SALEPOINT':
                gridData = SalepointData;
                break;
            case 'VIEW_ST_PRODUCTS':
                gridData = ProductData;
                break;
            case 'VIEW_ST_USER':
                gridData = UsersData;
                break;
        }
        getGridData(gridData);

    }

    function getGridData(data){
        _gridData = data;
        //try{
        //    Helper.getData(getGridDataCount, {"context": this, "module": "Grid module", "function": "getGridData"}, 'COUNT(*) AS DATA_COUNT', gridView, _whereClause + SqlHelper.buildWhere(_currentFilters) + SqlHelper.buildWhere(staticFilters));
        //}catch(e){
        //    _state = 'error';
        //    console.log('Unable get grid data count!');
        //    console.log('Error! ' + e.name + ":" + e.message + "\n" + e.stack);
        //}
        getGridDataCount(data.length);
    }

    function getGridDataCount(count){
        _state = 'grid';
        _gridDataCount = count;
        initPagination();
        initSpinner();
        onLoad({dataCount: _gridDataCount});
        m.redraw();
    }

    ////////////////////////////////////
    //          GRID ACTIONS          //
    ////////////////////////////////////

    function removeFilter(){
        var filterIindex = this.getAttribute('data-index');
        _currentFilters.splice(filterIindex, 1);
        _currentPage = 1;
        $('.popover').popover('hide');
        getGridDataRequest();
    }

    function sortAsc(){
        var field = this.getAttribute('data-field');
        _orderState = {field: field, state: 'ASC'};
        getGridDataRequest();
    }

    function sortDesc(){
        var field = this.getAttribute('data-field');
        _orderState = {field: field, state: 'DESC'};
        getGridDataRequest();
    }

    function hideGridColumn(){
        var columnName = this.getAttribute('data-column');
        ColumnModel.hideColumn(columnName);
        _needRemoveColumnsSize = true;
        m.redraw();
    }

    function showGridColumn(){
        var columnName = this.value;
        this.options[0].selected = true;
        ColumnModel.showColumn(columnName);
        _needRemoveColumnsSize = true;
        m.redraw();
    }

    function rowsModeToggle(){
        if(_rowMode === 'single'){
            _rowMode = 'multi';
        }else{
            _rowMode = 'single';
        }
        _contextActions['rowMode'].name =  _rowMode === 'single' ? t('multiRowMode', 'GridModule') : t('singleRowMode', 'GridModule');
    }

    function startDrag(ev){
        if(_selectedRows.length > 0){
            //multiple drag
            ev.dataTransfer.setData("codes", _selectedRows);
        }else{
            //single drag without checking checkbox
            ev.dataTransfer.setData("codes", ev.srcElement.getAttribute('data-key'));
        }
        onDragStart();
    }

    function endDrag(ev){
        onDragEnd();
    }

    function checkUncheckAll(){
        _selectedRows = [];
        if(!_mainCheckboxChecked){
            _selectedRows = [];
            _gridData.map(function(rowObject, index) {
                _selectedRows.push(rowObject[ColumnModel.getPrimaryKeyObject()['COLUMN_NAME']]);
            })
        }
        _mainCheckboxChecked = !_mainCheckboxChecked;
        onRowCheck({dataCount: _selectedRows.length});
    }

    function selectRow(){
        var key = parseInt(this.getAttribute('data-key'));
        var rowIndex = parseInt(this.getAttribute('data-index'));
        if(!_shiftPressed){
            _lastCheckedIndex = rowIndex;
            if(this.checked){
                _selectedRows.push(key);
            }else{
                var index = _selectedRows.indexOf(key);
                if(index != -1){
                    _selectedRows.splice(index, 1);
                }
            }
        }else{
            var start = rowIndex;
            var end = _lastCheckedIndex;
            if(rowIndex > _lastCheckedIndex){
                start = _lastCheckedIndex;
                end = rowIndex;
            }

            for (var i = start; i < end+1; i++) {
                var key = _keyIndexArray[i];
                //check all
                if(this.checked){
                    if(_selectedRows.indexOf(key) == -1){
                        _selectedRows.push(key);
                    }
                }else{
                    var index = _selectedRows.indexOf(key);
                    if(index != -1){
                        _selectedRows.splice(index, 1);
                    }
                }
            }
            //m.redraw();
        }
        _mainCheckboxChecked = (_selectedRows.length === _gridData.length);
        onRowCheck({dataCount: _selectedRows.length});
    }

    function rowClick(){
        var viewPrimaryKeyValue = this.getAttribute('data-key');
        switch(mode){
            case 'grid':
                _Card = new CardModule;
                _Card.load({
                    id: 'gridCard-'+Globals.registerModule('card'),
                    viewPrimaryKeyValue: viewPrimaryKeyValue,
                    view: gridView,
                    viewPrimaryKeyObject: ColumnModel.getPrimaryKeyObject(),
                    state: 'loading',
                    onCardSave: function () {
                        getGridDataRequest();
                    },
                    zIndex: zIndex+1
                });
                break;
            case 'picker':
                var rowIndex = this.getAttribute('data-index');
                var rowObject = _gridData[rowIndex];
                var title = typeof rowObject[cardFieldObject.dropDownName] !== 'undefined' ? rowObject[cardFieldObject.dropDownName] : '';
                onRowClick({key: viewPrimaryKeyValue, title: title, cardObject: cardFieldObject});
                //_state = 'default';
                break;
            case 'key-grid':
                _Card = new CardModule;
                _Card.load({
                    id: 'gridCard-'+Globals.registerModule('card'),
                    viewPrimaryKeyValue: viewPrimaryKeyValue,
                    view: gridView,
                    viewPrimaryKeyObject: ColumnModel.getPrimaryKeyObject(),
                    state: 'loading',
                    onCardSave: function () {
                        getGridDataRequest();
                    },
                    zIndex: zIndex+1
                });
                break
        }
    }

    function refresh(config){
        staticFilters = config.staticFilters || staticFilters;
        if( _state == 'grid'){
            _state = 'loading';
            getGridDataRequest();
            m.redraw();
        }
    }

    /////////////////////////////////////////////
    //          COMPONENTS & MODULES           //
    /////////////////////////////////////////////

    function initPagination(){
        _Pagination = new PaginationComponent({
            items: _gridDataCount,
            itemsOnPage: _perPage,
            currentPage: _currentPage,
            onPageClick: function (page) {
                _currentPage = page;
                getGridDataRequest();
            }
        });
    }

    function initSpinner(){
        _Spinner = new SpinnerComponent;
        _Spinner.init({
            perPage: _perPage,
            step: 50,
            min: 50,
            max: 500,
            onStepChange: function (perPage) {
                _perPage = perPage;
                _currentPage = 1;
                getGridDataRequest();
            }
        });
    }

    function showFilterModal(){
        if(!_Filter){
            _Filter = new FilterModule({
                id: Globals.registerModule('filter'),
                filters: _currentFilters,
                filterFields: ColumnModel.getFilterFields(),
                activeFilter: _isActiveFilter,
                activeFilterValue: _activeFilterValue,
                onFiltersChange: function (filters, activeFilterValue) {
                    _currentPage = 1;
                    _currentFilters = filters.slice();
                    _activeFilterValue = activeFilterValue;
                    getGridDataRequest();
                },
                onCancel: function(){
                    _state = 'grid';
                }
            });
        }else{
            _Filter.show({
                filters: _currentFilters
            });
        }
    }

    function createCard(){
        _Card = new CardModule;
        if(mode === 'key-grid'){
            _Card.load({
                id: 'gridCard-'+Globals.registerModule('card'),
                view: gridView,
                viewPrimaryKeyObject: ColumnModel.getPrimaryKeyObject(),
                keyField: {name: keyField.name, value: keyField.value},
                state: 'loading',
                mode: 'create',
                onCardSave: function () {
                    getGridDataRequest();
                }
            });
        }else{
            _Card.load({
                id: 'gridCard-'+Globals.registerModule('card'),
                view: gridView,
                viewPrimaryKeyObject: ColumnModel.getPrimaryKeyObject(),
                state: 'loading',
                mode: 'create',
                onCardSave: function () {
                    getGridDataRequest();
                },
                zIndex: zIndex+1
            });
        }
    }

    function showExport(){
        _ExportCsv = new ExportCsvModule({
            isReport: false,
            gridView: gridView,
            rowsCount: _gridDataCount,
            where: _whereClause + SqlHelper.buildWhere(_currentFilters) + SqlHelper.buildWhere(staticFilters)
        });
    }

    function showGroupEdit(keys){
        _GroupEdit = new GroupEditModule({
            keys: keys,
            editableFields: [],
            totalRows: _gridDataCount,
            viewPrimaryKeyObject: ColumnModel.getPrimaryKeyObject(),
            view: gridView,
            where: _whereClause + SqlHelper.buildWhere(_currentFilters) + SqlHelper.buildWhere(staticFilters),
            onSave: function(){
                _GroupEdit = '';
                getGridDataRequest();
            },
            onClose: function(){
                _GroupEdit = '';
            }
        });
    }

    ///////////////////////////////////////////////////
    //                  VIEW PARTS                   //
    ///////////////////////////////////////////////////

    function showActiveFilter(){
        if(_isActiveFilter){
            var btnContent = '';
            switch(_activeFilterValue){
                case 'active':
                    btnContent = t('activeFilterActiveRows', 'GridModule');
                    break;
                case 'inactive':
                    btnContent = t('activeFilterInactiveRows', 'GridModule');
                    break;
                case 'all':
                    btnContent = t('activeFilterallRows', 'GridModule');
                    break;
            }
            var hintContent = t('activeFilterShowMsg', 'GridModule')+'<strong>'+btnContent+'</strong>';
            return m("div", {class: "filter-tool__active-filters-container"}, [
                m("button", {type: "button", class: "btn btn-link btn-system btn-static-filter", "data-toggle": "popover", "data-placement": "bottom", "data-content": m.trust(hintContent), config: function (el) {$(el).popover({ trigger: "hover", html : true });}}, btnContent)
            ])
        }
        return m("div", {class: "filter-tool__active-filters-container"});
    }

    function showTopFilters(){
        var filterConditions = SqlHelper.getFilterConditions();
        return m("div", {class: "filter-tool__main-filters-container"}, [
            _currentFilters.map(function (filterObj, fIndex) {
                var hintContent;
                if(filterObj['condition']){
                    switch(filterObj['condition']){
                        case 'between':
                            hintContent = '<strong>' + filterObj.fieldTitle + '</strong> ' + filterConditions[filterObj.condition]['text'] + ' '+t('dateRangeStart', 'GridModule')+' \'<strong>' + filterObj['value']['start']+'</strong>\' <br>'+t('dateRangeEnd', 'GridModule')+' \'<strong>' + filterObj['value']['end']+'</strong>\'';
                            break;
                        case 'null':
                            hintContent = '<strong>' + filterObj.fieldTitle + ' ' + filterConditions[filterObj.condition]['text'] + '</strong> ';
                            break;
                        case 'notNull':
                            hintContent = '<strong>' + filterObj.fieldTitle + ' ' + filterConditions[filterObj.condition]['text'] + '</strong> ';
                            break;
                        default :
                            hintContent = '<strong>' + filterObj.fieldTitle + '</strong> ' + filterConditions[filterObj.condition]['text'] + ' \'<strong>' + (filterObj.hasOwnProperty('valueText') ? filterObj['valueText'] : filterObj['value'])+'</strong>\'';
                            break
                    }
                    return m("button", {type: "button", class: "btn btn-system btn-delete-filter", "data-toggle": "popover", "data-placement": "bottom", "data-content": m.trust(hintContent), "data-index": fIndex, onclick: removeFilter, config: function (el) {$(el).popover({ trigger: "hover", html : true });}},
                        filterObj.fieldTitle,
                        m("span", m.trust('×'))
                    )
                }
            }),
            m("button", {class: "btn btn-system filter-tool__add-button_second hidden", onclick: showFilterModal}, 'Еще'),
        ])
    }

    function showStaticFilters(){
        var filterConditions = SqlHelper.getKeyGridFilterConditions();
        return Helper.objectToArray(staticFilters).map(function (filterObj) {
            var hintContent;
            if(filterObj['condition'] && !filterObj['isHidden']){
                if(filterObj['condition'] == 'between'){
                    hintContent = '<strong>' + filterObj.fieldTitle + '</strong> ' + filterConditions[filterObj.condition]['text'] + ' с \'<strong>' + filterObj['value']['start']+'</strong>\' <br>по \'<strong>' + filterObj['value']['end']+'</strong>\'';
                }else if(filterObj['showCustomText']){
                    hintContent = '<strong>' + filterObj.fieldTitle + '</strong>';
                }
                else{
                    hintContent = '<strong>' + filterObj.fieldTitle + '</strong> ' + filterConditions[filterObj.condition]['text'] + ' \'<strong>' + filterObj['value']+'</strong>\'';
                }
                var hintConfig = function(el){
                    $(el).popover({ trigger: "hover", html : true });
                }
                return m("div", {class: "filter-tool__static-filters-container"}, [
                    m("button", {type: "button", class: "btn btn-link btn-system btn-static-filter", "data-toggle": "popover", "data-placement": "bottom", "data-content": m.trust(hintContent), config: (filterObj['hideHint'] ? null : hintConfig)}, (filterObj.fieldTitle.length < 40 ? filterObj.fieldTitle : filterObj.fieldTitle.substring(0,40)+"..."))
                ])
            }
        });
    }

    function gridConfig(el){
        //fixed header
        el.addEventListener("scroll",function(){
            var translate = "translate(0,"+this.scrollTop+"px)";
            this.querySelector("thead").style.transform = translate;
        });

        //resize columns
        if(_needRemoveColumnsSize){
            sessionStorage.removeItem('grid-'+gridView);
            _needRemoveColumnsSize = false;
        }
        $('table', el).colResizable({
            disable: true
        });

        var resizeConfig = {
            liveDrag:true,
            fixed: true,
            resizeMode: 'overflow',
            gripInnerHtml:"<div class='grip'></div>",
            headerOnly: true,
            draggingClass:"dragging",
            postbackSafe:true
        };
        if(showSelectColumn){
            resizeConfig.disabledColumns = [0];
        }
        $('table', el).colResizable(resizeConfig);

        //for multiselect rows
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

    function checkForOverflow(el, isInitialized){
        var rootWidth = $(el).innerWidth();
        var actionBtnWidth = $('.m-grid__context-action-container', $(el)).outerWidth();
        var filterBtnWidth = $('.filter-tool__add-button', $(el)).outerWidth();
        var activeFiltersWidth = $('.filter-tool__active-filters-container', $(el)).outerWidth();
        var staticFiltersWidth = $('.filter-tool__static-filters-container', $(el)).outerWidth();
        var mainFilters = $('.filter-tool__main-filters-container', $(el));
        var allowWidthForMainFilter = rootWidth - (actionBtnWidth + filterBtnWidth + activeFiltersWidth + staticFiltersWidth + 50); //50 px for buttons margin
        mainFilters.width(allowWidthForMainFilter);
        var filterWidthSum = 0;
        var isOverflow = false;
        $('.btn-delete-filter', mainFilters).each(function(index){
            if(isOverflow){
                $(this).hide();
            }else{
                filterWidthSum += $(this).outerWidth();
                if(filterWidthSum > allowWidthForMainFilter - 120){
                    isOverflow = true;
                    $(this).hide();
                    $('.filter-tool__add-button_second', mainFilters).removeClass('hidden');
                    $('.filter-tool__add-button_second', mainFilters).text('Еще ('+(_currentFilters.length - index)+')');
                }
            }
        })
    }

    function drawGrid(){
        return m("div", {class: "m-grid", id: "gridModule_"+moduleId}, [
            m("div", {class: "m-grid-filters component-container clearfix", config: checkForOverflow},[
                m("div", {class: "dropdown m-grid__context-action-container"}, [
                    m("button", {class: "btn btn-system btn-system-primary dropdown-toggle", type: "button", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false"}, [
                        t('actionsBtn', 'GridModule'),
                        m("span", {class: "caret"})
                    ]),
                    m("ul", {class: "dropdown-menu"}, [
                        Object.keys(_contextActions).map(function(key, index) {
                            var action = _contextActions[key];
                            if(contextActionsList.indexOf(key) !== -1 && (action.showThreshold === 0 || _selectedRows.length > 0)){
                                return m("li",
                                    m("a", {onclick: action.action}, action.name)
                                );
                            }
                        }),
                        Object.keys(customContextActions).map(function(key, index) {
                            var action = customContextActions[key];
                            if(action.showThreshold === 0 || _selectedRows.length > 0){
                                var applyAction = function(){
                                    action.action.apply(this, [{selectedRows: _selectedRows}]);
                                };
                                return m("li",
                                    m("a", {onclick: applyAction}, action.name)
                                );
                            }
                        })
                    ])
                ]),
                //m("button", {class: "btn btn-system btn-system-primary filter-tool__add-button", onclick: showFilterModal}, t('addFilterBtn', 'GridModule')),
                showStaticFilters(),
                showActiveFilter(),
                showTopFilters()
            ]),
            m("div", {class: "grid-table-wrapper component-container"},[
                m("div", {class: "table-container", style: "width: 100%; height: 100%; overflow-y: auto;", config: gridConfig}, [
                    m("table", {id: 'grid-'+gridView, class: "table table-bordered table-striped table-hover table-responsive m-grid-table", style: "min-width: 100%;"}, [
                        m("thead",
                            m("tr", [
                                (showSelectColumn ?
                                    m("th", {class: 'grid-table__select-column'}, m("label",
                                        m("input", {type: "checkbox", checked: _mainCheckboxChecked, onchange: checkUncheckAll})
                                    )) : ''
                                ),
                                ColumnModel.getHeaderColumns().map(function(columnObj){
                                    var arrowContainerActiveClass = '';
                                    var isAsc = false;
                                    var isDesc = false;

                                    if(columnObj['COLUMN_NAME'] == _orderState.field){
                                        arrowContainerActiveClass = '_active';
                                        if(_orderState.state == 'ASC'){
                                            isAsc = true;
                                        }else{
                                            isDesc = true;
                                        }
                                    }

                                    if(columnObj['FIL_GROUP'] == 'ADD_COLUMN'){
                                        return m("th", {"data-column": columnObj['COLUMN_NAME']}, (typeof columnObj['COLUMN_TITLE'] != 'undefined' ? columnObj['COLUMN_TITLE'] : ''));
                                    }else{
                                        return m("th", {"data-column": columnObj['COLUMN_NAME']}, [
                                            m("div", {}, [
                                                m.trust(columnObj[Globals.getLangDb()]),
                                                m("span", {class: "cross-hide-column", "data-column": columnObj['COLUMN_NAME'], onclick: hideGridColumn}, m.trust('×')),
                                                m("div", {class: "grid-table__order-box"},
                                                    m("div", {class: "grid-table__order-box-inner"},
                                                        m("div", {class: "grid-table__order-arrows-container"+arrowContainerActiveClass}, [
                                                            m("div", {class: "order-arrow order-asc-arrow"+(isAsc ? "_active" : ""), "data-field": columnObj['COLUMN_NAME'], onclick: (isAsc ? false : sortAsc)}, ""),
                                                            m("div", {class: "order-arrow order-desc-arrow"+(isDesc ? "_active" : ""), "data-field": columnObj['COLUMN_NAME'], onclick: (isDesc ? false : sortDesc)}, "")
                                                        ])
                                                    )
                                                )
                                            ])
                                        ])
                                    }
                                })
                            ])
                        ),
                        m("tbody",{},[
                            _gridData.map(function(rowObject, index) {
                                var rowKey = rowObject[ColumnModel.getPrimaryKeyObject()['COLUMN_NAME']];
                                _keyIndexArray[index] = rowKey;
                                return m("tr", {"data-key": rowKey, draggable: allowDrag, ondragstart: startDrag, ondragend: endDrag, class: (_selectedRows.indexOf(rowKey) != -1 ?'selected-row' : '')}, [
                                    (showSelectColumn ? m("td", {class: 'grid-table__select-column'}, [
                                        m("label",
                                            m("input", {type: "checkbox", "data-index": index, "data-key": rowKey, checked: (_selectedRows.indexOf(rowKey) != -1 ? "checked" : ""), onchange: selectRow})
                                        )
                                    ]) : ""),
                                    ColumnModel.getHeaderColumns().map(function(columnObj){
                                        var fieldName = columnObj['COLUMN_NAME'];
                                        var fieldType = columnObj['FIL_TYPE'];
                                        var fieldValue = rowObject[fieldName];

                                        //custom fields
                                        if(columnObj['FIL_GROUP'] === 'ADD_COLUMN'){
                                            var addColumn = additionalColumns[columnObj['COLUMN_NAME']];
                                            return m("td", {class: "grid-table__column_"+addColumn.name, style: "text-align: center; min-width: "+columnObj.minWidth+"px;"},
                                                m("button", {class: "btn btn-link btn-grid-link", "data-key": rowKey, onclick: addColumn.button.onclick}, addColumn.button.name)
                                            );
                                        }else{
                                            //display boolean values as checkbox
                                            if(fieldType == 'CHK'){
                                                fieldValue = m("input", {type: "checkbox", checked: (fieldValue > 0 ? true : false), disabled: true});
                                            }

                                            //remove .00000000000003 from float values
                                            if((fieldType == 'INT' || fieldType == 'NUM') && fieldValue != null){
                                                try{
                                                    fieldValue = parseFloat(fieldValue.toPrecision(6));
                                                }catch(e){}
                                            }
                                            return m("td", {"data-key": rowKey, "data-index": index, onclick: rowClick, class: "grid-table__column_"+fieldName + (_rowMode === 'single' ? ' grid-single-row' : ' grid-multi-row')}, fieldValue);
                                        }
                                    })
                                ])
                            })
                        ])
                    ])
                ])
            ]),
            m("div", {class: "m-grid-tools component-container clearfix"},[
                m("select", {class: "form-control grid-tools__add_column", onchange: showGridColumn}, [
                    m("option", {value: "hint", disabled: "disabled", selected: true}, t('addColumnHint', 'GridModule')),
                    ColumnModel.getHiddenColumns().map(function(columnObj){
                        return m("option", {value: columnObj['COLUMN_NAME']}, columnObj[Globals.getLangDb()])
                    })
                ]),
                m("div", {class: "grid-tools__separator"}),
                m.component(_Spinner),
                m("div", {class: "grid-tools__separator"}),
                m("div", {class: "grid-tools__rows-counter"}, [
                    m("span", {class: "rows-counter__start"}, ((_currentPage - 1)*_perPage+1)),
                    ' - ',
                    m("span", {class: "rows-counter__end"}, ((_currentPage)*_perPage)),
                    ", "+t('totalRowsLabel', 'GridModule')+": ",
                    m("span", {class: "rows-counter__total"}, _gridDataCount),
                ]),
                m("div", {class: "grid-tools__separator"}),
                m("div", {class: "grid-tools__pagination"},
                    m.component(_Pagination)
                ),
                (allowNew ? [
                    m("div", {class: "grid-tools__separator"}),
                    m("div", {class: "grid-tools__add-btn-container"},
                        m("button", {type: "button", class: "btn btn-system btn-system-primary grid-tools__add-row-btn", onclick: createCard}, t('addRowBtn', 'GridModule'))
                    )
                ] : '')

            ]),
            m("div", {class: "m-grid__modals-container"}, [
                _Filter ? m.component(_Filter) : '',
                _Card ? m.component(_Card) : '',
                _ExportCsv ? m.component(_ExportCsv) : '',
                _GroupEdit ? _GroupEdit : ''
            ])
        ]);
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        if(gridView){
            getGridColumns();
        }else{
            console.log('Error! There is no required parameter "gridView".');
        }
    }

    function view(){
        switch(_state) {
            case 'default':
                return m("div", {class: "m-grid_hidden"});
            break;
            case 'loading':
                return m("div", {class: "m-grid_loading"}, [
                    new Modal({
                        id: 'girdLoading-' + moduleId,
                        state: 'show',
                        content: [
                            m("img", {
                                class: "grid-loading-modal__body--loader",
                                src: "dist/assets/images/loading.gif"
                            }),
                            m.trust(t('loadingModalBodyMsg', 'GridModule')),
                            m("p", {class: "grid-loading-modal__message"}, t('loadingModalBodyWarningMsg', 'GridModule'))
                        ],
                        isStatic: true,
                        header: t('loadingModalHeader', 'GridModule'),
                        isFooter: false,
                        isFullScreen: false,
                        modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                        zIndex: zIndex
                    })
                ]);
            break;
            case 'grid':
                if(isModal){
                    switch(mode){
                        case 'key-grid':
                            modalHeader = [
                                t('MultiPickerHeader', 'GridModule'),
                                m("strong", {}, '"'+cardFieldObject.title+'"')
                            ]
                            break;
                        case 'picker':
                            modalHeader = modalHeader ? modalHeader : [
                                t('GridPickerHeader', 'GridModule'),
                                m("strong", {}, '"'+cardFieldObject.title+'"')
                            ]
                            break;
                    }

                    return new Modal({
                        id: 'gridModal-'+moduleId,
                        state: 'show',
                        content: drawGrid(),
                        isStatic: false,
                        header: modalHeader,
                        isFooter: false,
                        isFullScreen: true,
                        zIndex: zIndex,
                        onCancel: function(){
                            onClose();
                            _state = 'default';
                        }
                    });
                }else{
                    return drawGrid();
                }
            break;
            case 'error':
                return m("div", {class: "m-grid"}, 'Error!')
            break;
        }
    }

    return{
        controller: controller,
        view: view,
        refresh: refresh,
        getTotalRows: function(){
            return _gridDataCount;
        },
        getSelectedRows: function(){
            return _selectedRows;
        },
        getSqlCondition: function(){
            return _whereClause + SqlHelper.buildWhere(_currentFilters) + SqlHelper.buildWhere(staticFilters);
        }
    }
};