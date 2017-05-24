'use strict';
var m = require('mithril');
var MenuModule = require('../../modules/core/menu/menu.js')();
var TopMenuModule = require('../../modules/core/top-menu/top-menu.js')();
var FileProcessModule = require('../../modules/sapsan/file-process/main.js');
module.exports = {
    controller: function () {
        Globals.isAuth();
        var menuModule = Object.create(MenuModule);
        var topMenuModule = Object.create(TopMenuModule);
        return {
            menu: menuModule,
            topMenuModule: topMenuModule,
            upload: function () {
			var fileProcessModule = new FileProcessModule;
                fileProcessModule.init();
                //FILE_PROCESS_MODULE.toStep2();
            }
        }
    },
    view: function (ctrl) {
        return m("div", {class: "page-file-process"},[
            m("header", [
                m("div", {class: "header__top-menu"}, [
                    m.component(ctrl.topMenuModule)
                ]),
                m("div", {class: "header__main-menu"},
                    m.component(ctrl.menu)
                )
            ]),
            m("div", {class: "file-process_content", config: ctrl.upload},[
                m("div", {class: "b-file-loader"},
                    m("div", {class: "file-loader__top-menu component-container clearfix"}, [
                        m("div", {class: "step-container"}, [
                            //m("button", {type: "button", class: "btn btn-sm btn-link step-link active", id: "step1Btn"}, "Подготовка данных"),
                            //m("span", {class: "step-divider"}, " > "),
                            m("button", {type: "button", class: "btn btn-sm btn-link step-link", id: "step2Btn", disabled: "disabled"}, t('fileUploadMenuLink', 'FileProcessPage')),
                            m("span", {class: "step-divider"}, " > "),
                            m("button", {type: "button", class: "btn btn-sm btn-link step-link", id: "step3Btn", disabled: "disabled"}, t('fileProcessMenuLink', 'FileProcessPage'))
                        ]),
                        m("div", {class: "file-loader__system-buttons-container", id: "systemButtonsContainer"}, "")
                    ]),
                    //FIRST STEP
                    //m("div", {class: "b-first-step"},
                    //    m("div", {class: "first-step__help-content"},
                    //        m("div", {class: "b-help-info"},
                    //            m("div", {class: "help-info"},'Файлы, которые будут загружены в систему, распакуйте в новую папку.'),
                    //            m("div", {class: "help-info"}, m.trust('Скачайте файл <a href="prepare.xls" download="подготовка.xls" target="_blank" id="prepareFileLink">подготовка.xls</a> в созданную папку.')),
                    //            m("div", {class: "help-info"},'Откройте файл "подготовка.xls" и разрешите запуск макросов.'),
                    //            m("div", {class: "help-info"},'После окончания обработки в папке с распакованными файлами будет создан каталог "обработаны".'),
                    //            m("div", {class: "help-info"},'Файлы из папки "обработаны" готовы к загрузке и имеют постфикс "readytoload".'),
                    //            m("div", {class: "help-info"},'На втором шаге загрузите файлы с постфиксом "readytoload".')
                    //        )
                    //    )
                    //),
                    //END OF FIRST STEP

                    //SECOND STEP
                    m("div", {class: "b-second-step component-container"}, [
                        m("div", {class: "second-step__file-input-container", id: "uploadFormContainer"},
                            m("form", {class: "second-step__upload-form", id: "uploadFilesForm"},
                                m("div", {class: "second-step__file-input-wrapper"}, [
                                    m("span", {class: "second-step__file-input-label", id: "fileInputText"}, t('fileInputLabel', 'FileProcessPage')),
                                    m("input", {type: "file", id: "loadFileInput", class: "second-step__file-input", accept: ".xls,.xlsx", multiple: true}, "")
                                ])
                            )
                        ),

                        m("div", {class: "second-step__file-list-container", id: "fileListContainer"},
                            m("table", {class: "table table-bordered table-striped file-list-table", id: "fileListTable"}, [
                                m("thead",
                                    m("tr", [
                                        m("th", {class: "file-list-table__column_header_number"}, "#"),
                                        m("th", {class: "file-list-table__column_header_file"}, t('fileTableFileColumn', 'FileProcessPage')),
                                        m("th", {class: "file-list-table__column_header_file-size"}, t('fileTableSizeColumn', 'FileProcessPage')),
                                        m("th", {class: "file-list-table__column_header_status"}, t('fileTableStatusColumn', 'FileProcessPage'))
                                    ])
                                ),
                                m("tbody", "")
                            ])
                        )
                    ]),
                    //END OF SECOND STEP

                    //THIRD STEP
                    m("div", {class: "b-third-step component-container"}, [
                        m("div", {class: "third-step__file-list-table"},
                            m("table", {class: "table table-bordered table-striped process-file-list-table", id: "processFileListTable"}, [
                                m("thead",
                                    m("tr", [
                                        m("th", {class: "process-table__column_file-name"}, t('processTableFileColumn', 'FileProcessPage')),
                                        m("th", {class: "process-table__column_region"}, t('processTableRegionColumn', 'FileProcessPage')),
                                        m("th", {class: "process-table__column_count"}, t('processTableCountColumn', 'FileProcessPage')),
                                        m("th", {class: "process-table__column_first-day"}, t('processTableFirstDayColumn', 'FileProcessPage')),
                                        m("th", {class: "process-table__column_last-day"}, t('processTableLastDayColumn', 'FileProcessPage')),
                                        m("th", {class: "process-table__column_progress"}, t('processTableProgressColumn', 'FileProcessPage')),
                                        m("th", {class: "process-table__column_status"}, t('processTableStatusColumn', 'FileProcessPage'))
                                    ])
                                ),
                                m("tbody", "")
                            ])
                        ),
                        m("div", {class: "third-step__b-log", id: "logBlock"},
                            m("div", {class: "log__container", id: "logContainer"}, "")
                        )
                    ])
                    //END OF THIRD STEP
                ),
                //END OF MAIN WINDOW

                //MODAL WINDOWS
                //load files to server confirm window
                m("div", {class: "modal fade second-step__modal-window", id: "secondStepModal", tabindex: "-1", role: "dialog"},
                    m("div", {class: "modal-dialog"},
                        m("div", {class: "modal-content"}, [
                            m("div", {class: "modal-header"}, [
                                m("button", {type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"}, m.trust("&times;")),
                                m("h4", {class: "modal-title"}, t('confirmModalHeader', 'FileProcessPage'))
                            ]),
                            m("div", {class: "modal-body"},
                                m("p", t('confirmModalBodyMsg', 'FileProcessPage'))
                            ),
                            m("div", {class: "modal-footer"}, [
                                m("button", {type: "button", class: "btn btn-sm btn-default system-btn_white", "data-dismiss":"modal"}, t('cancelBtn', 'App')),
                                m("button", {type: "button", class: "btn btn-sm btn-default system-button_blue", id:"secondStepModalConfirmBtn"}, t('confirmModalConfirmBtn', 'FileProcessPage')),
                            ])
                        ])
                    )
                ),
                //info modal
                m("div", {class: "modal fade b-info-modal", id: "infoModal", tabindex: "-1", role: "dialog"},
                    m("div", {class: "modal-dialog"},
                        m("div", {class: "modal-content"}, [
                            m("div", {class: "modal-header"}, [
                                m("button", {type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"}, m.trust("&times;")),
                                m("h4", {class: "modal-title", id: "infoModalHeader"}, "")
                            ]),
                            m("div", {class: "modal-body", id: "infoModalBody"},""),
                            m("div", {class: "modal-footer"}, [
                                m("button", {type: "button", class: "btn btn-sm btn-default system-btn_white", "data-dismiss":"modal"}, t('okBtn', 'App')),
                            ])
                        ])
                    )
                )

            ])
            // END OF PROCESS FILE CONTENT
        ]);
    }
}
