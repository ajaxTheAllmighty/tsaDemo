'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var AutocompleteComponent = require('../../../components/autocomplete/autocomplete.js');
var ImageUploadComponent = require('../../../components/image-upload/image-upload.js');
var ReportHistoryModule = require('../../report-manage/report-history/report-history.js');
var UploadReportModule = require('../../report-manage/upload-report/upload-report.js');
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function () {
    var _gridPicker = false;
    var _multiPicker = false;
    var _cardModal;
    var _ReportHistory;
    var _ReportUpload;
    var _locatorHash;
    var _newBrowserTab;
    var o = {
        viewPrimaryKeyObject: false,
        viewPrimaryKeyValue: false,
        keyField: {},
        view: false,
        mode: 'update',
        isModal: true,
        state: 'default',
        cardData: {},
        cardObject: {},
        isCardLoaded: false,
        isItemFieldsLoaded: false,
        cardFields: {},
        dropDownLoaded: 0,
        dropdownFields: [],
        cardDropdownArrays: {},
        cardDataToSave: {},
        errorOnSave: false,
        errorMessageOnSave: '',
        requiredFieldsOnSave: {},
        onCardSave: null,
        zIndex: 1000,
        isHeaderControls: true
    };

    function loadData(){
        console.log('load data');
        if(o.mode == 'create'){
            console.log('getItemColumns');
            getItemColumns();
        }else{
            console.log('getItemData');
            getItemData();
        }
    }

    function getItemData(){
        //m.startComputation();
        //Helper.getData(itemDataLoaded, {"context": this, "module": "Card module", "function": "getItemData"},
        //    '*',
        //    o.view,
        //    "WHERE " + o.viewPrimaryKeyObject['COLUMN_NAME'] + " = '"+o.viewPrimaryKeyValue+"'");

        var data = [];
        switch(o.view){
            case 'VIEW_ST_SALEPOINT':
                data = SalepointData[o.viewPrimaryKeyValue];
                break;
            case 'VIEW_ST_PRODUCTS':
                data = ProductData[o.viewPrimaryKeyValue];
                break;
            case 'VIEW_ST_USER':
                data = UsersData[o.viewPrimaryKeyValue];
                 break;
        }
        console.log(data);
        itemDataLoaded(data)
    }

    function itemDataLoaded($data){
        try{
            o.cardData = $data;
            if(o.isItemFieldsLoaded){
                o.state = "loaded";
                $('#loading-'+o.id).modal('hide');
                m.redraw();
                //m.endComputation();
                console.log('fields loaded');
            }else{
                console.log('get columns');
                getItemColumns();

            }
        }catch(e){
            console.log('Ошибка загрузки данных карточки');
            console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
        }

    }

    function getItemColumns(){
        //Helper.getData(columnsLoaded, {"context": this, "module": "Card module", "function": "getItemColumns"},
        //    '*',
        //    'VIEW_ISC_USER_FILTER',
        //    "WHERE TABLE_NAME = '" + o.view + "' AND URF_USR_CODE = " + Globals.getUserData()['USR_CODE']  + " AND (URF_FIELD_ACCESS > 0)", "FIL_SHOW_ORDER ASC");
        var colunms = [];
        switch(o.view){
            case 'VIEW_ST_SALEPOINT':
                colunms = SalepointCardColumns;
                break;
            case 'VIEW_ST_PRODUCTS':
                colunms = ProductCardColumns;
                break;
            case 'VIEW_ST_USER':
                colunms = UsersCardColumns;
                break;
        }
        console.log('columns', colunms);
        columnsLoaded(colunms)
    }

    function columnsLoaded($data){
        try{
            for (var i = 0; i < $data.length; i++) {
                var fieldObject = $data[i];
                var field = {
                    name: fieldObject['COLUMN_NAME'],
                    title: fieldObject[Globals.getLangDb()],
                    type: fieldObject['FIL_TYPE'],
                    group: fieldObject['FIL_GROUP'],
                    isRequired: fieldObject['FIL_IS_REQUIRED'],
                    isEditable: (fieldObject['URF_FIELD_ACCESS'] == 2 ? true : false)
                };
                if(field.type == 'LIST' && field.isEditable){
                    field.dropDownView = fieldObject['FIL_TABLE_NAME'];
                    field.dropDownName = fieldObject['FIL_NAME_FIELD'];
                    field.dropDownCode = fieldObject['FIL_CODE_FIELD'];
                    field.fieldToUpdate = fieldObject['FIL_COLUMN_NAME_LIST'];
                    o.dropdownFields.push({view: field.dropDownView, name: field.dropDownName, code: field.dropDownCode});
                    field.ac = new AutocompleteComponent;
                }

                if(field.type == 'GRID'){
                    field.gridView = fieldObject['FIL_TABLE_NAME'];
                    field.fieldToUpdate = fieldObject['FIL_COLUMN_NAME_LIST'];
                    field.dropDownName = fieldObject['FIL_NAME_FIELD'];
                    field.dropDownCode = fieldObject['FIL_CODE_FIELD'];
                }

                if(field.type == 'IMG'){
                    field.component = new ImageUploadComponent;
                }

                o.cardFields[fieldObject['COLUMN_NAME']] = field;
                if(o.mode == 'create' && (field.type == 'GRID' && field.group == 'MUL')){
                    delete o.cardFields[fieldObject['COLUMN_NAME']];
                }

                if(o.mode == 'create' && !(field.type == 'GRID' && field.group == 'MUL')){
                    setNewCardDefaultValues(field);
                }
            }

            if(o.dropdownFields.length > 0){
                //loadDropdowns();
            }else{
                $('#loading-'+o.id).modal('hide');

            }
            o.isItemFieldsLoaded = true;
            o.state = "loaded";
            m.redraw();
            //m.endComputation();
        }catch(e){
            console.log('Ошибка построения карточки');
            console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
        }

    }

    function setNewCardDefaultValues($fieldObject){
        var value;
        switch($fieldObject.type){
            case 'INT': value = ''; break;
            case 'TEXT': value = ''; break;
            case 'TEL': value = ''; break;
            case 'NUM': value = ''; break;
            case 'CHK': value = 0; break;
            case 'LIST': value = false; break;
            case 'GRID': value = false; break;
            case 'DATE': value = ''; break;
            case 'SNGL': value = ''; break;
            case 'IMG': value = ''; break;
            default: value = false; break;
        }
        o.cardData[$fieldObject.name] = value;
    }

    function loadDropdowns(){
        //for (var i = 0; i < o.dropdownFields.length; i++) {
        //    getDropdownFilter(o.dropdownFields[i]);
        //}
        o.state = "loaded";
        //m.endComputation();
    }

    function getDropdownFilter($dropFieldObj){
        //Helper.getDataEx(dropDownFilterLoaded, $dropFieldObj, {"context": this, "module": "Card module", "function": "getDropdownFilter"}, 'FIL_USE_HIERARCHY, FIL_LOC_HIERARCHY,FIL_USE_SINGLE_HIERARCHY, FIL_USE_COMPANY', 'ST_FILTER', "WHERE (FIL_IS_PRIMARY_KEY = 1) AND (FIL_VIEW_NAME = '" + $dropFieldObj.view + "')");
    }

    function dropDownFilterLoaded($data, $dropFieldObj){
        try{
            var viewFilterObject = $data[0];
            var whereClause = 'WHERE (1=1)';
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
            //Helper.getDataEx(dropDownDataLoaded, $dropFieldObj, {"context": this, "module": "Card module", "function": "dropDownFilterLoaded"}, $dropFieldObj['code'] + ' AS code,' + $dropFieldObj['name'] + ' AS name', $dropFieldObj['view'], whereClause);
        }catch(e){
            console.log('Ошибка загрузки данных для фильтров');
            console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
        }
    }

    function dropDownDataLoaded($data, $dropFieldObj){
        try{
            o.dropDownLoaded++;
            o.cardDropdownArrays[$dropFieldObj.view] = $data;
            if(o.dropDownLoaded == o.dropdownFields.length){
                o.isItemFieldsLoaded = true;
                $('#loading-'+o.id).modal('hide');
                o.state = "loaded";
                //m.endComputation();
            }
        }catch(e){
            console.log('Ошибка загрузки данных для фильтров');
            console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
        }
    }

    function checkIsEmpty($value){
        if(typeof $value === 'undefined' || $value === '' || $value === false || $value === null){
            return true;
        }
        return false;
    }

    //CUSTOM FUNCTIONS
    function loadReportHistory(){
        _ReportHistory.load(o.viewPrimaryKeyValue);
    }

    function showUploadReportModal(){
        _ReportUpload.load({
            reportCode: o.viewPrimaryKeyValue,
            onUpload: function(){
                $('#'+o.id).modal('hide');
                o.state = 'default';
                o.onCardSave();
            }
        });
    }


    function buildCard(){
        return m("table", {class: "table b-card-table"},
            m("tbody", [
                Helper.objectToArray(o.cardFields).map(function(fieldObject){
                    //add required fields without values to array, on save it will be checked
                    var error = false;
                    if(fieldObject.isRequired && fieldObject.isEditable){
                        if(checkIsEmpty(o.cardData[fieldObject.name])){
                            if(fieldObject.type == "LIST" || fieldObject.type == "GRID"){
                                o.cardDataToSave[fieldObject.fieldToUpdate] = {value: false, fieldObject: fieldObject};
                            }else{
                                o.cardDataToSave[fieldObject.name] = {value: false, fieldObject: fieldObject};
                            }
                            //highlight fields with error on save
                            if(o.errorOnSave){
                                error = true;
                            }
                        }
                    }
                    //CUSTOM FIELDS
                    if(fieldObject.group == "SYS_BTN"){
                        switch(fieldObject.type){
                            //REPORT MANAGE MODULE
                            case 'M_REPORT_MANAGE__SHOW_LIST_BTN':
                                return  m("tr", {class: "card-table__row"}, [
                                    m("td", {class: "card-table__label-column"}, 'Шаблон отчета'),
                                    m("td", {class: "card-table__value-column"},
                                        m("button", {class: "btn btn-link btn-system-link", onclick: loadReportHistory}, t('downloadReportCustomBtn', 'CardModule'))
                                    )
                                ]);
                                break;
                            case 'M_REPORT_MANAGE__UPLOAD_BTN':
                                return  m("tr", {class: "card-table__row"}, [
                                    m("td", {class: "card-table__label-column"}, 'Шаблон отчета'),
                                    m("td", {class: "card-table__value-column"},
                                        m("button", {class: "btn btn-link btn-system-link", onclick: showUploadReportModal}, t('uploadReportCustomBtn', 'CardModule'))
                                    )
                                ]);
                            break;
                        }
                    }

                    return m("tr", {class: "card-table__row"+(error ? " danger has-error":"")}, [
                        m("td", {class: "card-table__label-column"}, (fieldObject.isRequired == 1 ? fieldObject.title + ' *' : fieldObject.title)),
                        m("td", {class: "card-table__value-column"}, buildFieldByType(fieldObject))
                    ])
                })
            ])
        );
    }

    function buildFieldByType($fieldObject){
        // create numeric or text field
        if (($fieldObject.type == "NUM" && $fieldObject.group == "NUM") ||
            ($fieldObject.type == "INT" && $fieldObject.group == "INT") ||
            ($fieldObject.type == "TEXT" && $fieldObject.group == "TEXT") ||
            ($fieldObject.type == "TEL" && $fieldObject.group == "TEL")){
            return buildTextField($fieldObject);
        }

        // create textarea field
        if (($fieldObject.type == "TEXT") && ($fieldObject.group == "AREA"))
        {
            return buildTextAreaField($fieldObject);
        }

        // create checkbox field
        if (($fieldObject.type == "CHK") && ($fieldObject.group == "CHK"))
        {
            return buildCheckBoxField($fieldObject);
        }

        // create datepicker field
        if (($fieldObject.type == "DATE") && ($fieldObject.group == "DATE"))
        {
            return buildDateField($fieldObject);
        }

        // create datepicker field
        if (($fieldObject.type == "DATE") && ($fieldObject.group == "SNGL"))
        {
            return buildDateField($fieldObject);
        }

        // create basic dropdown
        if (($fieldObject.type == "LIST") && ($fieldObject.group == "LIST"))
        {
            return buildSelectField($fieldObject);
        }

        if (($fieldObject.type == "GRID") && ($fieldObject.group == "ADR"))
        {
            return buildGridPickerField($fieldObject);
        }

        if (($fieldObject.type == "LIST") && ($fieldObject.group == "SAL"))
        {
            return o.cardData[$fieldObject.name];
        }

        if (($fieldObject.type == "GRID") && ($fieldObject.group == "GRD"))
        {
            return buildGridPickerField($fieldObject);
        }

        if (($fieldObject.type == "GRID") && ($fieldObject.group == "MUL"))
        {
            return buildMultiPickerField($fieldObject);
        }

        if (($fieldObject.type == "GRID") && ($fieldObject.group == "FIL"))
        {
            return buildGridViewerField($fieldObject);
        }

        if (($fieldObject.type == "IMG") && ($fieldObject.group == "IMG"))
        {
            return buildImageField($fieldObject);
        }

        if (($fieldObject.type == "MAP") && ($fieldObject.group == "MAP"))
        {
            return m("button", {class: "btn btn-link", 'data-salcode': o.cardData['SAL_CODE'], onclick: createLocatorLink, disabled: !$fieldObject.isEditable}, t('locatorLink', 'CardModule'))
        }
        console.log("unknown type");
        console.log($fieldObject);
    }

    function generateLinkHash(){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for ( var i = 0; i < 10; i++ ){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    function createLocatorLink(){
        var salCode = this.getAttribute('data-salcode');
        var jsonData = JSON.stringify({salepoint: salCode});
        _newBrowserTab = window.open('about:blank', '_blank');
        _locatorHash = generateLinkHash();
        //Helper.insertData(locatorLinkDone, {"context": this, "module": "Card", "function": "createLocatorLink"}, "AT_APP_RELOCATE", "AAR_USE_CODE, AAR_HASH, AAR_ROUTE, AAR_DATA", Globals.getUserData()['USE_CODE'] + ",'"+_locatorHash+"'" + ",'/локатор', '"+jsonData+"'");
    }

    function locatorLinkDone(){
        _newBrowserTab.location.href = '#/relocate/'+_locatorHash;
    }

    function buildTextField($fieldObject){
        return m("input", {class: "form-control", value: o.cardData[$fieldObject.name], "data-field": $fieldObject.name, onchange: changeCardFieldValue, disabled: !$fieldObject.isEditable})
    }

    function buildTextAreaField($fieldObject){
        return m("textarea", {class: "form-control", rows: 3, "data-field": $fieldObject.name, onchange: changeCardFieldValue, disabled: !$fieldObject.isEditable}, o.cardData[$fieldObject.name])
    }

    function buildCheckBoxField($fieldObject){
        return m("input", {type: "checkbox", class: "form-control", checked: (o.cardData[$fieldObject.name] == 1 ? true : false), "data-field": $fieldObject.name, onchange: changeCardFieldValue, disabled: !$fieldObject.isEditable})
    }

    function datePicker(el){
        $(el).datepicker({
            format: 'dd-mm-yyyy',
            language: Globals.getLangApp()
        });
    }

    function parseDate(str) {
        if(str){
            var m = str.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
            if(m) {
                return m[1] + '-' + m[2] + '-' + m[3]
            }else{
                var m = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
                if(m){
                    return m[3] + '-' + m[2] + '-' + m[1]
                }
            }
        }
        return false;
    }

    function buildDateField($fieldObject){
        var date = parseDate(o.cardData[$fieldObject.name]);
        if(date){
            o.cardObject[$fieldObject.name] = date;
        }
        return m("input", {type: "text", class: "form-control filter-value__text", value: (date ? date : ''), config: datePicker, "data-field": $fieldObject.name, onchange: changeCardFieldValue, disabled: !$fieldObject.isEditable})
    }

    function buildSelectField($fieldObject){
        if(!$fieldObject.isEditable){
            return m("select", {class: "form-control", "data-view": $fieldObject.view, "data-field": $fieldObject.name, onchange: changeCardFieldValue, disabled: true}, [
                m("option", {value: "hint", selected: true, disabled: true}, o.cardData[$fieldObject.name]),
            ])
        }

        if(o.cardDropdownArrays.hasOwnProperty($fieldObject.dropDownView)){
            return m("select", {class: "form-control", "data-view": $fieldObject.view, "data-field": $fieldObject.name, onchange: changeCardFieldValue, disabled: !$fieldObject.isEditable}, [
                m("option", {value: "hint", selected: true, disabled: true}, t('selectInputHintLabel', 'CardModule')),
                m("option", {value: "NULL"}, t('selectInputNullLabel', 'CardModule')),
                o.cardDropdownArrays[$fieldObject.dropDownView].map(function(optionObject){
                    var selected = false;
                    if(o.cardData[$fieldObject.name] == optionObject.name || o.cardData[$fieldObject.name] == optionObject.code){
                        selected = true;
                        o.cardObject[$fieldObject.fieldToUpdate] = optionObject.code;
                    }
                    return m("option", {value: optionObject.code, selected: selected}, optionObject.name)
                })
            ])
        }
    }

    function buildImageField($fieldObject){
        o.cardObject[$fieldObject.name] = o.cardData[$fieldObject.name];
        var imgUrl = false;
        if(!checkIsEmpty(o.cardData[$fieldObject.name])){
            imgUrl = Config.serverAddress + Config.rootFolder + 'photo/'+o.viewPrimaryKeyObject['FIL_TABLE_NAME']+'/'+o.cardData[$fieldObject.name];
        }
        return m.component($fieldObject.component, {
            id: $fieldObject.name+"-IMG",
            allowsExtensions: "image/*",
            folder: o.viewPrimaryKeyObject['FIL_TABLE_NAME'],
            imgUrl: imgUrl,
            imgName: o.cardData[$fieldObject.name],
            isEditable: true,
            afterUpload: function(value){
                o.cardDataToSave[$fieldObject.name] = {value: value, fieldObject: $fieldObject};
            }
        });
    }

    function buildGridPickerField($fieldObject){
        return m("button", {class: "btn btn-link", "data-field": $fieldObject.name ,onclick: loadGridPicker, disabled: !$fieldObject.isEditable}, (checkIsEmpty(o.cardData[$fieldObject.name]) ? t('pickerDefaultLink', 'CardModule') : o.cardData[$fieldObject.name]));
    }

    function buildMultiPickerField($fieldObject){
        return m("button", {class: "btn btn-link", "data-field": $fieldObject.name ,onclick: loadMultiPicker, disabled: !$fieldObject.isEditable}, t('pickerDefaultLink', 'CardModule'));
    }

    function buildGridViewerField($fieldObject){
        return m("button", {class: "btn btn-link", "data-field": $fieldObject.name ,onclick: loadGridViewer, disabled: !$fieldObject.isEditable}, o.cardData[$fieldObject.name]);
    }

    function changeCardFieldValue(){
        var fieldObject = o.cardFields[this.getAttribute("data-field")];

        // create numeric or text field
        if ((fieldObject.type == "NUM" && fieldObject.group == "NUM") ||
            (fieldObject.type == "INT" && fieldObject.group == "INT") ||
            (fieldObject.type == "TEXT" && fieldObject.group == "TEXT") ||
            (fieldObject.type == "TEL" && fieldObject.group == "TEL")){
            o.cardData[fieldObject.name] = this.value;
            o.cardDataToSave[fieldObject.name] = {value: this.value, fieldObject: fieldObject};
        }

        // create textarea field
        if ((fieldObject.type == "TEXT") && (fieldObject.group == "AREA")){
            o.cardData[fieldObject.name] = this.value;
            o.cardDataToSave[fieldObject.name] = {value: this.value, fieldObject: fieldObject};
        }

        // create checkbox field
        if ((fieldObject.type == "CHK") && (fieldObject.group == "CHK")){
            o.cardData[fieldObject.name] = (this.checked ? 1 : 0);
            fieldObject.isRequired = false;
            o.cardDataToSave[fieldObject.name] = {value: (this.checked ? 1 : 0), fieldObject: fieldObject};
        }

        // create datepicker field
        if ((fieldObject.type == "DATE") && (fieldObject.group == "DATE")){
            o.cardData[fieldObject.name] = this.value;
            var value = this.value;
            if(!this.value || this.value === null || this.value.trim() === ''){
                value = false;
            }
            o.cardDataToSave[fieldObject.name] = {value: (value ? "CONVERT(DATETIME,'"+this.value+"',104)" : 'NULL'), fieldObject: fieldObject};
        }

        // create datepicker field
        if ((fieldObject.type == "DATE") && (fieldObject.group == "SNGL")){
            o.cardData[fieldObject.name] = this.value;
            var value = this.value;
            if(!this.value || this.value === null || this.value.trim() === ''){
                value = false;
            }
            o.cardDataToSave[fieldObject.name] = {value: (value ? "CONVERT(DATETIME,'"+this.value+"',104)" : 'NULL'), fieldObject: fieldObject};
        }

        // create basic dropdown
        if ((fieldObject.type == "LIST") && (fieldObject.group == "LIST")){
            o.cardData[fieldObject.name] = this.options[this.selectedIndex].value;
            o.cardDataToSave[fieldObject.fieldToUpdate] = {value: this.options[this.selectedIndex].value, fieldObject: fieldObject};
        }

        if ((fieldObject.type == "LIST") && (fieldObject.group == "SAL")){
            o.cardData[fieldObject.name] = this.options[this.selectedIndex].value;
            o.cardDataToSave[fieldObject.fieldToUpdate] = {value: this.options[this.selectedIndex].value, fieldObject: fieldObject};
        }
    }

    function loadGridPicker(){
        var fieldName = this.getAttribute("data-field");
        var fieldObject = o.cardFields[fieldName];
        _gridPicker = m.component(new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'picker',
            allowNew: false,
            gridView: fieldObject.gridView,
            cardFieldObject: fieldObject,
            perPage: 50,
            staticFilters: [],
            showSelectColumn: false,
            onRowClick: function ($selectedRow) {
                o.cardData[$selectedRow.cardObject.name] = $selectedRow.title;
                o.cardDataToSave[$selectedRow.cardObject.fieldToUpdate] = {fieldObject: fieldObject, value: $selectedRow.key};
                _gridPicker = false;
            },
            isModal: true,
            onClose: function(){
                _gridPicker = false;
            },
            zIndex: o.zIndex+1
        }));
    }

    function loadMultiPicker(){
        var fieldName = this.getAttribute("data-field");
        var fieldObject = o.cardFields[fieldName];
        _multiPicker = m.component(new GridModule({
            mode: "key-grid",
            moduleId: Globals.registerModule('grid'),
            allowNew: true,
            gridView: fieldObject.gridView,
            cardFieldObject: fieldObject,
            keyField: {name: o.viewPrimaryKeyObject['COLUMN_NAME'], value: o.viewPrimaryKeyValue},
            staticFilters: {
                1:{
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldName: o.viewPrimaryKeyObject['COLUMN_NAME'],
                    fieldTitle: t('multiPickerDefaultFilterValue', 'CardModule'),
                    filterField: o.viewPrimaryKeyObject['COLUMN_NAME'],
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: o.viewPrimaryKeyValue
                }
            },
            isModal: true,
            onClose: function(){
                _multiPicker = false;
            },
            zIndex: o.zIndex+1
        }));
    }

    function loadGridViewer(){
        var fieldName = this.getAttribute("data-field");
        var fieldObject = o.cardFields[fieldName];
        _multiPicker = m.component(new GridModule({
            mode: "key-grid",
            moduleId: Globals.registerModule('grid'),
            allowNew: false,
            gridView: fieldObject.gridView,
            cardFieldObject: fieldObject,
            keyField: {name: o.viewPrimaryKeyObject['COLUMN_NAME'], value: o.viewPrimaryKeyValue},
            staticFilters: {
                1:{
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldName: o.viewPrimaryKeyObject['COLUMN_NAME'],
                    fieldTitle: t('multiPickerDefaultFilterValue', 'CardModule'),
                    filterField: o.viewPrimaryKeyObject['COLUMN_NAME'],
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: o.viewPrimaryKeyValue
                }
            },
            isModal: true,
            onClose: function(){
                _multiPicker = false;
            },
            zIndex: o.zIndex+1
        }));
    }

    function init($options){
        o = $.extend(o, $options || {});
    }

    function load($options){
        o = $.extend(o, $options || {});
    }

    function saveCard(){
        var updateExpression = '';
        var keysToInsert = [];
        var valuesToInsert = [];
        var error = false;
        var emptyFields = [];
        var newObject = {};
        var updateObject = {}; ;
        var updateArray = [];

        switch(o.view){
            case 'VIEW_ST_SALEPOINT':
                updateObject = SalepointData[o.viewPrimaryKeyValue];
                break;
            case 'VIEW_ST_PRODUCTS':
                updateObject = ProductData[o.viewPrimaryKeyValue];
                break;
            case 'VIEW_ST_USER':
                updateObject = UsersData[o.viewPrimaryKeyValue];
                break;
        }

        if(Object.keys(o.cardDataToSave).length == 0){
            cardSaved();
            return;
        }

        for(var keys = Object.keys(o.cardDataToSave), i = 0, end = keys.length; i < end; i++) {
            var fieldName = keys[i];
            var fieldValue = o.cardDataToSave[fieldName].value;
            var fieldType = o.cardDataToSave[fieldName].fieldObject.type;
            var isRequired = o.cardDataToSave[fieldName].fieldObject.isRequired;
            var isEditable = o.cardDataToSave[fieldName].fieldObject.isEditable;

            if((isRequired && isEditable) && checkIsEmpty(fieldValue)){
                error = true;
                emptyFields.push(o.cardDataToSave[fieldName].fieldObject.title);
            }

            if(!error){
                if(fieldType != "DATE" && fieldType != "SNGL" && fieldType != "GRID"  && fieldType != "CHK"){
                    fieldValue = fieldValue.replace(/["']/g, "");
                }

                if(fieldType != "INT" && fieldType != "SNGL" && fieldType != "DATE" && fieldType != "CHK" && fieldValue != 'NULL'){
                    //shit shame
                    //fieldValue = "N'"+fieldValue+"'";
                }
                if(o.mode == 'create'){
                    //CREATE
                    keysToInsert.push(fieldName);
                    valuesToInsert.push(fieldValue);
                    newObject[fieldName] = fieldValue;
                }else{
                    updateArray.push({
                        field: fieldName,
                        value: fieldValue
                    });
                    //UPDATE
                    if(i != keys.length - 1){
                        updateExpression += fieldName+' = '+fieldValue+', ';
                    }else{
                        updateExpression += fieldName+' = '+fieldValue;
                    }
                }
            }
        }

        if(error){
            o.errorOnSave = true;
            o.errorMessageOnSave = t('emptyFieldsError', 'CardModule') +emptyFields.map(function(field){ return '"'+field+'"';}).join(', ');
        }else{
            if(o.mode == 'create'){
                var isSubRef = false;
                if(typeof o.keyField.name != 'undefined'){
                    isSubRef = true;
                }
                try{
                    switch(o.view){
                        case 'VIEW_ST_SALEPOINT':
                            newObject['SAL_ID'] = 'SAL00000'+Math.round(Math.random()*1000);
                            newObject['BDN_NAME'] = 'Алматы';
                            newObject['LOC_NAME'] = 'Алматы';
                            newObject['CHA_NAME'] = 'Розница';
                            newObject['SAL_ADDRESS'] = 'Алматы, '+newObject['SAL_HOUSE'];
                            newObject[o.viewPrimaryKeyObject['COLUMN_NAME']] = SalepointData.length;
                            SalepointData.push(newObject);
                            break;
                        case 'VIEW_ST_PRODUCTS':
                            newObject['PRG_NAME'] = 'Продукция';
                            newObject['KET_NAME'] = 'Подбор значений (+1, +10, +100)';
                            newObject[o.viewPrimaryKeyObject['COLUMN_NAME']] = ProductData.length;
                            ProductData.push(newObject);
                            break;
                        case 'VIEW_ST_USER':
                            newObject['USE_ID'] = 'USE00000'+Math.round(Math.random()*1000);
                            newObject['PER_NAME_FULL'] ='DEMO';
                            newObject['USE_LOGIN'] = Math.round(Math.random()*1000);
                            newObject['BDN_NAME'] = 'Демо направление';
                            newObject['PAR_PARENT_NAME'] = 'Демо администратор';
                            newObject['USR_NAME'] = 'Демо роль';
                            UsersData.push(newObject);
                            break;
                    }
                    //Helper.insertData(cardSaved, this,o.viewPrimaryKeyObject['FIL_TABLE_NAME'],keysToInsert.join(',')+',CMP_CODE'+(isSubRef ? ','+ o.keyField.name : ''), valuesToInsert.join(',')+','+Globals.getUserData()['CMP_CODE']+(isSubRef ? ','+ o.keyField.value : ''));
                }catch(e){
                    //Helper.insertData(cardSaved, this,o.viewPrimaryKeyObject['FIL_TABLE_NAME'],keysToInsert.join(',')+','+ o.keyField.name, valuesToInsert.join(',')+','+ o.keyField.value);
                }
            }else{
                updateArray.map(function(updateObj, index){
                    updateObject[updateObj.field] = updateObj.value;
                })

                switch(o.view){
                    case 'VIEW_ST_SALEPOINT':
                        updateObject['SAL_ADDRESS'] = 'Алматы, '+updateObject['SAL_HOUSE'];
                        break;
                    case 'VIEW_ST_PRODUCTS':

                        break;
                }
                //Helper.updateData(cardSaved, {"context": this, "module": "Card module", "function": "saveCard"}, updateExpression, o.viewPrimaryKeyObject['FIL_TABLE_NAME'], o.viewPrimaryKeyObject['COLUMN_NAME'] + " = " + o.viewPrimaryKeyValue);

            }
            if(o.isModal){
                _cardModal.hide();
            }
        }
    }

    function cardSaved(){
        if(o.isModal){
            o.state = 'default';
        }
        o.onCardSave();
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        loadData();
        //CUSTOM MODULES
        if(o.view == 'VIEW_ST_REPORT_MANAGE'){
            _ReportHistory = new ReportHistoryModule({
                zIndex: o.zIndex + 1
            });
            _ReportUpload = new UploadReportModule({
                zIndex: o.zIndex + 1
            });
        }
    }

    function view(){
        console.log(o.state, o.cardData );
        switch(o.state){
            case 'default':
                return m("div", {class: "default-state"},'');
            break;
            case 'loading':
                //return m("div", {class: "grid-loading-modal", config: loadData}, [
                return m("div", {class: "grid-loading-modal"}, [
                    new Modal({
                        id: 'cardLoading-'+o.id,
                        state: 'show',
                        content: [
                            m("img", {
                                class: "grid-loading-modal__body--loader",
                                src: "dist/assets/images/loading.gif"
                            }),
                            m.trust(t('loadingModalBody', 'CardModule'))
                        ],
                        isStatic: true,
                        header: t('loadingModalHeader', 'CardModule'),
                        isFooter: false,
                        isFullScreen: false,
                        modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'}
                    })
                ]);
            break;
            case 'loaded':
                if(o.isModal){
                    _cardModal = new Modal({
                        id: 'card-'+o.id,
                        state: 'show',
                        header: [
                            (o.mode == 'create' ? t('mainCardCreateHeader', 'CardModule') : t('mainCardUpdateHeader', 'CardModule')),
                            (o.mode == 'create' ? "" : m("span", o.viewPrimaryKeyValue))
                        ],
                        content: [
                            o.isHeaderControls ? m("div", {class: "card-header-controls"}, [
                                m("button", {class: "btn btn-system btn-system-cancel" ,onclick: function(){o.state = 'default';}}, t('cancelBtn', 'App')),
                                m("button", {class: "btn btn-system btn-success" ,onclick: saveCard}, t('saveBtn', 'App'))
                            ]) : '',
                            buildCard(),
                            o.errorOnSave ? m("p", {class: "card-modal__error-message bg-danger"}, o.errorMessageOnSave): '',
                            (_gridPicker ? _gridPicker : ''),
                            (_multiPicker ? _multiPicker : ''),
                            //CUSTOM MODULES
                            (o.view == 'VIEW_ST_REPORT_MANAGE' ? [m.component(_ReportHistory), m.component(_ReportUpload)] : '')
                        ],
                        isStatic: false,
                        isFooter: true,
                        isFullScreen: false,
                        modalSizeParams: {width: '60%', height: false, padding: '5% 0 5% 0'},
                        zIndex: o.zIndex,
                        confirmBtn: t('saveBtn', 'App'),
                        confirmBtnClass: 'btn-success',
                        onConfirm: saveCard,
                        onCancel: function(){o.state = 'default';}
                    });
                    return _cardModal;
                }else{
                    return m("div", {class: "m-card"}, [
                        o.isHeaderControls ? m("div", {class: "card-header-controls"}, [
                            m("button", {class: "btn btn-system btn-success" ,onclick: saveCard}, t('saveBtn', 'App'))
                        ]) : '',
                        buildCard(),
                        o.errorOnSave ? m("p", {class: "card-modal__error-message bg-danger"}, o.errorMessageOnSave): '',
                        (_gridPicker ? _gridPicker : ''),
                        (_multiPicker ? _multiPicker : ''),
                        //CUSTOM MODULES
                        (o.view == 'VIEW_ST_REPORT_MANAGE' ? [m.component(_ReportHistory), m.component(_ReportUpload)] : ''),
                        m("div",
                            m("button", {class: "btn btn-system btn-success", style: "float: right;" ,onclick: saveCard}, t('saveBtn', 'App'))
                        )
                    ])
                }

            break;
            default:
                return m("div", {class: "default-state"}, "");
            break;
        }
    }

    return{
        controller: controller,
        view: view,
        init: init,
        load: load,
        o: o
    }
};