'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function () {
    var o = {
        state: 'default'
    };
    var reportUrl = '';
    var reportState = 'default';
    var filtersDropdownArrays = {};
    function init($options){
        o = $.extend({
            filterCount: 1,
            view: '',
            type: '',
            state: 'default',
            activeFilter: false,
            activeFilterValue: 'active',
            filters: [],
            filterFields: [],
            staticFilters: [],
            reportName: '',
            onFiltersChange: function(filters) {}
        }, $options || {});
        getColumns();
    }

    function getColumns(){
        m.startComputation();
        Helper.getData(columnsLoaded, {"context": this, "module": "Report-filter module", "function": "getColumns"},
            '*',
            'VIEW_ISC_TABLE_FILTER',
            "WHERE TABLE_NAME = '" + o.view + "' AND FIL_SHOW_IN_FILTER = 1",
            //"WHERE (TABLE_NAME = '" + o.view + "' AND TRF_USR_CODE = " + Globals.getUserData()['USR_CODE']  + " AND TRF_FIELD_ACCESS > 0) OR (TABLE_NAME = '" + o.view + "' AND TRF_USR_CODE = " + Globals.getUserData()['USR_CODE']  + ")",
            "FIL_SHOW_ORDER");
    }

    function columnsLoaded($data){
        for (var i = 0; i < $data.length; i++){
            var fieldObject = $data[i];
            if(fieldObject['FIL_SHOW_IN_FILTER'] == 1){
                o.filterFields[fieldObject['COLUMN_NAME']] = {
                    name: fieldObject['COLUMN_NAME'],
                    title: fieldObject[Globals.getLangDb()],
                    type: fieldObject['FIL_GROUP'],
                    dropDownView: fieldObject['FIL_TABLE_NAME'],
                    dropDownCodeField: fieldObject['FIL_CODE_FIELD'],
                    dropDownNameField: fieldObject['FIL_NAME_FIELD']
                };
            }
        }
        o.state = 'loaded';
        m.endComputation();
    }

    function drawActiveFilter(){
        return o.activeFilter ? m("div", {class: "b-active-filter"}, [
            m("label", {class: "active-filter__label"},[
                m("input", {type: "radio", name: "active-status", class: "active-filter__input", value: "active", checked: "checked", onchange: function () {o.activeFilterValue = this.value;} }),
                m.trust(t('activeRows', 'ReportFilterModule'))
            ]),
            m("label", {class: "active-filter__label"},[
                m("input", {type: "radio", name: "active-status", class: "active-filter__input", value: "inactive", onchange: function () {o.activeFilterValue = this.value;} }),
                m.trust(t('inactiveRows', 'ReportFilterModule'))
            ]),
            m("label", {class: "active-filter__label"},[
                m("input", {type: "radio", name: "active-status", class: "active-filter__input", value: "all", onchange: function () {o.activeFilterValue = this.value;} }),
                m.trust(t('allRows', 'ReportFilterModule'))
            ])
        ]) : "";
    }

    function dropDownFilterLoaded($data, $filterFieldObj){
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
        Helper.getDataEx(dropDownDataLoaded, $filterFieldObj['name'], {"context": this, "module": "Report-filter module", "function": "dropDownFilterLoaded"}, $filterFieldObj.dropDownNameField+' AS name,'+$filterFieldObj.dropDownCodeField + ' AS code', $filterFieldObj.dropDownView, whereClause);
    }

    function dropDownDataLoaded($data, $filterFieldName){
        filtersDropdownArrays[$filterFieldName] = $data;
        m.endComputation();
    }

    function filterFieldChanged(){
        var filterId = this.getAttribute('data-filterid');
        var fieldName = this.options[this.selectedIndex].value;
        var fieldTitle = this.options[this.selectedIndex].innerText;
        var type = this.options[this.selectedIndex].getAttribute('data-type');

        if(!o.filters.hasOwnProperty(filterId)){
            o.filterCount++;
        }
        o.filters[filterId] = {id: filterId, type: type, andOrCondition: 'AND', isGroupCondition: false, fieldTitle: fieldTitle, fieldName: fieldName, filterField: fieldName, condition: false, value: false};

        switch(type){
            case 'SNGL':
                var today = new Date();
                var dd = (today.getDate() < 10 ? '0'+today.getDate() : today.getDate());
                var mm = (today.getMonth()+1 < 10 ? '0'+ (today.getMonth()+1) : today.getMonth()+1); //January is 0!
                var yyyy = today.getFullYear();
                o.filters[filterId].value = dd+"-"+mm+"-"+yyyy;
                break;
            case 'DATE':
                var today = new Date();
                var dd = (today.getDate() < 10 ? '0'+today.getDate() : today.getDate());
                var mm = (today.getMonth()+1 < 10 ? '0'+ (today.getMonth()+1) : today.getMonth()+1); //January is 0!
                var yyyy = today.getFullYear();
                o.filters[filterId].value = {start: dd+"-"+mm+"-"+yyyy, end: dd+"-"+mm+"-"+yyyy};
                break;
            case 'LIST':
                o.filters[filterId].filterField = o.filterFields[fieldName].dropDownCodeField;
                break;
            case 'CHK':
                o.filters[filterId].value = 0;
                break;
            case 'GRD':
                o.filters[filterId].filterField = o.filterFields[fieldName].dropDownCodeField;
                break;
        }

        //load dropdown list if it absent
        if((type == "LIST" || type == "GRD")&& !filtersDropdownArrays.hasOwnProperty(fieldName)){
            var filterFieldObj = o.filterFields[fieldName];
            m.startComputation();
            Helper.getDataEx(dropDownFilterLoaded, filterFieldObj, {"context": this, "module": "Report-filter module", "function": "filterFieldChanged"}, 'FIL_USE_HIERARCHY, FIL_LOC_HIERARCHY,FIL_USE_SINGLE_HIERARCHY, FIL_USE_COMPANY', 'ST_FILTER', "WHERE (FIL_IS_PRIMARY_KEY = 1) AND (FIL_VIEW_NAME = '" +filterFieldObj['dropDownView'] + "')");
        }
    }

    function filterConditionChanged(){
        var filterId = this.getAttribute('data-filterid');
        var filterCondition = this.options[this.selectedIndex].value;
        o.filters[filterId].condition = filterCondition;
    }

    function filterValueChanged(){
        var filterId = this.getAttribute('data-filterid');
        var filterObj = o.filters[filterId];
        switch(filterObj.type){
            case 'TEXT':
                filterObj.value = this.value;
                break;
            case 'INT':
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

    function andOrConditionChanged(){
        var filterId = this.getAttribute('data-filterid');
        var filterObj = o.filters[filterId];
        filterObj.andOrCondition = this.value;
    }

    function isGroupConditionChanged(){
        var filterId = this.getAttribute('data-filterid');
        var filterObj = o.filters[filterId];
        filterObj.isGroupCondition = this.checked;
    }

    function drawDefaultFilter(){
        var currentFilterId = o.filterCount;
        return m("div", {class: "b-item-filter"}, [
            m("div", {class: "item-filter__field-select-container form-group"},
                m("select", {class: "form-control filter-select", "data-filterid": currentFilterId, onchange: filterFieldChanged}, [
                    m("option", {disabled: true, selected: true, value: "hint"}, t('loadedChooseFilterLabel', 'ReportFilterModule')),
                    Helper.objectToArray(o.filterFields).map(function (field, index) {
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
                    {'name':'equal', 'text':t('conditionEqual', 'ReportFilterModule')},
                    {'name':'more', 'text':t('conditionMore', 'ReportFilterModule')},
                    {'name':'less', 'text':t('conditionLess', 'ReportFilterModule')},
                    {'name':'moreOrEqual', 'text':t('conditionMoreOrEqual', 'ReportFilterModule')},
                    {'name':'lessOrEqual', 'text':t('conditionLessOrEqual', 'ReportFilterModule')}
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        o.filters[filterObj.id].condition = condition.name;
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
                        m("input", {type: "text", class: "form-control filter-value__text", value: (filterObj.value ? filterObj.value : ''), placeholder: t('textFilterPlaceholder', 'ReportFilterModule'), "data-filterid": filterObj.id, onchange: filterValueChanged})
                    )
                ];
                break;
            case 'CHK':
                var conditions = [
                    {'name':'equal', 'text':t('conditionEqual', 'ReportFilterModule')},
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        o.filters[filterObj.id].condition = condition.name;
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
                        m("input", {type: "checkbox", class: "form-control filter-value__checkbox", value: (filterObj.value ? filterObj.value : ''), "data-filterid": filterObj.id, onchange: filterValueChanged})
                    )
                ];
                break;
            case 'TEXT':
                var conditions = [
                    {'name':'equal', 'text':t('conditionEqual', 'ReportFilterModule')},
                    {'name':'likeStart', 'text':t('conditionLikeStart', 'ReportFilterModule')},
                    {'name':'like', 'text':t('conditionLike', 'ReportFilterModule')},
                    {'name':'null', 'text':t('conditionNull', 'ReportFilterModule')},
                    {'name':'notNull', 'text':t('conditionNotNull', 'ReportFilterModule')},
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        o.filters[filterObj.id].condition = condition.name;
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
                        m("input", {type: "text", class: "form-control filter-value__text", value: (filterObj.value ? filterObj.value : ''), placeholder: t('textFilterPlaceholder', 'ReportFilterModule'), "data-filterid": filterObj.id, onchange: filterValueChanged})
                    )
                ];
                break;
            case 'LIST':
                var conditions = [
                    {'name':'equal', 'text':t('conditionEqual', 'ReportFilterModule')},
                    {'name':'notEqual', 'text':t('conditionNotEqual', 'ReportFilterModule')}
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        o.filters[filterObj.id].condition = condition.name;
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
                        filtersDropdownArrays.hasOwnProperty(filterObj.fieldName)?
                            m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterValueChanged}, [
                                filtersDropdownArrays[filterObj.fieldName].map(function (row, index) {
                                    var isSelected = false;
                                    if(filterObj.value == false){
                                        //set filter in array condition first element value
                                        if(index == 0){
                                            o.filters[filterObj.id].value = row.code;
                                            isSelected = true;
                                        }
                                    }
                                    if(filterObj.value == row.code){
                                        isSelected = true;
                                    }
                                    return m("option", {value: row.code, selected: isSelected}, row.name)
                                })
                        ]): m("div", {class: "filter-loading"}, t('filterLoadingMsg', 'ReportFilterModule'))
                    )
                ];
                break;
            case 'GRD':
                var conditions = [
                    {'name':'equal', 'text':t('conditionEqual', 'ReportFilterModule')},
                    {'name':'notEqual', 'text':t('conditionNotEqual', 'ReportFilterModule')}
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        o.filters[filterObj.id].condition = condition.name;
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
                        filtersDropdownArrays.hasOwnProperty(filterObj.fieldName)?
                            m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterValueChanged}, [
                                filtersDropdownArrays[filterObj.fieldName].map(function (row, index) {
                                    var isSelected = false;
                                    if(filterObj.value == false){
                                        //set filter in array condition first element value
                                        if(index == 0){
                                            o.filters[filterObj.id].value = row.code;
                                            isSelected = true;
                                        }
                                    }
                                    if(filterObj.value == row.code){
                                        isSelected = true;
                                    }
                                    return m("option", {value: row.code, selected: isSelected}, row.name)
                                })
                            ]): m("div", {class: "filter-loading"}, [
                                t('filterLoadingMsg', 'ReportFilterModule'),
                                m("img", {src: "app/modules/filter/images/loading.gif"})
                            ])
                    )
                ];
                break;
            case 'SNGL':
                var conditions = [
                    {'name':'equal', 'text':t('conditionEqual', 'ReportFilterModule')},
                    {'name':'more', 'text':t('conditionMore', 'ReportFilterModule')},
                    {'name':'less', 'text':t('conditionLess', 'ReportFilterModule')},
                    {'name':'moreOrEqual', 'text':t('conditionMoreOrEqual', 'ReportFilterModule')},
                    {'name':'lessOrEqual', 'text':t('conditionLessOrEqual', 'ReportFilterModule')}
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        o.filters[filterObj.id].condition = condition.name;
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
                        m("input", {type: "text", class: "form-control filter-value__text", value: (filterObj.value ? filterObj.value : ''), config: datePicker, placeholder: t('dateFilterPlaceholder', 'ReportFilterModule'), "data-filterid": filterObj.id, onchange: filterValueChanged})
                    )
                ];
                break;
            case 'DATE':
                var conditions = [
                    {'name':'between', 'text':t('conditionBetween', 'ReportFilterModule')}
                ];
                return [
                    m("div", {class: "item-filter__condition-container form-group"},
                        m("select", {class: "form-control", "data-filterid": filterObj.id, onchange: filterConditionChanged}, [
                            conditions.map(function (condition, index) {
                                var isSelected = false;
                                if(filterObj.condition == false){
                                    //set filter in array condition first element value
                                    if(index == 0){
                                        o.filters[filterObj.id].condition = condition.name;
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
                    m("div", {class: "item-filter__value-container input-group input-daterange", config: datePickerRange},
                        m("input", {type: "text", class: "form-control", id: "date-filter-start-"+filterObj.id, value: filterObj.value['start'], name: "start", "data-filterid": filterObj.id, onchange: filterValueChanged}),
                        m("span", {class: "input-group-addon"}, t('dateByLabel', 'ReportFilterModule')),
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
        delete o.filters[filterId];
    }

    function drawFilterBlock(filterObj){
        return m("div", {class: "b-item-filter"}, [
            m("div", {class: "item-filter__and-or-container form-group"}, [
                m("label", {class: "radio-inline"}, [
                    m("input", {type: "radio", value: "AND", name: 'filter-'+filterObj.id, checked: (filterObj.andOrCondition == "AND" ? true : false), "data-filterid": filterObj.id, onchange: andOrConditionChanged}),
                    m.trust("И")
                ]),
                m("label", {class: "radio-inline"}, [
                    m("input", {type: "radio", value: "OR", name: 'filter-'+filterObj.id, checked: (filterObj.andOrCondition == "OR" ? true : false), "data-filterid": filterObj.id, onchange: andOrConditionChanged}),
                    m.trust("Или")
                ]),
                m("label", {class: "checkbox-inline item-filter__group-checkbox"}, [
                    m("input", {type: "checkbox", value: "OR", "data-filterid": filterObj.id, onchange: isGroupConditionChanged}),
                    m.trust("Группировать с предыдущим")
                ])
            ]),
            m("div", {class: "item-filter__field-select-container form-group"},
                m("select", {class: "form-control filter-select", "data-filterid": filterObj.id, onchange: filterFieldChanged}, [
                    m("option", {disabled: true, selected: true, value: "hint"}, t('loadedChooseFilterLabel', 'ReportFilterModule')),
                    Helper.objectToArray(o.filterFields).map(function (field, index) {
                        return m("option", {"data-type": field.type, value: field.name, selected: (field.name == filterObj.fieldName ? true : false)}, field.title)
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
            Helper.objectToArray(o.filters).map(function (filter) {
                return drawFilterBlock(filter)
            }),
            drawDefaultFilter()
        ];
    }

    function buildCondition($filter){
        var query = '';
        var condition = '';
        var value = $filter.value;
        var type = $filter.type;
        var conditionArray = {
            "equal":" = {value}",
            "more":" > {value}",
            "less":" < {value}",
            "moreOrEqual":" >= {value}",
            "lessOrEqual":" <= {value}",
            "likeStart":" LIKE {value}%",
            "like":" LIKE %{value}%",
            "null":" IS NULL",
            "notNull":" IS NOT NULL",
            "notEqual":" <> {value}",
            "between" : " BETWEEN {value1} AND {value2}"
        };
        var conditionArrayWithQuotes = {
            "equal":" = '{value}'",
            "more":" > '{value}'",
            "less":" < '{value}'",
            "moreOrEqual":" >= '{value}'",
            "lessOrEqual":" <= '{value}'",
            "likeStart":" LIKE '{value}%'",
            "like":" LIKE '%{value}%'",
            "null":" IS NULL",
            "notNull":" IS NOT NULL",
            "notEqual":" <> '{value}'",
            "between" : " BETWEEN {value1} AND {value2}"
        };

        if(type == "INT" || type == "SNGL" || type == "DATE" || type == "CHK"){
            query = $filter['filterField']+conditionArray[$filter['condition']];
        }else{
            query = $filter['filterField']+conditionArrayWithQuotes[$filter['condition']];
        }


        if($filter['condition'] == 'between'){
            var start = "CONVERT(DATETIME,'"+ $filter['value']['start']+"',104)";
            var end = "CONVERT(DATETIME,'"+ $filter['value']['end']+"',104) + 1";
            condition = query.replace("{value1}", start);
            condition = condition.replace("{value2}", end);
        }else{
            if(type == "SNGL"){
                value = "CONVERT(DATETIME,'"+value+"',104)";
            }
            condition = query.replace("{value}", value);
        }
        return condition;
    }

    function applyFilters(){
        var count = 1;
        var groupNumber = 1;
        var groups = {};
        var reportFilters = [];

        //build groups
        for (var filterID in o.filters){
            var filterObject =  o.filters[filterID];

            if(filterObject.condition == 'between'){
                reportFilters.push({"field": filterObject.filterField, "condition": filterObject.condition, "value": filterObject['value']['start']+';'+filterObject['value']['end']});
            }else{
                reportFilters.push({"field": filterObject.filterField, "condition": filterObject.condition, "value": filterObject.value});
            }

            if(count == 1){
                filterObject.andOrCondition = 'AND';
                filterObject.isGroupCondition = true;
            }

            if(filterObject.isGroupCondition){
                if(!groups.hasOwnProperty(groupNumber)){
                    groups[groupNumber] = [];
                }
                groups[groupNumber].push(filterObject);
            }else{
                groupNumber++;
                groups[groupNumber] = [filterObject];
            }
            count++;
        }

        //build SQL
        var groupCount = 1;
        var filterWhere = 'WHERE 1=1';
        for (var groupNumber in groups) {
            var filtersGroup = groups[groupNumber];
            var filterNumberInGroup = 1;
            var groupWhere = '';
            var groupAndOrCondition = ' AND';
            for (var i = 0; i < filtersGroup.length; i++) {
                var filterObject = filtersGroup[i];
                if(i == 0 && groupCount != 1){
                    groupAndOrCondition = filterObject.andOrCondition;
                }
                if(i == 0){
                    groupWhere += ' ' + buildCondition(filterObject);
                }else{
                    groupWhere += ' ' + filterObject.andOrCondition + ' ' + buildCondition(filterObject);
                }
                filterNumberInGroup++;
            }
            filterWhere += ' ' + groupAndOrCondition + ' ('+groupWhere+')';
            groupCount++;
        }

        o.state = 'default';
        $('#'+o.id).modal('hide');

        var now = new Date();
        var result = '';
        var requestData = {
            filters: JSON.stringify(reportFilters),
            fields: '*',
            table: o.view,
            type: o.type,
            where: filterWhere,
            use_code: Globals.getUserData()['USE_CODE'],
            report_id: ''+now.getFullYear()+now.getMonth()+now.getDay()+now.getHours()+now.getMinutes()+now.getSeconds()+Math.floor( Math.random() * ( 1 + 9999 ) )
        };
        reportState = 'loading';

        console.log('requestData');
        console.log(requestData);

        $.ajax({
            type: 'POST',
            url: '/'+Config.mainServices+'/get_report.jsp',
            data: requestData,
            dataType : 'json',
            success: function(data){
                console.log('report jsp answer');
                console.log(data);
                result = data;
            },
            complete: function(){
                showReportResultModal.apply(this,[result]);
            }
        });
        m.redraw();

    }

    function showReportResultModal($data){
        if($data.hasOwnProperty('report')){
            reportUrl = $data['report'];
            reportState = 'loaded';
        }else{
            reportState = 'error';
        }
        $('#reportLoadingModal').modal('hide');
        m.redraw();
    }

    function reportModalClosed(){
        $('#'+o.id).modal('hide');
        reportState = 'default';
    }

    function controller() {

    }

    function view() {
        console.log(o.state);
        console.log(reportState);
        switch(o.state){
            case 'default':
                switch(reportState){
                    case 'default':
                        return m("div", {class: "default-state"}, "");
                    break;
                    case 'loading':
                        var config = function(){
                            $('#reportLoadingModal').modal('show');
                        }
                        return m("div", {class: "b-card-wrapper"}, [
                            m("div", {class: "modal fade b-card-modal", tabindex: "-1", role: "dialog", id: "reportLoadingModal", config: config, "data-backdrop": "static", "data-keyboard": "false"},
                                m("div", {class: "modal-dialog card-modal__dialog", role: "document"},
                                    m("div", {class: "modal-content"}, [
                                        m("div", {class: "modal-header"},
                                            m("h4", {class: "modal-title grid-loading-modal__header"}, t('modalReportHeader', 'ReportFilterModule'))
                                        ),
                                        m("div", {class: "modal-body modal-title grid-loading-modal__body"},[
                                            m("img", {class: "grid-loading-modal__body--loader", src: "app/modules/grid/images/loading.gif"}),
                                            m.trust(t('modalReportBodyMsg', 'ReportFilterModule'))
                                        ])
                                    ])
                                )
                            ),
                        ]);
                        break;
                    case 'loaded':
                        var config = function(){
                            $('#'+o.id).modal('show');
                            $('#'+o.id).unbind('hidden.bs.modal');
                            $('#'+o.id).on('hidden.bs.modal', function () {
                                reportState = "default";
                            })
                        }
                        return m("div", {class: "modal fade b-filter-modal", tabindex: "-1", role: "dialog", id: o.id, config: config},
                            m("div", {class: "modal-dialog filter-modal__dialog", style: "width: 600px;"},
                                m("div", {class: "modal-content"}, [
                                    m("div", {class: "modal-header filter-modal__header"}, [
                                        m("button", {type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"},
                                            m("span", {"aria-hidden": "true"},
                                                m.trust("&times;")
                                            )
                                        ),
                                        m("h4", {class: "modal-title"}, t('modalReportHeader', 'ReportFilterModule'))
                                    ]),
                                    m("div", {class: "modal-body filter-modal__body"}, [
                                        m("div", {class: "filter-block-container clearfix"},[
                                            m("p", {sytle: "text-align: center;"}, t('reportWord', 'ReportFilterModule') + ' "' + (o.reportName != '' ? o.reportName : o.view + ".xlsm ") + '" ' + t('reportReadyMsg', 'ReportFilterModule')),
                                            m("p", {sytle: "text-align: center;"}, t('forSaveReportMsg', 'ReportFilterModule'))
                                        ])
                                    ]),
                                    m("div", {class: "modal-footer"}, [
                                        m("button", {type: "button", class: "btn btn-default system-btn_white", "data-dismiss": "modal"}, t('closeBtn', 'App')),
                                        m("a", {href: reportUrl, download: o.view+".xlsm", class: "btn btn-primary system-button_blue", onclick: reportModalClosed}, t('okBtn', 'App'))
                                    ])
                                ])
                            )
                        );
                    break;
                }
            break;
            case 'loading':
                var config = function(){
                    $('#'+o.id).modal('show');
                }
                return m("div", {class: "b-card-wrapper"}, [
                    m("div", {class: "modal fade b-card-modal", tabindex: "-1", role: "dialog", config: config, "data-backdrop": "static", "data-keyboard": "false"},
                        m("div", {class: "modal-dialog card-modal__dialog", role: "document"},
                            m("div", {class: "modal-content"}, [
                                m("div", {class: "modal-header"},
                                    m("h4", {class: "modal-title grid-loading-modal__header"}, t('loadingModalHeader', 'ReportFilterModule'))
                                ),
                                m("div", {class: "modal-body modal-title grid-loading-modal__body"},[
                                    m("img", {class: "grid-loading-modal__body--loader", src: "app/modules/grid/images/loading.gif"}),
                                    m.trust(t('loadingModalBody', 'ReportFilterModule'))
                                ])
                            ])
                        )
                    ),
                ]);
            break;
            case 'loaded':
                var config = function(){
                    $('#'+o.id).unbind('hidden.bs.modal');
                    $('#'+o.id).on('hidden.bs.modal', function () {
                        o.state = "default";
                    })
                    $('#'+o.id).modal('show');
                }
                return m("div", {class: "modal fade b-filter-modal", tabindex: "-1", role: "dialog", id: o.id, config: config},
                    m("div", {class: "modal-dialog filter-modal__dialog"},
                        m("div", {class: "modal-content"}, [
                            m("div", {class: "modal-header filter-modal__header"}, [
                                m("button", {type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"},
                                    m("span", {"aria-hidden": "true"},
                                        m.trust("&times;")
                                    )
                                ),
                                m("h4", {class: "modal-title"}, t('loadedReportHeader', 'ReportFilterModule'))
                            ]),
                            m("div", {class: "modal-body filter-modal__body"}, [
                                drawActiveFilter(),
                                m("div", {class: "filter-block-container clearfix"},
                                    showMainFilters()
                                )
                            ]),
                            m("div", {class: "modal-footer"}, [
                                m("button", {type: "button", class: "btn btn-system btn-system-cancel", "data-dismiss": "modal"}, t('closeBtn', 'App')),
                                m("button", {type: "button", class: "btn btn-system btn-system-primary", onclick: applyFilters}, t('getReportBtn', 'ReportFilterModule'))
                            ])
                        ])
                    )
                );
            break;
        }
    }

    return{
        init: init,
        controller: controller,
        view: view
    }
};