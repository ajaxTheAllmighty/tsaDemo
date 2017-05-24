'use strict';
var m = require('mithril');
var Helper = require('../../../../components/helper.js')();
var Modal = require('../../../../components/modal-window/modal-window.js');
module.exports = function (config) {
    var salepoint = m.prop(config.salepoint || false);
    var year = m.prop(config.year || false);
    var month = m.prop(config.month || false);

    var _GridPicker = '';
    var _InfoModal = '';
    var _state = 'default';
    var _monthArray = {
        1:  t('jan', 'App'),
        2:  t('feb', 'App'),
        3:  t('mar', 'App'),
        4:  t('apr', 'App'),
        5:  t('may', 'App'),
        6:  t('jun', 'App'),
        7:  t('jul', 'App'),
        8:  t('aug', 'App'),
        9:  t('sen', 'App'),
        10: t('oct', 'App'),
        11: t('nov', 'App'),
        12: t('dec', 'App')
    };
    var _yearArray = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
    var _allProgram = [];
    var _needSave = m.prop(false);
    var _saveErrors = [];
    var Model = {
        salepointProgram: [],
        programCodes: [],
        programDetailsCodes: [],
        removedPrograms: {},

        orderedPrograms: [],
        newOrderedArray: [],
        assocProgramList: {},
        addProgram: function(program, index){
            if(program['SPD_CHILD_PROG_SPD_CODE'] === null){
                program['SPD_CHILD_PROG_SPD_CODE'] = false;
            }
            if(typeof index === 'undefined'){
                this.salepointProgram.push(program);
            }else{
                this.salepointProgram.splice(index, 0, program);
            }
            this.programCodes.push(program['SPD_SAP_CODE']);
            this.programDetailsCodes.push(program['SPD_CODE']);
        },
        updateProgram: function (program, index) {
            this.salepointProgram[index] = program;
        },
        removeProgram: function(index){
            var progIndex = this.programCodes.indexOf(this.salepointProgram[index]['SPD_SAP_CODE']);
            var progDetailIndex = this.programDetailsCodes.indexOf(this.salepointProgram[index]['SPD_CODE']);
            var progDetailCode = this.salepointProgram[index]['SPD_CODE'];
            Helper.execQuery(null,  {"context": this, "module": "Program manage module", "function": "removeOldPrograms"}, "DELETE FROM ST_SALE_PROGRAM_DETAIL WHERE SPD_CODE = " + progDetailCode);

            //set parent program to default if exist
            this.salepointProgram.map(function(program) {
                if(program['SPD_CHILD_PROG_SPD_CODE'] == progDetailCode){
                    program['SPD_CHILD_PROG_SPD_CODE'] = false;
                    program['SPD_SAL_LIMIT'] = false;
                }
            })

            if(progIndex !== -1){
                this.programCodes.splice(progIndex, 1);
            }
            if(progDetailIndex !== -1){
                this.programDetailsCodes.splice(progDetailIndex, 1);
            }
            this.salepointProgram.splice(index, 1);
        },
        clearAll: function(){
            this.salepointProgram = [];
            this.programCodes = [];
            this.programDetailsCodes = [];
            this.removedPrograms = [];
        },
        setMainProgram: function (mainIndex) {
            this.salepointProgram.map(function(program, index) {
                if(mainIndex != index){
                    program['SPD_IS_MAIN'] = 0;
                }else{
                    program['SPD_IS_MAIN'] = 1;
                }
            })

            Array.prototype.move = function (old_index, new_index) {
                if (new_index >= this.length) {
                    var k = new_index - this.length;
                    while ((k--) + 1) {
                        this.push(undefined);
                    }
                }
                this.splice(new_index, 0, this.splice(old_index, 1)[0]);
                return this; // for testing purposes
            };

            this.salepointProgram.move(mainIndex, 0);
        },
        orderProgramList: function(){
            var mainProgram = false;
            var programWithLink = [];
            var programWithoutLink = [];
            var defaultProgram;

            this.salepointProgram.map(function(program, index){
                Model.assocProgramList[program['SPD_CODE']] = program;
                if(program['SPD_IS_MAIN'] == 1){
                    mainProgram = program;
                }else{
                    if(!program['SPD_CHILD_PROG_SPD_CODE'] || program['SPD_CHILD_PROG_SPD_CODE'] === null){
                        if(program['SAP_ID'] === 'default'){
                            defaultProgram = program;
                        }else{
                            programWithoutLink.push(program);
                        }
                    }else{
                        programWithLink.push(program);
                    }
                }
            });

            if(mainProgram){
                this.orderedPrograms = [];
                Model.buildLinkedTree(mainProgram);
            }else{
                console.log('no main program');
            }

        },
        buildLinkedTree: function(program){
            if(this.orderedPrograms.indexOf(program['SPD_CODE']) === -1){
                this.orderedPrograms.push(program['SPD_CODE']);
                var link = program['SPD_CHILD_PROG_SPD_CODE'];
                if(link && link !== 'null'){
                    this.buildLinkedTree(Model.assocProgramList[link]);
                }
            }else{
                console.log('recursion');
            }
        }
    };

    function loadSalepointPrograms(){
        _needSave(false);
        if(salepoint() && year() && month()){
            Helper.getData(salepointProgramsLoaded, {"context": this, "module": "Program manage module", "function": "loadSalepointPrograms"}, '*', 'VIEW_ST_SALE_PROGRAM_DETAIL', "WHERE SAL_CODE = " + salepoint().code + " AND SPD_MONTH_NUMBER = " + month() + ' AND SPD_YEAR = ' + year(), 'SPD_ORDER ASC');
            _state = 'loading';
        }
    }

    function salepointProgramsLoaded(data){
        Model.clearAll();
        var isDefaultProgram = false;
        var isMain = false;
        data.map(function(program, index){
            if(program['SAP_ID'] === 'default'){
                isDefaultProgram = index;
            }
            if(program['SPD_IS_MAIN'] == '1'){
                isMain = index;
            }
        });

        if(isMain !== false){
            Model.addProgram(data[isMain]);
        }

        data.map(function(program, index){
            if(index !== isMain && index !== isDefaultProgram){
                Model.addProgram(program);
            }
        });

        if(isDefaultProgram !== false){
            Model.addProgram(data[isDefaultProgram]);
            _GridPicker = '';
            _state = 'salepoint';
        }else{
            _state = 'error';
            console.log('НЕТ ДЕФОЛТНОЙ ПРОГРАММЫ!!! АААА!!');
        }
        m.redraw();
    }

    function yearChanged(){
        year(parseInt(this.value));
        loadSalepointPrograms();
    }

    function monthChanged(){
        month(this.value);
        loadSalepointPrograms();
    }

    function loadGridPicker(){
        _GridPicker = m.component(new GridModule({
            mode: 'picker',
            allowNew: true,
            onRowClick: function(salePoint){
                Helper.getData(salepointDataLoaded, {"context": this, "module": "Program manage module", "function": "loadGridPicker"}, 'SAL_CODE, SAL_NAME', 'ST_SALEPOINT', "WHERE SAL_CODE = " + salePoint.key);
            },
            gridView: 'VIEW_ST_SALEPOINT',
            perPage: 50,
            staticFilters: {
                '1': {
                    showCustomText: true,
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldTitle: 'Канал 3 INDIRECT',
                    fieldName: "SCH_CODE",
                    filterField: "SCH_CODE",
                    id: "2",
                    isGroupCondition: true,
                    type: "INT",
                    value: 3
                }
            },
            moduleId: Globals.registerModule('grid'),
            isModal: true,
            zIndex: 1005,
            onClose: function(){
                _GridPicker = '';
            },
            modalHeader: 'Выбор клиента'
        }));
    }

    function salepointDataLoaded(data) {
        salepoint({code: data[0]['SAL_CODE'], name: data[0]['SAL_NAME']});
        loadSalepointPrograms();
        m.redraw();
    }

    function removeProgram(){
        var index = this.getAttribute('data-index');
        Model.removeProgram(index);
        _needSave(true);
    }

    var programChangeCount = 0;
    function programToAddChanged(){
        programChangeCount++;
        var programCode = parseInt(this.value);
        Helper.insertData(programAdded, {"context": this, "module": "Program manage module", "function": "addProgram"}, "ST_SALE_PROGRAM_DETAIL", 'SPD_SAP_CODE, SPD_MONTH_NUMBER, SPD_YEAR, SPD_SAL_CODE', programCode+','+month()+','+year()+','+salepoint().code);
    }

    function programAdded(programObj){
        //load program detail
        Helper.getData(programDetailLoaded, {"context": this, "module": "Program manage module", "function": "programAdded"}, '*', 'VIEW_ST_SALE_PROGRAM_DETAIL', "WHERE SPD_CODE = " + programObj.key);
    }

    function programDetailLoaded(data){
        //push program at penultimate position
        Model.addProgram(data[0], Model.salepointProgram.length - 1);
        _needSave(true);
        m.redraw();
    }

    function loadAllPrograms(){
        Helper.getData(allProgramsLoaded, {"context": this, "module": "Program manage module", "function": "controller"}, '*', 'ST_SALE_PROGRAM', "WHERE SAP_IS_ACTIVE = 1");
    }

    function allProgramsLoaded(data){
        _allProgram = data;
        loadSalepointPrograms();
    }

    function childProgramChanged() {
        var index = this.getAttribute('data-index');
        var program = Model.salepointProgram[index];
        program['SPD_CHILD_PROG_SPD_CODE'] = (this.value == 'false' ? false : this.value);
        Model.updateProgram(program, index);
        _needSave(true);
    }

    function programLimitChanged() {
        var index = this.getAttribute('data-index');
        var program = Model.salepointProgram[index];
        var value = this.value.replace(/[^0-9.]/g, "").replace(/^0+/, '');
        program['SPD_SAL_LIMIT'] = value === '' ? false : value;
        Model.updateProgram(program, index);
        _needSave(true);
    }

    function mainProgramChange() {
        var index = this.getAttribute('data-index');
        Model.setMainProgram(index);
        _needSave(true);
    }

    var checkedPrograms = [];
    var isRecursion = false;
    function checkRecursion(program){
        console.log('recursion', program);
        if(checkedPrograms.indexOf(program['SPD_CODE']) === -1){
            var linkProgramCode = program['SPD_CHILD_PROG_SPD_CODE'];
            if(linkProgramCode && linkProgramCode !== null){
                checkRecursion(Model.assocProgramList[linkProgramCode]);
            }
        }else{
            isRecursion = true;
        }
    }

    function trySave(){
        _saveErrors = [];
        var programsWithLinkCount = 0;
        var isMainProgram = false;
        var linkProgramCodes = [];
        var programWithErrors = [];
        Model.salepointProgram.map(function(program, index){
            if(program['SAP_ID'] !== 'default'){
                //check for unique child program
                if((program['SPD_CHILD_PROG_SPD_CODE'] !== null && program['SPD_CHILD_PROG_SPD_CODE']) && linkProgramCodes.indexOf(program['SPD_CHILD_PROG_SPD_CODE']) !== -1){
                    _saveErrors.push('Программа: "'+program['SAP_NAME']+'". Переброс на одну программу в 2х или более позициях.');
                    programWithErrors.push(index);
                }
                linkProgramCodes.push(program['SPD_CHILD_PROG_SPD_CODE']);

                //check for correct limit
                if((program['SPD_CHILD_PROG_SPD_CODE'] && program['SPD_CHILD_PROG_SPD_CODE'] !== null) && (!program['SPD_SAL_LIMIT'] || program['SPD_SAL_LIMIT'] === null || program['SPD_SAL_LIMIT'] === '')){
                    _saveErrors.push('Программа: "'+program['SAP_NAME']+'". Не указан лимит.');
                    programWithErrors.push(index);
                }

                //check for correct link
                if(program['SPD_CHILD_PROG_SPD_CODE'] && Model.programDetailsCodes.indexOf(parseInt(program['SPD_CHILD_PROG_SPD_CODE'])) === -1){
                    _saveErrors.push('Программа: "'+program['SAP_NAME']+'". Переброс на удаленную программу.');
                    programWithErrors.push(index);
                }

                if(program['SPD_CHILD_PROG_SPD_CODE']){
                    programsWithLinkCount++;
                }
                if(program['SPD_IS_MAIN'] == 1){
                    isMainProgram = program['SPD_CODE'];
                }
            }
        })

        if(programsWithLinkCount > 1 && !isMainProgram){
            _saveErrors.push('Не указана основная программа.');
        }

        //check for recursion
        if(isMainProgram){
            isRecursion = false;
            //checkRecursion(Model.assocProgramList[isMainProgram]);
            //if(isRecursion){
            //    _saveErrors.push('В списке программ имеется рекурсия.');
            //}

        }

        if(_saveErrors.length === 0){
            saveSalepointPrograms();
        }
    }

    var programToUpdated = 0;
    var programUpdated = 0;
    function saveSalepointPrograms(){
        programToUpdated = Model.salepointProgram.length;
        programUpdated = 0;
        Model.salepointProgram.map(function(program, index) {
            Helper.updateData(programUpdatedCallback, {"context": this, "module": "Program manage module", "function": "saveSalepointPrograms"},
                'SPD_SAL_LIMIT = '+((program['SPD_SAL_LIMIT'] && program['SPD_SAL_LIMIT'] !== null) ? program['SPD_SAL_LIMIT'] : 'NULL')+
                ', SPD_CHILD_PROG_SPD_CODE = '+((program['SPD_CHILD_PROG_SPD_CODE'] && program['SPD_CHILD_PROG_SPD_CODE'] !== null) ? program['SPD_CHILD_PROG_SPD_CODE'] : 'NULL')+
                ', SPD_IS_MAIN = '+((program['SPD_IS_MAIN'] && program['SPD_IS_MAIN'] !== null) ? program['SPD_IS_MAIN'] : 'NULL')+
                ', SPD_ORDER = '+(index+1),
                'ST_SALE_PROGRAM_DETAIL',
                'SPD_CODE = '+program['SPD_CODE']);
        });
    }

    function programUpdatedCallback(){
        programUpdated++;
        if(programToUpdated === programUpdated){
            _InfoModal = new Modal({
                id: 'm-salepoint-edit-modal',
                state: 'show',
                content: [
                    'Изменения успешно сохранены'
                ],
                isStatic: false,
                header: 'Сохранение программ',
                isFooter: true,
                isFullScreen: false,
                modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                zIndex: 1005,
                confirmBtn: 'Ок',
                cancelBtn: 'none',
                onConfirm: function(){
                    _InfoModal = '';
                }
            })
            m.redraw();
        }
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        loadAllPrograms();
    }

    function view(){
        switch(_state){
            case 'default':
                return m("div", {class: "m-salepoint-edit"}, [
                    m("div", {class: "m-salepoint-edit__tools component-container"}, [
                        m("label", {class: "m-salepoint-edit__choose-salepoint-label"}, 'Клиент: '),
                        m("button", {class: "btn btn-link btn-system-link m-salepoint-edit__choose-salepoint", onclick: loadGridPicker}, salepoint() ?  salepoint().name : 'Выберите клиента'),
                        m("select", {class: "form-control m-salepoint-edit__year-choose", onchange: yearChanged}, [
                            m("option", {selected: true, disabled: true}, 'Выберите год'),
                            _yearArray.map(function(y){
                                return m("option", {value: y, selected:year() === y}, y)
                            })
                        ]),
                        m("select", {class: "form-control m-salepoint-edit__month-choose", onchange: monthChanged}, [
                            m("option", {selected: true, disabled: true}, 'Выберите месяц'),
                            Object.keys(_monthArray).map(function(monthIndex){
                                return m("option", {value: monthIndex, selected: month() === monthIndex}, _monthArray[monthIndex])
                            })
                        ]),
                    ]),
                    _GridPicker
                ]);
                break;
            case 'loading':
                return m("div", {class: "m-salepoint-edit"},
                    new Modal({
                        id: 'm-salepoint-edit-loading-',
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
                        zIndex: 1005
                    })
                );
                break;
            case 'salepoint':
                return m("div", {class: "m-salepoint-edit"}, [
                    m("div", {class: "m-salepoint-edit__tools component-container"}, [
                        m("label", {class: "m-salepoint-edit__choose-salepoint-label"}, 'Клиент: '),
                        m("button", {class: "btn btn-link btn-system-link m-salepoint-edit__choose-salepoint", onclick: loadGridPicker}, salepoint() ?  salepoint().name : 'Выберите клиента'),
                        m("select", {class: "form-control m-salepoint-edit__year-choose", onchange: yearChanged}, [
                            _yearArray.map(function(y){
                                return m("option", {value: y, selected:year() === y}, y)
                            })
                        ]),
                        m("select", {class: "form-control m-salepoint-edit__month-choose", onchange: monthChanged}, [
                            Object.keys(_monthArray).map(function(monthIndex){
                                return m("option", {value: monthIndex, selected:month() === monthIndex}, _monthArray[monthIndex])
                            })
                        ]),
                    ]),
                    m("div", {class: "m-salepoint-edit__program-list component-container"}, [
                        m("table", {class: "table table-bordered m-salepoint-edit__program-list-table"}, [
                            m("thead", [
                                m("tr", [
                                    m("th", 'Основная программа'),
                                    m("th", 'Название программы'),
                                    m("th", 'Переброс'),
                                    m("th", 'Лимит'),
                                    m("th", '')
                                ])
                            ]),
                            m("tbody" ,[
                                Model.salepointProgram.map(function(program, index) {
                                    if(program['SAP_ID'] !== 'default'){
                                        return m("tr", {'data-code': program['SPD_SAP_CODE'], class: program['SAP_ID'] === 'default' ? ".ui-state-disabled" : ''}, [
                                            m("td",
                                                m("input", {type: "checkbox", checked: program['SPD_IS_MAIN'] == '1', disabled: program['SPD_IS_MAIN'] == '1', 'data-index': index, onchange: mainProgramChange})
                                            ),
                                            m("td", program['SAP_NAME']),
                                            m("td",
                                                m("select", {class: "form-control", 'data-index': index, onchange: childProgramChanged}, [
                                                    m("option", {value: false, selected: true}, 'нет'),
                                                    Model.salepointProgram.map(function(prog){
                                                        if(prog['SPD_SAP_CODE'] !== program['SPD_SAP_CODE']){
                                                            return m("option", {value: prog['SPD_CODE'], selected: prog['SPD_CODE'] === program['SPD_CHILD_PROG_SPD_CODE']}, prog['SAP_NAME'])
                                                        }
                                                    })
                                                ])
                                            ),
                                            m("td",
                                                program['SPD_CHILD_PROG_SPD_CODE'] ?
                                                    m("input", {class: "form-control", type: "text", placeholder: "Укажите лимит для программы", value: program['SPD_SAL_LIMIT'] ? program['SPD_SAL_LIMIT'] : '', 'data-index': index, oninput: programLimitChanged}) :
                                                    'нет'
                                            ),
                                            m("td", m("button", {class: "btn btn-link btn-system-link", 'data-index': index, onclick: removeProgram}, 'Удалить программу'))
                                        ])
                                    }else{
                                        return m("tr", {'data-code': program['SPD_SAP_CODE'], class: program['SAP_ID'] === 'default' ? ".ui-state-disabled" : ''}, [
                                            m("td",
                                                m("input", {type: "checkbox", checked: false, disabled: true})
                                            ),
                                            m("td", program['SAP_NAME']),
                                            m("td", 'нет'),
                                            m("td", 'нет'),
                                            m("td", '')
                                        ])
                                    }

                                })
                            ])
                        ]),
                        m("div", {class: "m-salepoint-edit__add-program-container clearfix"}, [
                            m("select", {class: "form-control m-salepoint-edit__add-program-select", key: programChangeCount, onchange: programToAddChanged}, [
                                m("option", {value: 'hint', disabled: true, selected: true}, 'Выберите программу'),
                                _allProgram.map(function(program){
                                    if(Model.programCodes.indexOf(program['SAP_CODE']) === -1){
                                        return m("option", {value: program['SAP_CODE']}, program['SAP_NAME'])
                                    }
                                })
                            ]),
                        ]),
                        _saveErrors.length > 0 ?
                            m("div", {class: "m-salepoint-edit__error-container alert-danger"}, [
                                m("h3", 'Ошибка сохранения!'),
                                _saveErrors.map(function(error){
                                    return m("p", error)
                                })
                            ]) : '',
                        m("button", {class: "btn btn-success m-salepoint-edit__save-btn", disabled: !_needSave(), onclick: trySave}, 'Сохранить')
                    ]),
                    _GridPicker,
                    _InfoModal
                ]);
            break;
            case 'error':
                return m("div", {class: "m-salepoint-edit"}, [
                    m("div", {class: "m-salepoint-edit__tools component-container"}, [
                        m("label", {class: "m-salepoint-edit__choose-salepoint-label"}, 'Клиент: '),
                        m("button", {class: "btn btn-link btn-system-link m-salepoint-edit__choose-salepoint", onclick: loadGridPicker}, salepoint() ?  salepoint().name : 'Выберите клиента'),
                        m("select", {class: "form-control m-salepoint-edit__year-choose", onchange: yearChanged}, [
                            _yearArray.map(function(y){
                                return m("option", {value: y, selected:year() === y}, y)
                            })
                        ]),
                        m("select", {class: "form-control m-salepoint-edit__month-choose", onchange: monthChanged}, [
                            Object.keys(_monthArray).map(function(monthIndex){
                                return m("option", {value: monthIndex, selected:month() === monthIndex}, _monthArray[monthIndex])
                            })
                        ]),
                    ]),
                    m("div", {class: "alert alert-danger component-container"}, [
                        m("h3", 'Ошибка!'),
                        m("p", 'Отсутствует обязательная программа для точки!'),
                        m("p", 'Обратитесь к администратору системы.')
                    ])
                ]);
            break;
        }
    }

    return{
        controller: controller,
        view: view
    }
}