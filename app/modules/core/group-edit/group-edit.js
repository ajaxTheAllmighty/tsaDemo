'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var AutocompleteComponent = require('../../../components/autocomplete/autocomplete.js');
var ImageUploadComponent = require('../../../components/image-upload/image-upload.js');
var Modal = require('../../../components/modal-window/modal-window.js');
var ModalLoading = require('../../../components/modal-window/loading-modal-window.js');
module.exports = function (config) {
    var _state = 'loading';
    var _redrawCount = 0;
    var _errors = [];
    var _errorsOnSave = [];
    var _Grid = '';
    var _fieldsToUpdate = [];
    var _editableFields = [];
    var _fieldsInUse = [];
    var _dropdownArrays = {};
    var _updateType = 'keys';
    var _confirmModal = '';

    var keys = config.keys;
    var viewName = config.view;
    var where = config.where;
    var viewPrimaryKeyObject = config.viewPrimaryKeyObject;
    var totalRows = config.totalRows;
    var onSave = config.onSave;
    var onClose = config.onClose;


    function columnsLoaded(data){
        if(data.length === 0){
            _errors.push('В представлении нет редактируемых полей!');
            _state = 'error';
            m.redraw();
        }else{
            var fieldId = 0;
            data.map(function(fieldObject, index){
                var toAdd = true;
                if (fieldObject['FIL_TYPE'] === "MAP" && fieldObject['FIL_GROUP'] === "MAP"){
                    toAdd = false;
                }
                if (fieldObject['FIL_TYPE'] === "GRID" && fieldObject['FIL_GROUP'] === "FIL"){
                    toAdd = false;
                }
                if (fieldObject['FIL_TYPE'] === "GRID" && fieldObject['FIL_GROUP'] === "MUL"){
                    toAdd = false;
                }
                if (fieldObject['FIL_TYPE'] === "LIST" && fieldObject['FIL_GROUP'] === "SAL"){
                    toAdd = false;
                }

                if(toAdd){
                    var field = {
                        id: fieldId,
                        name: fieldObject['COLUMN_NAME'],
                        title: fieldObject[Globals.getLangDb()],
                        type: fieldObject['FIL_TYPE'],
                        group: fieldObject['FIL_GROUP'],
                        isRequired: fieldObject['FIL_IS_REQUIRED'],
                        value: false,
                        valueTitle: false,
                        isError: false
                    };

                    if(field.type == 'LIST'){
                        field.dropDownView = fieldObject['FIL_TABLE_NAME'];
                        field.dropDownName = fieldObject['FIL_NAME_FIELD'];
                        field.dropDownCode = fieldObject['FIL_CODE_FIELD'];
                        field.fieldToUpdate = fieldObject['FIL_COLUMN_NAME_LIST'];
                        //o.dropdownFields.push({view: field.dropDownView, name: field.dropDownName, code: field.dropDownCode});
                        //field.ac = new AutocompleteComponent;
                    }

                    if(field.type == 'GRID'){
                        field.gridView = fieldObject['FIL_TABLE_NAME'];
                        field.fieldToUpdate = fieldObject['FIL_COLUMN_NAME_LIST'];
                        field.dropDownName = fieldObject['FIL_NAME_FIELD'];
                        field.dropDownCode = fieldObject['FIL_CODE_FIELD'];
                    }
                    _editableFields.push(field);
                    fieldId++;
                }
            });
            _state = 'default';
            m.redraw();
        }
    }

    function checkForDropdown(fieldObject) {
        if(!_dropdownArrays.hasOwnProperty(fieldObject.dropDownView)){
            getDropdownFilter(fieldObject);
        }
    }

    function getDropdownFilter(dropFieldObj){
        Helper.getDataEx(dropDownFilterLoaded, dropFieldObj, {"context": this, "module": "Group edit module", "function": "getDropdownFilter"}, 'FIL_USE_HIERARCHY, FIL_LOC_HIERARCHY,FIL_USE_SINGLE_HIERARCHY, FIL_USE_COMPANY', 'ST_FILTER', "WHERE (FIL_IS_PRIMARY_KEY = 1) AND (FIL_VIEW_NAME = '" + dropFieldObj.dropDownView + "')");
    }

    function dropDownFilterLoaded(data, dropFieldObj){
        try{
            var viewFilterObject = data[0];
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
            Helper.getDataEx(dropDownDataLoaded, dropFieldObj, {"context": this, "module": "Group edit module", "function": "dropDownFilterLoaded"}, dropFieldObj.dropDownCode + ' AS code,' + dropFieldObj.dropDownName + ' AS name', dropFieldObj.dropDownView, whereClause);
        }catch(e){
            console.log('Ошибка загрузки данных для фильтров списка');
            console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
        }
    }

    function dropDownDataLoaded(data, dropFieldObj){
        try{
            _dropdownArrays[dropFieldObj.dropDownView] = data;
            m.redraw();
        }catch(e){
            console.log('Ошибка загрузки данных для фильтров');
            console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
        }
    }

    /////////////////////////////
    //      MODULE EVENTS      //
    /////////////////////////////

    function fieldTypeChanged(){
        var fieldId = parseInt(this.value);
        _fieldsInUse.push(fieldId);
        _fieldsToUpdate.push(_editableFields[fieldId])
        _redrawCount++;
    }

    function removeField(){
        var fieldIndex = parseInt(this.getAttribute('data-index'));
        try{
            var fieldId = _fieldsToUpdate[fieldIndex].id;
            var fieldInUseIndex = _fieldsInUse.indexOf(fieldId);
            if(fieldInUseIndex !== -1){
                _fieldsInUse.splice(fieldInUseIndex, 1);
            }
            _fieldsToUpdate.splice(fieldIndex, 1);
        }catch(e){
            console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
        }
    }

    function updateTypeChange(){
        _updateType = this.value;
    }

    function changeFieldValue(){
        var value = this.value;
        var fieldIndex = parseInt(this.getAttribute('data-index'));
        var fieldObject = _fieldsToUpdate[fieldIndex];

        // create numeric or text field
        if ((fieldObject.type == "NUM" && fieldObject.group == "NUM") ||
            (fieldObject.type == "INT" && fieldObject.group == "INT") ||
            (fieldObject.type == "TEXT" && fieldObject.group == "TEXT") ||
            (fieldObject.type == "TEL" && fieldObject.group == "TEL")){
            fieldObject.value = value;
        }

        // create textarea field
        if ((fieldObject.type == "TEXT") && (fieldObject.group == "AREA")){
            fieldObject.value = value;
        }

        // create checkbox field
        if ((fieldObject.type == "CHK") && (fieldObject.group == "CHK")){
            fieldObject.value = (this.checked ? 1 : 0);
        }

        // create datepicker field
        if ((fieldObject.type == "DATE") && (fieldObject.group == "DATE")){
            try{
                fieldObject.value = value;
                if(value.trim() === ''){
                    fieldObject.value = false;
                }
            }catch(e){
                fieldObject.value = false;
                console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
            }
        }

        // create datepicker field
        if ((fieldObject.type == "DATE") && (fieldObject.group == "SNGL")){
            try{
                fieldObject.value = value;
                if(value.trim() === ''){
                    fieldObject.value = false;
                }
            }catch(e){
                fieldObject.value = false;
                console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
            }
        }

        // create basic dropdown
        if ((fieldObject.type == "LIST") && (fieldObject.group == "LIST")){
            fieldObject.value = value;
        }

        if ((fieldObject.type == "LIST") && (fieldObject.group == "SAL")){
            fieldObject.value = value;
        }
    }

    function loadGridPicker(){
        var fieldIndex = parseInt(this.getAttribute("data-index"));
        var fieldObject = _fieldsToUpdate[fieldIndex];
        _Grid = m.component(new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'picker',
            allowNew: false,
            gridView: fieldObject.gridView,
            cardFieldObject: fieldObject,
            perPage: 50,
            staticFilters: [],
            showSelectColumn: false,
            onRowClick: function (selectedRow) {
                fieldObject.value = selectedRow.key;
                fieldObject.valueTitle = selectedRow.title;
                _Grid = '';
            },
            isModal: true,
            onClose: function(){
                _Grid = '';
            }
        }));
    }

    function save() {
        var updateExpressionArray = [];

        _fieldsToUpdate.map(function(fieldObject){
            //prepare values
            if(fieldObject.value === false || (fieldObject.value == 'false')){
                if(fieldObject.type === "CHK"){
                    fieldObject.value = 1;
                }else if(fieldObject.type === "NUM" || fieldObject.type === "INT" || fieldObject.type === "TEXT" || fieldObject.type == "TEL"){
                    fieldObject.value = "''";
                }else{
                    fieldObject.value = 'NULL';
                }
            }else{
                //prepare text fields
                if(fieldObject.type !== "INT" && fieldObject.type !== "SNGL" && fieldObject.type !== "DATE" && fieldObject.type !== "CHK" && fieldObject.type !== "LIST" && fieldObject.type !== "GRID"){
                    //shit shame
                    fieldObject.value = fieldObject.value.replace(/["']/g, "");
                    fieldObject.value = "N'"+fieldObject.value+"'";
                }

                if(fieldObject.type === "SNGL" || fieldObject.type === "DATE"){
                    fieldObject.value = "CONVERT(DATETIME,'"+fieldObject.value+"',104)";
                }
            }

            //prepare update expression
            if(fieldObject.type === "LIST" || fieldObject.type === "GRID"){
                updateExpressionArray.push(fieldObject.fieldToUpdate+' = '+fieldObject.value);
            }else{
                updateExpressionArray.push(fieldObject.name+' = '+fieldObject.value);
            }
        })

        if(_updateType === 'keys'){
            Helper.updateData(dataSaved, {"context": this, "module": "Group edit module", "function": "save"}, updateExpressionArray.join(', '), viewPrimaryKeyObject['FIL_TABLE_NAME'], viewPrimaryKeyObject['COLUMN_NAME']+' IN ('+keys.join(',')+')');

        }else{
            Helper.updateData(dataSaved, {"context": this, "module": "Group edit module", "function": "save"}, updateExpressionArray.join(', '), viewPrimaryKeyObject['FIL_TABLE_NAME'], viewPrimaryKeyObject['COLUMN_NAME']+' IN (SELECT '+viewPrimaryKeyObject['COLUMN_NAME']+' FROM '+viewName+' '+where+')');
        }
    }

    function dataSaved() {
        onSave();
        _state = 'success';
        m.redraw();
    }

    function trySave(){
        _errorsOnSave = [];
        if(_fieldsToUpdate.length > 0){
            _fieldsToUpdate.map(function(fieldToUpdate){
                if(fieldToUpdate.isRequired && !fieldToUpdate.value && fieldToUpdate.type !== 'CHK'){
                    _errorsOnSave.push('Не заполнено обязательное поле: "'+fieldToUpdate.title+'"')
                    fieldToUpdate.isError = true;
                }else{
                    fieldToUpdate.isError = false;
                }
            })

            if(_errorsOnSave.length === 0){
                _confirmModal = new Modal({
                    id: 'groupEditConfirmModal',
                    state: 'show',
                    content: [
                        m("p", 'Изменения будет невозможно отменить!'),
                        m("p", 'Вы уверены, что хотите внести изменения для записей('+ (_updateType === 'keys' ? keys.length : totalRows) + ')?'),
                    ],
                    isStatic: false,
                    header: 'Предупреждение!',
                    isFooter: true,
                    isFullScreen: false,
                    modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                    zIndex: 1005,
                    confirmBtn: 'Ок',
                    confirmBtnClass: 'btn-success',
                    cancelBtn: 'Отмена',
                    onCancel: function(){
                        _confirmModal = '';
                    },
                    onConfirm: function(){
                        _confirmModal = '';
                        _state = 'saving';
                        save();
                    }
                });
            }
        }else{
            _confirmModal = new Modal({
                id: 'groupEditConfirmModal',
                state: 'show',
                header: [
                    'Ошибка'
                ],
                content: [
                    'Выберите поля для изменения данных'
                ],
                isStatic: false,
                isFooter: true,
                isFullScreen: false,
                modalSizeParams: {width: '40%', height: false, padding: '5% 0 5% 0'},
                zIndex: '1005',
                confirmBtn: t('okBtn', 'App'),
                cancelBtn: 'none',
                onConfirm: function () {
                    _confirmModal = '';
                }
            })
        }
    }

    ///////////////////////////
    //      VIES PARTS       //
    ///////////////////////////

    function datePicker(el){
        $(el).datepicker({
            format: 'dd-mm-yyyy',
            language: Globals.getLangApp()
        });
    }
    
    function buildDefaultField(){
        return m("div", {class: "m-multi-edit__field-item clearfix"}, [
            m("div", {class: "m-multi-edit__field-select-container form-group"},
                m("select", {class: "form-control m-multi-edit__field-select", key: _redrawCount, onchange: fieldTypeChanged}, [
                    m("option", {disabled: true, selected: true, value: "hint"}, 'Выберите поле для редактирования'),
                    _editableFields.map(function (field) {
                        if(_fieldsInUse.indexOf(field.id) === -1){
                            return m("option", {value: field.id}, field.title)
                        }
                    })
                ])
            )
        ])
    }

    function buildFieldByType(fieldObject, index){
        // create numeric or text field
        if ((fieldObject.type === "NUM" && fieldObject.group === "NUM") ||
            (fieldObject.type === "INT" && fieldObject.group === "INT") ||
            (fieldObject.type === "TEXT" && fieldObject.group === "TEXT") ||
            (fieldObject.type === "TEL" && fieldObject.group === "TEL")){
            return buildTextField(fieldObject, index);
        }

        // create textarea field
        if ((fieldObject.type === "TEXT") && (fieldObject.group === "AREA")){
            return buildTextAreaField(fieldObject, index);
        }

        // create checkbox field
        if ((fieldObject.type === "CHK") && (fieldObject.group === "CHK")){
            return buildCheckBoxField(fieldObject, index);
        }

        // create datepicker field
        if ((fieldObject.type === "DATE") && (fieldObject.group === "DATE")){
            return buildDateField(fieldObject, index);
        }

        // create datepicker field
        if ((fieldObject.type === "DATE") && (fieldObject.group === "SNGL")){
            return buildDateField(fieldObject, index);
        }

        // create basic dropdown
        if ((fieldObject.type === "LIST") && (fieldObject.group === "LIST")){
            checkForDropdown(fieldObject);

            return buildSelectField(fieldObject, index);
        }

        if ((fieldObject.type === "GRID") && (fieldObject.group === "ADR")){
            return buildGridPickerField(fieldObject, index);
        }

        if (fieldObject.type === "LIST" && fieldObject.group === "SAL"){
            return 'Unable edit field for multiple rows';
        }

        if ((fieldObject.type == "GRID") && (fieldObject.group == "GRD")){
            return buildGridPickerField(fieldObject, index);
        }

        if (fieldObject.type === "GRID" && fieldObject.group === "MUL"){
            return 'Unable edit field for multiple rows';
        }

        if (fieldObject.type === "GRID" && fieldObject.group === "FIL"){
            return 'Unable edit field for multiple rows';
        }

        if ((fieldObject.type === "IMG") && (fieldObject.group === "IMG")){
            return buildImageField(fieldObject, index);
        }

        if (fieldObject.type === "MAP" && fieldObject.group === "MAP"){
            return 'Unable edit field for multiple rows';
        }
    }

    function buildTextField(fieldObject, index){
        return m("input", {class: "form-control", value: (fieldObject.value ? fieldObject.value : ''), "data-index": index, onchange: changeFieldValue})
    }

    function buildTextAreaField(fieldObject, index){
        return m("textarea", {class: "form-control", rows: 3, "data-index": index, onchange: changeFieldValue}, (fieldObject.value ? fieldObject.value : ''))
    }

    function buildCheckBoxField(fieldObject, index){
        return m("input", {type: "checkbox", class: "form-control", checked: fieldObject.value, "data-index": index, onchange: changeFieldValue})
    }

    function buildDateField(fieldObject, index){
        return m("div", {class: "inner-addon right-addon"}, [
            m("i", {class: "glyphicon glyphicon-calendar"}),
            m("input", {type: "text", class: "form-control filter-value__text", value: fieldObject.value ? fieldObject.value : '', config: datePicker, "data-index": index, onchange: changeFieldValue})
        ])
    }

    function buildSelectField(fieldObject, index){
        if(_dropdownArrays.hasOwnProperty(fieldObject.dropDownView)){
            return m("select", {class: "form-control", "data-index": index, onchange: changeFieldValue}, [
                m("option", {value: "hint", selected: true, disabled: true}, 'Выберите значение'),
                m("option", {value: false}, 'Нет значения'),
                _dropdownArrays[fieldObject.dropDownView].map(function(optionObject){
                    return m("option", {value: optionObject.code, selected: (fieldObject.value === optionObject.code)}, optionObject.name)
                })
            ])
        }else{
            return m("div", {class: "filter-loading"}, [
                "Загрузка данных для списка",
                m("img", {src: "dist/assets/images/loading.gif"})
            ])
        }
    }

    function buildGridPickerField(fieldObject, index){
        var fieldValue = fieldObject.valueTitle;
        if(!fieldValue){
            fieldValue = 'Выберите значение (по умолчанию NULL)';
        }
        return m("button", {class: "btn btn-link", "data-index": index ,onclick: loadGridPicker}, fieldValue);
    }

    function buildImageField(fieldObject, index){
        var imgUrl = false;
        if(fieldObject.value){
            imgUrl = Config.serverAddress + Config.rootFolder + 'photo/'+viewName+'/'+fieldObject.value;
        }
        return m.component(new ImageUploadComponent(), {
            id: fieldObject.name+"-IMG",
            allowsExtensions: "image/*",
            folder: viewName,
            imgUrl: imgUrl,
            imgName: fieldObject.value,
            isEditable: true,
            afterUpload: function(value){
                fieldObject.value = value;
            }
        });
    }

    function buildCard(){
        return m("div", {class: "m-multi-edit__card"}, [
            _fieldsToUpdate.map(function(fieldObject, index){
                return m("div", {class: "m-multi-edit__field-item clearfix "+(fieldObject.isError ? 'bg-danger has-error' : '')}, [
                    m("div", {class: "m-multi-edit__field-select-container form-group"},
                        m("input", {type: "text", class: "form-control", disabled: true, value: fieldObject.title + (fieldObject.isRequired ? '*' : '')})
                    ),
                    m("div", {class: "m-multi-edit__field-value-container form-group"},
                        buildFieldByType(fieldObject, index)
                    ),
                    m("a", {class: "m-multi-edit__remove-item", 'data-index': index, onclick: removeField}, '×')
                ])
            }),
            buildDefaultField()
        ])
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        Helper.getData(columnsLoaded, {"context": this, "module": "Group edit module", "function": "controller"},
            '*',
            'VIEW_ISC_USER_FILTER',
            "WHERE TABLE_NAME = '" + viewName + "' AND URF_USR_CODE = " + Globals.getUserData()['USR_CODE']  + " AND URF_FIELD_ACCESS = 2", "FIL_SHOW_ORDER ASC");
    }

    function view(){
        switch(_state){
            case 'hidden':
                return m("div", {class: "m-group-edit hidden"}, '');
            break;
            case 'saving':
                return m("div", {class: "m-group-edit"}, [
                    new ModalLoading({header: "Сохранение данных"})
                ]);
                break;
            case 'loading':
                return m("div", {class: "m-group-edit"}, [
                    new ModalLoading({header: "Загрузка данных"})
                ]);
                break;
            case 'default':
                return m("div", {class: "m-group-edit"}, [
                    new Modal({
                        id: 'groupEdit',
                        state: 'show',
                        header: [
                            'Групповое редактирование записей'
                        ],
                        content: [
                            m("div", {class: "m-group-edit__tools-container"}, [
                                m("label", {class: "radio-inline"}, [
                                    m("input", {type: "radio", name: 'updateType', value: 'keys', checked: _updateType === 'keys', onchange: updateTypeChange}),
                                    'Применить к выбранным записям ('+keys.length+')'
                                ]),
                                m("label", {class: "radio-inline"}, [
                                    m("input", {type: "radio", name: 'updateType', value: 'where', checked: _updateType === 'where', onchange: updateTypeChange}),
                                    'Применить ко всей выборке ('+totalRows+')'
                                ])
                            ]),
                            buildCard(),
                            _errorsOnSave.length ? m("div", {class: "m-group-edit__error-message bg-danger"}, [
                                _errorsOnSave.map(function(error){
                                    return m("p", error)
                                })
                            ]): '',
                            _Grid
                        ],
                        isStatic: false,
                        isFooter: true,
                        isFullScreen: false,
                        modalSizeParams: {width: '60%', height: false, padding: '5% 0 5% 0'},
                        zIndex: '1005',
                        confirmBtn: t('saveBtn', 'App'),
                        confirmBtnClass: 'btn-success',
                        onConfirm: trySave,
                        onCancel: function(){
                            onClose();
                            _state = 'hidden';
                        }
                    }),
                    _confirmModal
                ])
            break;
            case 'success':
                return m("div", {class: "m-group-edit"}, [
                    new Modal({
                        id: 'groupEditSuccess',
                        state: 'show',
                        header: [
                            'Групповое редактирование записей'
                        ],
                        content: [
                            'Изменения успешно сохранены!'
                        ],
                        isStatic: false,
                        isFooter: true,
                        isFullScreen: false,
                        modalSizeParams: {width: '40%', height: false, padding: '5% 0 5% 0'},
                        zIndex: '1005',
                        confirmBtn: t('okBtn', 'App'),
                        cancelBtn: 'none',
                        onConfirm: function () {_state = 'hidden';},
                        onCancel: function () {_state = 'hidden';}
                    })
                ]);
                break;
            case 'error':
                return m("div", {class: "m-group-edit"}, [
                    new Modal({
                        id: 'groupEdit',
                        state: 'show',
                        header: [
                            'Групповое редактирование записей'
                        ],
                        content: [
                            _errors.map(function(error){
                                return m("p", {class: "db-danger"}, error)
                            })
                        ],
                        isStatic: false,
                        isFooter: true,
                        isFullScreen: false,
                        modalSizeParams: {width: '60%', height: false, padding: '5% 0 5% 0'},
                        zIndex: '1005',
                        confirmBtn: t('saveBtn', 'App'),
                        confirmBtnClass: 'btn-success',
                        onConfirm: null,
                        onCancel: function(){_state = 'hidden';}
                    })

                ]);
            break;
        }
    }

    return{
        controller: controller,
        view: view
    }
};