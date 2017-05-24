'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
module.exports = function () {
    var _state = 'default';
    var _filesList = {};
    var _filesToUpload = 0;
    var _filesUploaded = 0;
    var _isUploading = false;
    var _results = [];
    var _processCheckTimer;
    var _errorMessage = '';

    function fileChanged(){
        _state = 'default';
        if(this.files.length > 0){
            _state = 'list';
            _filesToUpload = this.files.length;
            for (var i = 0; i < this.files.length; i++) {
                var fileId = 'file-'+i;
                _filesList[fileId] = {number: i+1, id: fileId, file: this.files[i], status: 'Ожидает загрузки'};
            }
        }
    }

    function clearUploadFolder(){
        $.ajax({
            cache: false,
            url: "/FileImporter/fileUploaderRoutes?operation=clear",
            type: "GET",
            processData: false,
            contentType: false,
            success: function (res) {
                var result = JSON.parse(res);
                if(result.status == 'ok'){
                    startUpload();
                }else{
                    console.log('fatal error! Can not clear upload folder!');
                    _state = 'error';
                    _errorMessage = 'Невозможно очистить директорию для загрузки файлов!';
                    m.redraw();
                }
            },
            error: function(){
                console.log('fatal error! Unable do request to clean upload folder!');
                _state = 'error';
                _errorMessage = 'Ошибка запроса на очиститку директории для загрузки файлов!';
                m.redraw();
            }
        });
    }

    function startUpload(){
        _isUploading = true;
        for (var fileId in _filesList) {
            uploadFile(fileId);
        }
    }

    function uploadFile(fileId){
        var formData = new FormData();
        formData.append("file", _filesList[fileId].file);
        $.ajax({
            cache: false,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        if(percentComplete == 100){
                            document.getElementById(fileId).innerHTML = 'Загружен';
                        }else{
                            document.getElementById(fileId).innerHTML = 'Загружается ('+percentComplete+"%)";
                        }
                    }
                }, false);
                xhr.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        if(percentComplete == 100){
                            document.getElementById(fileId).innerHTML = 'Загружен';
                        }else{
                            document.getElementById(fileId).innerHTML = 'Загружается ('+percentComplete+"%)";
                        }
                    }
                }, false);
                return xhr;
            },
            url: "/FileImporter/fileUploaderRoutes?file_id="+_filesList[fileId].id+"&file_name="+_filesList[fileId].name,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                var result = JSON.parse(res);
                if(result.status == 'OK'){
                    document.getElementById(fileId).innerHTML = 'Обработан';
                }else{
                    document.getElementById(fileId).innerHTML = 'Ошибка обработки';
                    _filesList[fileId].status = 'error';
                }
                _filesUploaded++;
                if(_filesUploaded == _filesToUpload){
                    startProcess();
                }
            }
        });
    }

    function startProcess(){
        $.ajax({
            cache: false,
            url: "/FileImporter/fileUploaderRoutes?operation=register&time="+new Date().getTime(),
            type: "GET",
            processData: false,
            contentType: false,
            success: function (res) {
                console.log(res);
            }
        });
        _processCheckTimer = setInterval(checkProcessStatus, 1000);
        _state = 'processLoading';
        m.redraw();
    }

    function checkProcessStatus(){
        $.ajax({
            cache: false,
            url: "/FileImporter/fileUploaderRoutes?operation=checkFinish",
            type: "GET",
            processData: false,
            contentType: false,
            success: function (res) {
                try{
                    var result = JSON.parse(res);
                    if(result.status == 'OK'){
                        clearInterval(_processCheckTimer);
                        loadResult();
                    }else if(result.status == 'ERROR'){
                        clearInterval(_processCheckTimer);
                        $('#processRouteImportLoading').modal('hide');
                        _state = 'error';
                        m.redraw();
                    }
                }catch(e){
                    console.log('PROCESS ERROR');
                    console.log(res);
                }
            }
        });
    }

    function loadResult(){
        Helper.getData(showResult, {"context": this, "module": "RoutesUploadModule", "function": "loadResult"}, '*', 'VIEW_AT_IMPORT_ROUTE_HEADER', "WHERE 1=1");
    }

    function showResult(data){
        $('#processRouteImportLoading').modal('hide');
        _state = 'result';
        _results = data;
        m.redraw();
    }

    function toDefaultState(){
        _state = 'default';
        _filesList = {};
        _filesToUpload = 0;
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {

    }

    function view() {
        switch(_state){
            case 'default':
                return m("div", {class: "b-routes-upload"},
                    m("div", {class: "b-routes-upload__top-menu component-container clearfix"}, [
                        m("div", {class: "b-routes-upload__step-container"}, [
                            m("button", {type: "button", class: "btn btn-sm btn-link step-link active"}, 'Загрузка файлов'),
                            m("span", {class: "step-divider"}, " > "),
                            m("button", {type: "button", class: "btn btn-sm btn-link step-link", disabled: "disabled"}, 'Обработка файлов'),
                            m("span", {class: "step-divider"}, " > "),
                            m("button", {type: "button", class: "btn btn-sm btn-link step-link", disabled: "disabled"}, 'Результаты обработки')
                        ]),
                    ]),
                    m("form", {class: "b-routes-upload__upload-form component-container"},
                        m("div", {class: "b-routes-upload__file-input-wrapper"}, [
                            m("span", {class: "b-routes-upload__file-input-label"}, t('fileInputLabel', 'RoutesUploadModule')),
                            m("input", {class: "b-routes-upload__file-input", type: "file", accept: ".xml", multiple: true, onchange: fileChanged}, "")
                        ])
                    )
                )
            break;
            case 'list':
                return m("div", {class: "b-routes-upload"},[
                    m("div", {class: "b-routes-upload__top-menu component-container clearfix"}, [
                        m("div", {class: "b-routes-upload__step-container"}, [
                            m("button", {type: "button", class: "btn btn-sm btn-link step-link", onclick: (_isUploading ? null : toDefaultState), disabled: (_isUploading ? 'disabled' : '')}, 'Загрузка файлов'),
                            m("span", {class: "step-divider"}, " > "),
                            m("button", {type: "button", class: "btn btn-sm btn-link step-link active", disabled: "disabled"}, 'Обработка файлов'),
                            m("span", {class: "step-divider"}, " > "),
                            m("button", {type: "button", class: "btn btn-sm btn-link step-link", disabled: "disabled"}, 'Результаты обработки')
                        ]),
                        m("div", {class: "b-routes-upload__system-buttons-container"}, [
                            m("button", {class: "btn btn-system btn-system-cancel routes-upload__cancel-btn", disabled: (_isUploading ? 'disabled' : ''), onclick: toDefaultState}, 'Отмена'),
                            m("button", {class: "btn btn-system btn-system-primary", disabled: (_isUploading ? 'disabled' : ''), onclick: clearUploadFolder}, 'Загрузить'),
                        ])
                    ]),
                    m("div", {class: "b-routes-upload__file-list-container component-container"},
                        m("table", {class: "table table-bordered table-striped routes-upload__file-list-table"}, [
                            m("thead",
                                m("tr", [
                                    m("th", {class: "routes-upload-table_file-number-column"}, "#"),
                                    m("th", {class: "routes-upload-table_file-column"}, 'Файл'),
                                    m("th", {class: "routes-upload-table_file-size-column"}, 'Размер'),
                                    m("th", {class: "routes-upload-table_file-status-column"}, 'Статус')
                                ])
                            ),
                            m("tbody", [
                                Helper.objectToArray(_filesList).map(function(fileObj, index){
                                    return m("tr", {}, [
                                        m("td", {}, fileObj.number),
                                        m("td", {}, fileObj.file.name),
                                        m("td", {}, Helper.formatBytes(fileObj.file.size, 1)),
                                        m("td", {id: fileObj.id}, fileObj.status)
                                    ])
                                })
                            ])
                        ])
                    )
                ])
            break;
            case 'result':
                var modalConfig = function(){
                    $('#importCompleteModal').modal('show');
                }

                return m("div", {class: "b-routes-upload"},[
                    m("div", {class: "b-routes-upload__top-menu component-container clearfix"}, [
                        m("div", {class: "b-routes-upload__step-container"}, [
                            m("button", {type: "button", class: "btn btn-sm btn-link step-link", disabled: 'disabled'}, 'Загрузка файлов'),
                            m("span", {class: "step-divider"}, " > "),
                            m("button", {type: "button", class: "btn btn-sm btn-link step-link", disabled: "disabled"}, 'Обработка файлов'),
                            m("span", {class: "step-divider"}, " > "),
                            m("button", {type: "button", class: "btn btn-sm btn-link step-link active", disabled: "disabled"}, 'Результаты обработки')
                        ]),
                    ]),
                    m("div", {class: "b-routes-upload__file-list-container component-container"},
                        m("table", {class: "table table-bordered table-striped routes-upload__file-list-table"}, [
                            m("thead",
                                m("tr", [
                                    m("th", {}, 'Файл'),
                                    m("th", {}, 'Город'),
                                    m("th", {}, 'Количество ТП'),
                                    m("th", {}, 'Количество дней'),
                                    m("th", {}, 'Даты'),
                                    m("th", {}, 'Статус')
                                ])
                            ),
                            m("tbody", [
                                _results.map(function(fileObj, index){
                                    return m("tr", {}, [
                                        m("td", {}, fileObj['IRH_FILENAME']),
                                        m("td", {}, fileObj['IRH_REGION']),
                                        m("td", {}, fileObj['IRH_USER_COUNT']),
                                        m("td", {}, fileObj['IRH_DAY_COUNT']),
                                        m("td", {}, fileObj['IRH_DATES']),
                                        m("td", {}, fileObj['IRH_STATUS']),
                                    ])
                                })
                            ])
                        ])
                    ),
                    m("div", {class: "modal fade route-upload-modal", id: "importCompleteModal", tabindex: "-1", role: "dialog", config: modalConfig},
                        m("div", {class: "modal-dialog route-upload-modal__dialog"},
                            m("div", {class: "modal-content"}, [
                                m("div", {class: "modal-header"}, [
                                    m("button", {type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"}, m.trust("&times;")),
                                    m("h4", {class: "modal-title"}, "Импорт завершен")
                                ]),
                                m("div", {class: "modal-body route-upload-modal__body"},[
                                    m("p", {}, 'Импорт маршрутов успешно завершен!')
                                ]),
                                m("div", {class: "modal-footer"}, [
                                    m("button", {type: "button", class: "btn btn-system btn-system-primary", "data-dismiss":"modal"}, 'Ok'),
                                ])
                            ])
                        )
                    )
                ])
                break;
            case 'processLoading':
                var modalConfig = function(){
                    $('#processRouteImportLoading').modal('show');
                }
                return m("div", {
                        class: "modal fade grid-loading-modal",
                        id: "processRouteImportLoading",
                        tabindex: "-1",
                        role: "dialog",
                        config: modalConfig,
                        "data-backdrop": "static",
                        "data-keyboard": "false"
                    },
                    m("div", {class: "modal-dialog grid-loading-modal__window", role: "document"},
                        m("div", {class: "modal-content"}, [
                            m("div", {class: "modal-header"},
                                m("h4", {class: "modal-title grid-loading-modal__header"}, 'Импорт маршрутов')
                            ),
                            m("div", {class: "modal-body modal-title grid-loading-modal__body"}, [
                                m("img", {
                                    class: "grid-loading-modal__body--loader",
                                    src: "dist/assets/images/loading.gif"
                                }),
                                m.trust("Обработка импортируемых данных"),
                            ])
                        ])
                    )
                );
            break;
            default:
                return m("div", {class: "b-routes-upload"},
                    m("form", {class: "b-routes-upload__upload-form"},
                        m("div", {class: "b-routes-upload__file-input-wrapper"}, [
                            m("span", {class: "b-routes-upload__file-input-label"}, t('fileInputLabel', 'ShipmentProcessModule')),
                            m("input", {class: "b-routes-upload__file-input", type: "file", accept: ".xml", onchange: fileChanged}, "")
                        ])
                    )
                )
            break;
        }
    }

    return{
        controller: controller,
        view: view
    }
};