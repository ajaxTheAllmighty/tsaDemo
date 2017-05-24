'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var FilterTypes = require('./filter-types.js')();
var AutocompleteComponent = require('../../../components/autocomplete/autocomplete.js');
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function (config) {
    var _state = 'default'; //loading, hidden
    var _dropdownFiltersArrayList = {};
    var _filterFieldsAssoc = {};

    var zIndex = config.zIndex || 1000;
    var activeFilter = config.activeFilter || false;
    var activeFilterValue = config.activeFilterValue || 'active';
    var filters = config.filters.slice() || [];
    var filterFields = config.filterFields || [];
    var onFiltersChange = config.onFiltersChange; //function(filters, activeFilterValue){};
    var onCancel = config.onCancel || false;

    function show(config){
        activeFilterValue = config.activeFilterValue || activeFilterValue;
        filters = config.filters.slice();
        _state = 'default';
    }

    //load data for dropdown type fields
    function dropDownFilterLoaded($data, filterFieldObj){
        try{
            var viewFilterObject = $data[0],
                whereClause = 'WHERE (1=1)';
            if(typeof viewFilterObject != 'undefined'){
                if (viewFilterObject['FIL_USE_HIERARCHY'] == 1)
                {
                    whereClause += " AND ((USE_CODE IN (" + Globals.getUserHierarchy() + ")) OR (USE_CODE IS NULL))";
                }
                if (viewFilterObject['FIL_LOC_HIERARCHY'] == 1)
                {
                    whereClause += " AND ((BDN_CODE = " + Globals.getUserData()['USE_BDN_CODE'] + ") OR (BDN_CODE IS NULL))";
                }
                if (viewFilterObject['FIL_USE_SINGLE_HIERARCHY'] == 1)
                {
                    whereClause += " AND ((USE_CODE = " + Globals.getUserData()['USE_CODE']+ ") OR (USE_CODE IS NULL))";
                }
                if (viewFilterObject['FIL_USE_COMPANY'] == 1)
                {
                    whereClause += " AND (CMP_CODE = " + Globals.getUserData()['CMP_CODE'] + ")";
                }
            }
            Helper.getDataEx(dropDownDataLoaded, filterFieldObj['name'], {"context": this, "module": "Filter module", "function": "dropDownFilterLoaded"}, filterFieldObj.dropDownNameField+' AS name,'+filterFieldObj.dropDownCodeField + ' AS code', filterFieldObj.dropDownView, whereClause);
        }catch(e){
            console.log('Ошибка загрузки данных фильтра для выпадающего списка');
            console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
        }
    }

    function dropDownDataLoaded($data, $filterFieldName){
        try{
            _dropdownFiltersArrayList[$filterFieldName] = $data;
        }catch(e){
            console.log('Ошибка загрузки данных фильтра для выпадающего списка');
            console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
        }
        m.redraw();
    }

    //////////////////////////////
    //      FILTER ACTIONS      //
    //////////////////////////////

    function activeFilterValueChanged(){
        activeFilterValue = this.value;
    }

    function andOrConditionChanged(){
        var filterIndex = this.getAttribute('data-index');
        var filterObj = filters[filterIndex];
        filterObj.andOrCondition = this.value;
    }

    function isGroupConditionChanged(){
        var filterIndex = this.getAttribute('data-index');
        var filterObj = filters[filterIndex];
        filterObj.andOrCondition = this.value;
    }

    function filterConditionChanged(){
        var filterIndex = this.getAttribute('data-index');
        var filterCondition = this.value;
        filters[filterIndex].condition = filterCondition;
    }

    function deleteFilter(){
        var filterIndex = this.getAttribute('data-index');
        filters.splice(filterIndex, 1);
    }

    function datePicker(el){
        $(el).datepicker({
            format: 'dd-mm-yyyy',
            language: Globals.getLangApp()
        });
    }

    function datePickerRange(el){
        $(el).each(function() {
            $(this).datepicker("clearDates", {format: 'dd-mm-yyyy', language: Globals.getLangApp()});
        });
    }

    function filterValueChanged(){
        var filterIndex = this.getAttribute('data-index');
        var filterObj = filters[filterIndex];
        switch(filterObj.type){
            case 'TEXT':
                filterObj.value = this.value;
                break;
            case 'INT':
                filterObj.value = this.value;
                break;
            case 'NUM':
                filterObj.value = this.value;
                break;
            case 'CHK':
                filterObj.value = (this.checked ? 1 : 0);
                break;
            case 'LIST':
                filterObj.value = this.options[this.selectedIndex].value;
                filterObj.valueText = this.options[this.selectedIndex].innerText;
                break;
            case 'GRD':
                filterObj.value = this.options[this.selectedIndex].value;
                filterObj.valueText = this.options[this.selectedIndex].innerText;
                break;
            case 'SNGL':
                filterObj.value = this.value;
                break;
            case 'DATE':
                if(this.name == 'start'){
                    var start = this.value;
                    var end = document.getElementById('date-filter-end-'+filterIndex).value;
                    filterObj.value = {start: start, end: end};
                }else{
                    var end = this.value;
                    var start = document.getElementById('date-filter-start-'+filterIndex).value;
                    filterObj.value = {start: start, end: end};
                }
                break;
            default:
                console.log('unknown type of filter!');
        }
    }

    function filterFieldChanged(){
        var filterIndex = this.getAttribute('data-index');
        var fieldName = this.options[this.selectedIndex].value;
        var fieldTitle = this.options[this.selectedIndex].innerText;
        var type = this.options[this.selectedIndex].getAttribute('data-type');
        filters[filterIndex] = {type: type, andOrCondition: 'AND', isGroupCondition: false, fieldTitle: fieldTitle, fieldName: fieldName, filterField: fieldName, condition: false, value: false};

        switch(type){
            case 'SNGL':
                var today = new Date();
                var dd = (today.getDate() < 10 ? '0'+today.getDate() : today.getDate());
                var mm = (today.getMonth()+1 < 10 ? '0'+ (today.getMonth()+1) : today.getMonth()+1); //January is 0!
                var yyyy = today.getFullYear();
                filters[filterIndex].value = dd+"-"+mm+"-"+yyyy;
                break;
            case 'DATE':
                var today = new Date();
                var dd = (today.getDate() < 10 ? '0'+today.getDate() : today.getDate());
                var mm = (today.getMonth()+1 < 10 ? '0'+ (today.getMonth()+1) : today.getMonth()+1); //January is 0!
                var yyyy = today.getFullYear();
                filters[filterIndex].value = {start: dd+"-"+mm+"-"+yyyy, end: dd+"-"+mm+"-"+yyyy};
                break;
            case 'LIST':
                filters[filterIndex].filterField = _filterFieldsAssoc[fieldName].dropDownCodeField;
                filters[filterIndex].ac = new AutocompleteComponent;
                break;
            case 'CHK':
                filters[filterIndex].value = 0;
                break;
            case 'GRD':
                filters[filterIndex].filterField = _filterFieldsAssoc[fieldName].dropDownCodeField;
                filters[filterIndex].ac = new AutocompleteComponent;
                break;
        }

        //load dropdown list if it absent
        if((type == "LIST" || type == "GRD")&& !_dropdownFiltersArrayList.hasOwnProperty(fieldName)){
            var filterFieldObj = _filterFieldsAssoc[fieldName];
            Helper.getDataEx(dropDownFilterLoaded, filterFieldObj, {"context": this, "module": "Filter module", "function": "filterFieldChanged"}, 'FIL_USE_HIERARCHY, FIL_LOC_HIERARCHY,FIL_USE_SINGLE_HIERARCHY, FIL_USE_COMPANY', 'ST_FILTER', "WHERE (FIL_IS_PRIMARY_KEY = 1) AND (FIL_VIEW_NAME = '" +filterFieldObj['dropDownView'] + "')");
        }
    }

    ///////////////////////////
    //      VIEW PARTS       //
    ///////////////////////////

    function drawActiveFilter(){
        return activeFilter ? m("div", {class: "b-active-filter"}, [
            m("label", {class: "active-filter__label"},[
                m("input", {type: "radio", name: "active-status", class: "active-filter__input", value: "active", checked: (activeFilterValue == 'active' ? 'checked' : false), onchange: activeFilterValueChanged }),
                m.trust(t('activeRows', 'FilterModule'))
            ]),
            m("label", {class: "active-filter__label"},[
                m("input", {type: "radio", name: "active-status", class: "active-filter__input", value: "inactive", checked: (activeFilterValue == 'inactive' ? 'checked' : false), onchange: activeFilterValueChanged }),
                m.trust(t('inactiveRows', 'FilterModule'))
            ]),
            m("label", {class: "active-filter__label"},[
                m("input", {type: "radio", name: "active-status", class: "active-filter__input", value: "all", checked: (activeFilterValue == 'all' ? 'checked' : false), onchange: activeFilterValueChanged }),
                m.trust(t('allRows', 'FilterModule'))
            ])
        ]) : "";
    }

    function showMainFilters(){
        return [
            filters.map(function (filter, index) {
                return drawFilterBlock(filter, index)
            }),
            drawDefaultFilter()
        ];
    }

    function drawFilterBlock(filterObj, fIndex){
        return m("div", {class: "b-item-filter"}, [
            m("div", {class: "item-filter__and-or-container form-group"}, [
                m("label", {class: "radio-inline"}, [
                    m("input", {type: "radio", value: "AND", checked: (filterObj.andOrCondition === "AND"), "data-index": fIndex, onchange: andOrConditionChanged}),
                    m.trust(t('groupConditionAnd', 'FilterModule'))
                ]),
                m("label", {class: "radio-inline"}, [
                    m("input", {type: "radio", value: "OR", checked: (filterObj.andOrCondition === "OR"), "data-index": fIndex, onchange: andOrConditionChanged}),
                    m.trust(t('groupConditionOr', 'FilterModule'))
                ]),
                m("label", {class: "checkbox-inline item-filter__group-checkbox"}, [
                    m("input", {type: "checkbox", "data-index": fIndex, onchange: isGroupConditionChanged}),
                    m.trust(t('groupWithPrev', 'FilterModule'))
                ])
            ]),
            m("div", {class: "item-filter__field-select-container form-group"},
                m("select", {class: "form-control filter-select", "data-index": fIndex, onchange: filterFieldChanged}, [
                    m("option", {disabled: true, selected: true, value: "hint"}, t('loadedChooseFilterLabel', 'FilterModule')),
                    filterFields.map(function (field) {
                        return m("option", {"data-type": field.type, value: field.name, selected: (field.name === filterObj.fieldName)}, field.title)
                    })
                ])
            ),
            drawFilterByType(filterObj, fIndex),
            m("div", {class: "item-filter__delete-container form-group"},
                m("a", {class: "filter-delete-button", "data-index": fIndex, onclick: deleteFilter}, m.trust('×'))
            )
        ])
    }

    function drawDefaultFilter(){
        return m("div", {class: "b-item-filter"}, [
            m("div", {class: "item-filter__field-select-container form-group"},
                m("select", {class: "form-control filter-select", "data-index": filters.length, onchange: filterFieldChanged}, [
                    m("option", {disabled: true, selected: true, value: "hint"}, t('defaultFilterHint', 'FilterModule')),
                    Helper.objectToArray(filterFields).map(function (field) {
                        return m("option", {"data-type": field.type, value: field.name}, field.title)
                    })
                ])
            )
        ])
    }

    function drawFilterByType(filterObj, fIndex){
        switch (filterObj['type']) {
            case 'INT':
                return drawFilterInt(filterObj, fIndex, 'INT');
                break;
            case 'NUM':
                return drawFilterInt(filterObj, fIndex, 'NUM');
                break;
            case 'CHK':
                return drawFilterCheck(filterObj, fIndex, 'CHK');
                break;
            case 'TEXT':
                return drawFilterText(filterObj, fIndex, 'TEXT');
                break;
            case 'LIST':
                return drawFilterList(filterObj, fIndex, 'LIST');
                break;
            case 'GRD':
                return drawFilterGrid(filterObj, fIndex, 'GRD');
                break;
            case 'SNGL':
                return drawFilterSingleDate(filterObj, fIndex, 'SNGL');
                break;
            case 'DATE':
                return drawFilterDate(filterObj, fIndex, 'DATE');
                break;
            default:
                console.log('unknown type of filter!');
                console.log(filterObj);
                break;
        }
    }

    ///////////////////////////
    //      FILTER TYPES     //
    ///////////////////////////

    function drawFilterInt(filterObj,fIndex, type){
        var conditions = FilterTypes.getFilterCondition(type);
        return [
            m("div", {class: "item-filter__condition-container form-group"},
                m("select", {class: "form-control", "data-index": fIndex, onchange: filterConditionChanged}, [
                    conditions.map(function (condition, index) {
                        var isSelected = false;
                        if(filterObj.condition == false){
                            //set filter in array condition first element value
                            if(index == 0){
                                filters[fIndex].condition = condition.name;
                                isSelected = true;
                            }
                        }
                        if(filterObj.condition == condition.name){
                            isSelected = true;
                        }
                        return m("option", {value: condition.name, selected: isSelected}, condition.text)
                    })
                ])
            ),
            m("div", {class: "item-filter__value-container form-group"},
                m("input", {type: "text", class: "form-control filter-value__text", value: (filterObj.value ? filterObj.value : ''), placeholder: "Введите значение", "data-index": fIndex, onchange: filterValueChanged})
            )
        ];
    }

    function drawFilterCheck(filterObj,fIndex, type){
        var conditions = FilterTypes.getFilterCondition(type);
        return [
            m("div", {class: "item-filter__condition-container form-group"},
                m("select", {class: "form-control", "data-index": fIndex, onchange: filterConditionChanged}, [
                    conditions.map(function (condition, index) {
                        var isSelected = false;
                        if(filterObj.condition == false){
                            //set filter in array condition first element value
                            if(index == 0){
                                filters[fIndex].condition = condition.name;
                                isSelected = true;
                            }
                        }
                        if(filterObj.condition == condition.name){
                            isSelected = true;
                        }
                        return m("option", {value: condition.name, selected: isSelected}, condition.text)
                    })
                ])
            ),
            m("div", {class: "item-filter__value-container form-group"},
                m("input", {type: "checkbox", class: "form-control filter-value__checkbox", value: (filterObj.value ? filterObj.value : ''), checked: !!filterObj.value, "data-index": fIndex, onchange: filterValueChanged})
            )
        ];
    }

    function drawFilterText(filterObj,fIndex, type){
        var conditions = FilterTypes.getFilterCondition(type);
        return [
            m("div", {class: "item-filter__condition-container form-group"},
                m("select", {class: "form-control", "data-index": fIndex, onchange: filterConditionChanged}, [
                    conditions.map(function (condition, index) {
                        var isSelected = false;
                        if(filterObj.condition == false){
                            //set filter in array condition first element value
                            if(index == 0){
                                filters[fIndex].condition = condition.name;
                                isSelected = true;
                            }
                        }
                        if(filterObj.condition == condition.name){
                            isSelected = true;
                        }
                        return m("option", {value: condition.name, selected: isSelected}, condition.text)
                    })
                ])
            ),
            m("div", {class: "item-filter__value-container form-group"},
                m("input", {type: "text", class: "form-control filter-value__text", value: (filterObj.value ? filterObj.value : ''), placeholder: t('textFilterPlaceholder', 'FilterModule'), "data-index": fIndex, onchange: filterValueChanged})
            )
        ];
    }

    function drawFilterList(filterObj,fIndex, type){
        var conditions = FilterTypes.getFilterCondition(type);
        return [
            m("div", {class: "item-filter__condition-container form-group"},
                m("select", {class: "form-control", "data-index": fIndex, onchange: filterConditionChanged}, [
                    conditions.map(function (condition, index) {
                        var isSelected = false;
                        if(filterObj.condition == false){
                            //set filter in array condition first element value
                            if(index == 0){
                                filters[fIndex].condition = condition.name;
                                isSelected = true;
                            }
                        }
                        if(filterObj.condition == condition.name){
                            isSelected = true;
                        }
                        return m("option", {value: condition.name, selected: isSelected}, condition.text)
                    })
                ])
            ),
            m("div", {class: "item-filter__value-container form-group"},
                _dropdownFiltersArrayList.hasOwnProperty(filterObj.fieldName)?
                    m.component(filterObj.ac, {
                        data: _dropdownFiltersArrayList[filterObj.fieldName],
                        maxToShow: 100,
                        code: filterObj.value,
                        name: filterObj.valueText,
                        valueField: "code",
                        titleField: "name",
                        onSelect: function(title, value){
                            filterObj.value = value;
                            filterObj.valueText = title;
                        }
                    })
                :  m("div", {class: "filter-loading"}, [
                    "Загрузка данных для фильтра",
                    m("img", {src: "dist/assets/images/loading.gif"})
                ])
            )
        ];
    }

    function drawFilterGrid(filterObj,fIndex, type){
        var conditions = FilterTypes.getFilterCondition(type);
        return [
            m("div", {class: "item-filter__condition-container form-group"},
                m("select", {class: "form-control", "data-index": fIndex, onchange: filterConditionChanged}, [
                    conditions.map(function (condition, index) {
                        var isSelected = false;
                        if(filterObj.condition == false){
                            //set filter in array condition first element value
                            if(index == 0){
                                filters[fIndex].condition = condition.name;
                                isSelected = true;
                            }
                        }
                        if(filterObj.condition == condition.name){
                            isSelected = true;
                        }
                        return m("option", {value: condition.name, selected: isSelected}, condition.text)
                    })
                ])
            ),
            m("div", {class: "item-filter__value-container form-group"},
                _dropdownFiltersArrayList.hasOwnProperty(filterObj.fieldName)?
                    m.component(filterObj.ac, {
                        data: _dropdownFiltersArrayList[filterObj.fieldName],
                        maxToShow: 100,
                        code: filterObj.value,
                        name: filterObj.valueText,
                        valueField: "code",
                        titleField: "name",
                        onSelect: function(title, value){
                            filterObj.value = value;
                            filterObj.valueText = title;
                        }
                    })
                : m("div", {class: "filter-loading"}, [
                    "Загрузка данных для фильтра",
                    m("img", {src: "dist/assets/images/loading.gif"})
                ])
            )
        ];
    }

    function drawFilterSingleDate(filterObj,fIndex, type){
        var conditions = FilterTypes.getFilterCondition(type);
        return [
            m("div", {class: "item-filter__condition-container form-group"},
                m("select", {class: "form-control", "data-index": fIndex, onchange: filterConditionChanged}, [
                    conditions.map(function (condition, index) {
                        var isSelected = false;
                        //set filter in array condition first element value
                        if(filterObj.condition === false && index === 0){
                            filters[fIndex].condition = condition.name;
                            isSelected = true;
                        }
                        if(filterObj.condition == condition.name){
                            isSelected = true;
                        }
                        return m("option", {value: condition.name, selected: isSelected}, condition.text)
                    })
                ])
            ),
            m("div", {class: "item-filter__value-container form-group"},
                m("input", {type: "text", class: "form-control filter-value__text", value: (filterObj.value ? filterObj.value : ''), config: datePicker, placeholder: t('dateFilterPlaceholder', 'FilterModule'), "data-index": fIndex, onchange: filterValueChanged})
            )
        ];
    }

    function drawFilterDate(filterObj,fIndex, type){
        var conditions = FilterTypes.getFilterCondition(type);
        return [
            m("div", {class: "item-filter__condition-container form-group"},
                m("select", {class: "form-control", "data-index": fIndex, onchange: filterConditionChanged}, [
                    conditions.map(function (condition, index) {
                        var isSelected = false;
                        //set filter in array condition first element value
                        if(filterObj.condition === false && index === 0){
                            filters[fIndex].condition = condition.name;
                            isSelected = true;
                        }
                        if(filterObj.condition == condition.name){
                            isSelected = true;
                        }
                        return m("option", {value: condition.name, selected: isSelected}, condition.text)
                    })
                ])
            ),
            m("div", {class: "item-filter__value-container input-group input-daterange", config: datePickerRange},
                m("input", {type: "text", class: "form-control", id: "date-filter-start-"+fIndex, value: filterObj.value['start'], name: "start", "data-index": fIndex, onchange: filterValueChanged}),
                m("span", {class: "input-group-addon"}, t('dateByLabel', 'FilterModule')),
                m("input", {type: "text", class: "form-control", id: "date-filter-end-"+fIndex, value: filterObj.value['end'], name: "end", "data-index": fIndex, onchange: filterValueChanged})
            )
        ];
    }

    //////////////////////////////
    //      MODULE ACTIONS      //
    //////////////////////////////

    function applyFilters(){
        onFiltersChange(filters, activeFilterValue);
        _state = 'hidden';
    }

    function show(config){
        filters = config.filters.slice() || filters;
        _state = 'default';
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        //create assoc filter fields array
        filterFields.map(function(filterObj){
            _filterFieldsAssoc[filterObj.name] = filterObj;
        });
    }

    function view() {
        switch(_state){
            case 'hidden':
                return m("div",{class: "filter-hidden-state"}, "");
            break;
            case 'default':
                return new Modal({
                    state: 'show',
                    header: t('loadedModalHeader', 'FilterModule'),
                    content: [
                        m("div", {style: "width: 100%; height: 100%; padding: 15px;"}, [
                            drawActiveFilter(),
                            m("div", {class: "filter-block-container clearfix"},
                                showMainFilters()
                            )
                        ])
                    ],
                    isStatic: false,
                    isFooter: true,
                    isFullScreen: false,
                    modalSizeParams: {width: '60%', height: false, padding: '5% 0 5% 0'},
                    zIndex: zIndex,
                    confirmBtn: t('addFilterBtn', 'FilterModule'),
                    onConfirm: applyFilters,
                    onCancel: function(){
                        onCancel();
                        _state = 'hidden';
                    }
                });
            break;
        }
    }

    return{
        show: show,
        controller: controller,
        view: view
    }
};