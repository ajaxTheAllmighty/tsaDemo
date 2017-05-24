'use strict';
var m = require('mithril');
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function (config) {
    var state = 'default';
    var reportCode;
    var reportName;
    var onUpload = null;
    var zIndex = config.zIndex || 1005;

    var _file;
    var _comment = m.prop('');
    var _errors = [];

    function tryUpload(){
        _errors = [];
        if(typeof _file == 'undefined'){
            _errors.push('Не выбран шаблон отчета для загрузки.');
        }

        if(_comment().trim() == ''){
            _errors.push('Не заполнено обязательное поле "Комментарий".');
        }

        if(_errors.length == 0){
            uploadReport();
        }
    }

    function uploadReport(){
        $('#uploadReportModal').modal({
            backdrop: 'static',
            keyboard: false
        });

        var formData = new FormData();
        formData.append("file", _file);
        //formData.append("code", reportCode);
        //formData.append("use_code", Globals.getUserData()['USE_CODE']);
        //formData.append("comment", _comment());
        $.ajax({
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        document.getElementById('reportUploadStatus').innerHTML = '('+percentComplete+"%)";
                    }
                }, false);
                xhr.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        document.getElementById('reportUploadStatus').innerHTML = '('+percentComplete+"%)";
                    }
                }, false);
                return xhr;
            },
            //url: "/FileImporter/fileUploaderReports",
            url: "/FileImporter/fileUploaderReports?code="+reportCode+'&use_code='+Globals.getUserData()['USE_CODE']+'&comment='+_comment(),
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            //contentType:"multipart/form-data;charset=UTF-8",
            success: function (res) {
                var result = JSON.parse(res);
                if(result.status == 'OK'){
                    $('#uploadReportModal').modal('hide');
                    state = 'loaded';
                    m.redraw();
                }else{
                    $('#uploadReportModal').modal('hide');
                    state = 'error';
                    m.redraw();
                }
            },
            error: function(res){
                $('#uploadReportModal').modal('hide');
                state = 'error';
                m.redraw();
            }
        });
    }

    function changeFile(){
        _file = this.files[0];
    }

    function load(config){
        state = 'opened';
        reportCode = config.reportCode;
        reportName = config.reportName;
        onUpload = config.onUpload || null;
        m.redraw();
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
    }

    function view(){
        console.log(state);
        switch(state){
            case 'default':
                return m("div", {class: "b-report-history_default"});
            break;
            case 'opened':
                return new Modal({
                    id: 'reportHistoryModal',
                    state: 'show',
                    header: "Загрузка новой версии отчета",
                    content: [
                        m("table", {class: "table"}, [
                            m("tr", {class: "card-table__row"}, [
                                m("td", {class: "card-table__label-column"}, 'Файл *'),
                                m("td", {class: "card-table__value-column"},
                                    m("label", {class: "btn btn-link btn-file"}, [
                                        (typeof _file != 'undefined' ? _file.name : 'Выбрать'),
                                        m("span", {id: "reportUploadStatus"}),
                                        m("input", {type: "file", style: "display: none;", accept: ".xlsm", onchange: changeFile})
                                    ])
                                ),
                            ]),
                            m("tr", {class: "card-table__row"}, [
                                m("td", {class: "card-table__label-column"}, 'Комментарий *'),
                                m("td", {class: "card-table__value-column"},
                                    m("textarea", {class: "form-control", rows: "3", oninput: m.withAttr("value", _comment), value: _comment()})
                                ),
                            ]),
                        ]),
                        (_errors.length > 0 ?
                                m("div", {class: "bg-danger b-upload-report__error-container"}, [
                                    _errors.map(function(error){
                                        return m("p", {}, error);
                                    })
                                ]) : ''
                        )
                    ],
                    isStatic: false,
                    isFooter: true,
                    isFullScreen: false,
                    modalSizeParams: {width: '60%', height: false, padding: '5% 0 5% 0'},
                    zIndex: zIndex,
                    confirmBtn: 'Загрузить',
                    onConfirm: tryUpload,
                    onCancel: function(){state = 'default';}
                });
            break;
            case 'error':
                return new Modal({
                    id: 'reportHistoryModal',
                    state: 'show',
                    header: "Загрузка новой версии отчета",
                    content: [
                        m("p", {}, 'Произошла ошибка при загрузке файла шаблона!'),
                        m("p", {}, 'Обратитесь к администратору системы.'),
                    ],
                    isStatic: false,
                    isFooter: false,
                    isFullScreen: false,
                    modalSizeParams: {width: '60%', height: false, padding: '5% 0 5% 0'},
                    zIndex: zIndex,
                    //confirmBtn: t('saveBtn', 'App'),
                    //onConfirm: saveCard,
                    onCancel: function(){state = 'default';}
                });

                break;
            case 'loaded':
                return new Modal({
                    id: 'reportHistoryModal',
                    state: 'show',
                    header: "Загрузка новой версии отчета",
                    content: [
                        m("p", {}, 'Шаблон отчета успешно загружен.'),
                    ],
                    isStatic: false,
                    isFooter: true,
                    isFullScreen: false,
                    modalSizeParams: {width: '60%', height: false, padding: '5% 0 5% 0'},
                    zIndex: zIndex,
                    confirmBtn: t('okBtn', 'App'),
                    onConfirm: function(){state = 'default';},
                    cancelBtn: 'none',
                    //onCancel: function(){state = 'default';}
                });
                break;
        }
    }

    return{
        load: load,
        controller: controller,
        view: view
    }
};