'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var AutocompleteComponent = require('../../../components/autocomplete/autocomplete.js');
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function (config) {
    var _state = 'show';
    var _dropdownFiltersArrayList = {};
    var _filterCount = 1;

    var id = config.id || 1;
    var zIndex = config.zIndex || 1000;
    var activeFilter = config.activeFilter || false;
    var activeFilterValue = config.activeFilterValue || 'active';
    var filters = Helper.cloneObject(config.filters) || [];
    var filterFields = config.filterFields || [];
    var onFiltersChange = config.onFiltersChange || function(filters, activeFilterValue){console.log(filters, activeFilterValue);};
    var onCancel = config.onCancel || false;


    function show(config){
        activeFilter = config.activeFilter || activeFilter;
        activeFilterValue = config.activeFilterValue || activeFilterValue;
        filters = Helper.cloneObject(config.filters) || filters;
        _state = 'show';
    }

    function drawActiveFilter(){
        return activeFilter ? m("div", {class: "b-active-filter"}, [
            m("label", {class: "active-filter__label"},[
                m("input", {type: "radio", name: "active-status", class: "active-filter__input", value: "active", checked: (activeFilterValue == 'active' ? 'checked' : false), onchange: function () {activeFilterValue = this.value;} }),
                m.trust(t('activeRows', 'FilterModule'))
            ]),
            m("label", {class: "active-filter__label"},[
                m("input", {type: "radio", name: "active-status", class: "active-filter__input", value: "inactive", checked: (activeFilterValue == 'inactive' ? 'checked' : false), onchange: function () {activeFilterValue = this.value;} }),
                m.trust(t('inactiveRows', 'FilterModule'))
            ]),
            m("label", {class: "active-filter__label"},[
                m("input", {type: "radio", name: "active-status", class: "active-filter__input", value: "all", checked: (activeFilterValue == 'all' ? 'checked' : false), onchange: function () {activeFilterValue = this.value;} }),
                m.trust(t('allRows', 'FilterModule'))
            ])
        ]) : "";
    }

    function dropDownFilterLoaded($data, $filterFieldObj){
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
            Helper.getDataEx(dropDownDataLoaded, $filterFieldObj['name'], {"context": this, "module": "Filter module", "function": "dropDownFilterLoaded"}, $filterFieldObj.dropDownNameField+' AS name,'+$filterFieldObj.dropDownCodeField + ' AS code', $filterFieldObj.dropDownView, whereClause);
        }catch(e){
            console.log('Ошибка загрузки данных фильтра для выпадающего списка');
            console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
        }
    }

    function dropDownDataLoaded($data, $filterFieldName){
        try{
            _dropdownFiltersArrayList[$filterFieldName] = $data;
            m.endComputation();
        }catch(e){
            console.log('Ошибка загрузки данных фильтра для выпадающего списка');
            console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
        }
    }

    function filterFieldChanged(){
        var filterId = this.getAttribute('data-filterid');
        var fieldName = this.options[this.selectedIndex].value;
        var fieldTitle = this.options[this.selectedIndex].innerText;
        var type = this.options[this.selectedIndex].getAttribute('data-type');
        if(!filters.hasOwnProperty(filterId)){
            _filterCount++;
        }
        filters[filterId] = {id: filterId, type: type, andOrCondition: 'AND', isGroupCondition: false, fieldTitle: fieldTitle, fieldName: fieldName, filterField: fieldName, condition: false, value: false};

        switch(type){
            case 'SNGL':
                var today = new Date();
                var dd = (today.getDate() < 10 ? '0'+today.getDate() : today.getDate());
                var mm = (today.getMonth()+1 < 10 ? '0'+ (today.getMonth()+1) : today.getMonth()+1); //January is 0!
                var yyyy = today.getFullYear();
                filters[filterId].value = dd+"-"+mm+"-"+yyyy;
                break;
            case 'DATE':
                var today = new Date();
                var dd = (today.getDate() < 10 ? '0'+today.getDate() : today.getDate());
                var mm = (today.getMonth()+1 < 10 ? '0'+ (today.getMonth()+1) : today.getMonth()+1); //January is 0!
                var yyyy = today.getFullYear();
                filters[filterId].value = {start: dd+"-"+mm+"-"+yyyy, end: dd+"-"+mm+"-"+yyyy};
                break;
            case 'LIST':
                filters[filterId].filterField = filterFields[fieldName].dropDownCodeField;
                filters[filterId].ac = new AutocompleteComponent;
                break;
            case 'CHK':
                filters[filterId].value = 0;
                break;
            case 'GRD':
                filters[filterId].filterField = filterFields[fieldName].dropDownCodeField;
                filters[filterId].ac = new AutocompleteComponent;
                break;
        }

        //load dropdown list if it absent
        if((type == "LIST" || type == "GRD")&& !_dropdownFiltersArrayList.hasOwnProperty(fieldName)){
            var filterFieldObj = filterFields[fieldName];
            m.startComputation();
            Helper.getDataEx(dropDownFilterLoaded, filterFieldObj, {"context": this, "module": "Filter module", "function": "filterFieldChanged"}, 'FIL_USE_HIERARCHY, FIL_LOC_HIERARCHY,FIL_USE_SINGLE_HIERARCHY, FIL_USE_COMPANY', 'ST_FILTER', "WHERE (FIL_IS_PRIMARY_KEY = 1) AND (FIL_VIEW_NAME = '" +filterFieldObj['dropDownView'] + "')");
        }
    }

    function filterConditionChanged(){
        var filterId = this.getAttribute('data-filterid');
        var filterCondition = this.options[this.selectedIndex].value;
        filters[filterId].condition = filterCondition;
    }

    function filterValueChanged(){
        var filterId = this.getAttribute('data-filterid');
        var filterObj = filters[filterId];
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
                    var end = document.getElementById('date-filter-end-'+filterId).value;
                    filterObj.value = {start: start, end: end};
                }else{
                    var end = this.value;
                    var start = document.getElementById('date-filter-start-'+filterId).value;
                    filterObj.value = {start: start, end: end};
                }
                break;
            default:
                console.log('unknown type of filter!');
        }
    }

    function isGroupConditionChanged(){
        var filterId = this.getAttribute('data-filterid');
        var filterObj = filters[filterId];
        filterObj.andOrCondition = this.value;
    }

    function isGroupConditionChanged(){
        var filterId = this.getAttribute('data-filterid');
        var filterObj = filters[filterId];
        filterObj.isGroupCondition = this.checked;
    }

    function drawDefaultFilter(){
        return m("div", {class: "b-item-filter"}, [
            m("div", {class: "item-filter__field-select-container form-group"},
                m("select", {class: "form-control filter-select", "data-filterid": _filterCount, onchange: filterFieldChanged}, [
                    m("option", {disabled: true, selected: true, value: "hint"}, t('defaultFilterHint', 'FilterModule')),
                    Helper.objectToArray(filterFields).map(function (field, index) {
                        return m("option", {"data-type": field.type, value: field.name}, field.title)
                    })
                ])
            )
        ])
    }

    function drawFilterByType(filterObj){
        switch (filterObj['type']) {
            case 'INT':
                var conditions = [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'more', 'text':t('conditionMore', 'FilterModule')},
                    {'name':'less', 'text':t('conditionLess', 'FilterModule')},
                    {'name':'moreOrEqual', 'text':t('conditionMoreOrEqual', 'FilterModule')},
                    {'name':'lessOrEqual', 'text':t('conditionLessOrEqual', 'FilterModule')},
                    {'name':'list', 'text':t('conditionList', 'FilterModule')}
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        filters[filterObj.id].condition = condition.name;
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
                        m("input", {type: "text", class: "form-control filter-value__text", value: (filterObj.value ? filterObj.value : ''), placeholder: "Введите значение", "data-filterid": filterObj.id, onchange: filterValueChanged})
                    )
                ];
                break;
            case 'NUM':
                var conditions = [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'more', 'text':t('conditionMore', 'FilterModule')},
                    {'name':'less', 'text':t('conditionLess', 'FilterModule')},
                    {'name':'moreOrEqual', 'text':t('conditionMoreOrEqual', 'FilterModule')},
                    {'name':'lessOrEqual', 'text':t('conditionLessOrEqual', 'FilterModule')},
                    {'name':'list', 'text':t('conditionList', 'FilterModule')}
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        filters[filterObj.id].condition = condition.name;
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
                        m("input", {type: "text", class: "form-control filter-value__text", value: (filterObj.value ? filterObj.value : ''), placeholder: "Введите значение", "data-filterid": filterObj.id, onchange: filterValueChanged})
                    )
                ];
                break;
            case 'CHK':
                var conditions = [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        filters[filterObj.id].condition = condition.name;
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
                        m("input", {type: "checkbox", class: "form-control filter-value__checkbox", value: (filterObj.value ? filterObj.value : ''), checked: !!filterObj.value, "data-filterid": filterObj.id, onchange: filterValueChanged})
                    )
                ];
                break;
            case 'TEXT':
                var conditions = [
                    {'name':'like', 'text':t('conditionLike', 'FilterModule')},
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'likeStart', 'text':t('conditionLikeStart', 'FilterModule')},
                    {'name':'null', 'text':t('conditionNull', 'FilterModule')},
                    {'name':'notNull', 'text':t('conditionNotNull', 'FilterModule')},
                    {'name':'list', 'text':t('conditionList', 'FilterModule')},
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        filters[filterObj.id].condition = condition.name;
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
                        m("input", {type: "text", class: "form-control filter-value__text", value: (filterObj.value ? filterObj.value : ''), placeholder: t('textFilterPlaceholder', 'FilterModule'), "data-filterid": filterObj.id, onchange: filterValueChanged})
                    )
                ];
                break;
            case 'LIST':
                var conditions = [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'notEqual', 'text':t('conditionNotEqual', 'FilterModule')},
                    {'name':'null', 'text':t('conditionNull', 'FilterModule')},
                    {'name':'notNull', 'text':t('conditionNotNull', 'FilterModule')},
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        filters[filterObj.id].condition = condition.name;
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
                            : m("div", {class: "filter-loading"}, "Загрузка данных для фильтра")
                    )
                ];
                break;
            case 'GRD':
                var conditions = [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'notEqual', 'text':t('conditionNotEqual', 'FilterModule')},
                    {'name':'null', 'text':t('conditionNull', 'FilterModule')},
                    {'name':'notNull', 'text':t('conditionNotNull', 'FilterModule')},
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        filters[filterObj.id].condition = condition.name;
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
                break;
            case 'SNGL':
                var conditions = [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'more', 'text':t('conditionMore', 'FilterModule')},
                    {'name':'less', 'text':t('conditionLess', 'FilterModule')},
                    {'name':'moreOrEqual', 'text':t('conditionMoreOrEqual', 'FilterModule')},
                    {'name':'lessOrEqual', 'text':t('conditionLessOrEqual', 'FilterModule')}
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                //set filter in array condition first element value
                                if(filterObj.condition === false && index === 0){
                                    filters[filterObj.id].condition = condition.name;
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
                        m("input", {type: "text", class: "form-control filter-value__text", value: (filterObj.value ? filterObj.value : ''), config: datePicker, placeholder: t('dateFilterPlaceholder', 'FilterModule'), "data-filterid": filterObj.id, onchange: filterValueChanged})
                    )
                ];
                break;
            case 'DATE':
                var conditions = [
                    {'name':'between', 'text':t('conditionBetween', 'FilterModule')}
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                //set filter in array condition first element value
                                if(filterObj.condition === false && index === 0){
                                    filters[filterObj.id].condition = condition.name;
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
                        m("input", {type: "text", class: "form-control", id: "date-filter-start-"+filterObj.id, value: filterObj.value['start'], name: "start", "data-filterid": filterObj.id, onchange: filterValueChanged}),
                        m("span", {class: "input-group-addon"}, t('dateByLabel', 'FilterModule')),
                        m("input", {type: "text", class: "form-control", id: "date-filter-end-"+filterObj.id, value: filterObj.value['end'], name: "end", "data-filterid": filterObj.id, onchange: filterValueChanged})
                    )
                ];
                break;
            default:
                console.log('unknown type of filter!');
                console.log(filterObj);
            break;
        }
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

    function deleteFilter(){
        var filterId = this.getAttribute('data-filterid');
        delete filters[filterId];
    }

    function drawFilterBlock(filterObj){
        return m("div", {class: "b-item-filter"}, [
            m("div", {class: "item-filter__and-or-container form-group"}, [
                m("label", {class: "radio-inline"}, [
                    m("input", {type: "radio", value: "AND", name: 'filter-'+filterObj.id, checked: (filterObj.andOrCondition === "AND"), "data-filterid": filterObj.id, onchange: andOrConditionChanged}),
                    m.trust(t('groupConditionAnd', 'FilterModule'))
                ]),
                m("label", {class: "radio-inline"}, [
                    m("input", {type: "radio", value: "OR", name: 'filter-'+filterObj.id, checked: (filterObj.andOrCondition === "OR"), "data-filterid": filterObj.id, onchange: andOrConditionChanged}),
                    m.trust(t('groupConditionOr', 'FilterModule'))
                ]),
                m("label", {class: "checkbox-inline item-filter__group-checkbox"}, [
                    m("input", {type: "checkbox", "data-filterid": filterObj.id, onchange: isGroupConditionChanged}),
                    m.trust(t('groupWithPrev', 'FilterModule'))
                ])
            ]),
            m("div", {class: "item-filter__field-select-container form-group"},
                m("select", {class: "form-control filter-select", "data-filterid": filterObj.id, onchange: filterFieldChanged}, [
                    m("option", {disabled: true, selected: true, value: "hint"}, t('loadedChooseFilterLabel', 'FilterModule')),
                    Helper.objectToArray(filterFields).map(function (field, index) {
                        return m("option", {"data-type": field.type, value: field.name, selected: (field.name === filterObj.fieldName)}, field.title)
                    })
                ])
            ),
            drawFilterByType(filterObj),
            m("div", {class: "item-filter__delete-container form-group"},
                m("a", {class: "filter-delete-button", "data-filterid": filterObj.id, onclick: deleteFilter}, m.trust('×'))
            )
        ])
    }

    function showMainFilters(){
        return [
            Helper.objectToArray(filters).map(function (filter) {
                return drawFilterBlock(filter)
            }),
            drawDefaultFilter()
        ];
    }

    function applyFilters(){
        onFiltersChange(filters, activeFilterValue);
        _state = 'hidden';
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        _filterCount = Object.keys(filters).length > 0 ? Object.keys(filters).length + 1 : 1;
    }

    function view() {
        switch(_state){
            case 'hidden':
                return m("div",{class: "filter-hidden-state"}, "");
            break;
            case 'show':
                return new Modal({
                    id: 'filter-'+id,
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