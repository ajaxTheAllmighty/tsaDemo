'use strict';
var m = require('mithril');
var Helper = require('../../../../components/helper.js')();
var Modal = require('../../../../components/modal-window/modal-window.js');
module.exports = function (config) {
    var onPointEdit = config.onPointEdit;
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
    var _programArray = [];
    var _state = 'loading';
    var _month = m.prop(false);
    var _year = m.prop(false);
    var _program = m.prop(false);
    var _salepointSourceGrid = false;
    var _newGrid = true;
    var _isDragging = false;
    var _salepointProgramEditModal = '';
    var _allProgram = [];
    var _salepointsToSave = 0;
    var _savedSalepoints = 0;
    var _informModal = '';
    var _search = m.prop('');
    var _searchRegExp = false;

    var Model = {
        salepointInProgram:  m.prop([]),
        salepointCodesInProgram:  m.prop([]),
        getSalepointInProgram: function(){
            return this.salepointInProgram()
        },
        getSalepointCodesInProgram: function(){
            return this.salepointCodesInProgram()
        },
        addSalepoint: function(salepointObject){
            this.salepointCodesInProgram().push(salepointObject.salCode);
            this.salepointInProgram().push(salepointObject)
        },
        removeAll: function(){
            this.salepointInProgram([]);
            this.salepointCodesInProgram([]);
        }
    };

    function refreshSourceGrid(){
        var staticFilters = {
            '1': {
                isHidden: true,
                andOrCondition: "AND",
                condition: "notIn",
                fieldTitle: '',
                fieldName: "SAL_CODE",
                filterField: "SAL_CODE",
                id: "1",
                isGroupCondition: true,
                type: "INT",
                value: (Model.getSalepointCodesInProgram().length > 0 ? Model.getSalepointCodesInProgram().join(',') : 0)
            },
            '2': {
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
        };
        _salepointSourceGrid.refresh({
            staticFilters: staticFilters
        });
    }

    function salepointsLoaded(data){
        Model.removeAll();
        data.map(function(row){
            Model.addSalepoint({
                salId: row['SAL_ID'],
                salCode: row['SPD_SAL_CODE'],
                salName: row['SAL_NAME'],
                salLimit: row['SPD_SAL_LIMIT'],
                salChildProgram: row['SPD_CHILD_PROG_SAP_CODE']
            });
        });
        if(_newGrid){
            _salepointSourceGrid = new GridModule({
                allowNew: false,
                allowDrag: true,
                onDragStart: function(){
                    _isDragging = true;
                },
                onDragEnd: function(){
                    _isDragging = false;
                },
                gridView: 'VIEW_ST_SALEPOINT',
                perPage: 50,
                moduleId: Globals.registerModule('grid'),
                showSelectColumn: true,
                staticFilters: {
                    '1': {
                        isHidden: true,
                        andOrCondition: "AND",
                        condition: "notIn",
                        fieldTitle: '',
                        fieldName: "SAL_CODE",
                        filterField: "SAL_CODE",
                        id: "1",
                        isGroupCondition: true,
                        type: "INT",
                        value: (Model.getSalepointCodesInProgram().length > 0 ? Model.getSalepointCodesInProgram().join(',') : 0)
                    },
                    '2': {
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
                }
            });
        }else{
            refreshSourceGrid();
        }

        _state = 'manage';
        m.redraw();
    }

    function  monthChanged(){
        _month(this.value);
        loadProgram();
    }

    function yearChanged(){
        _year(parseInt(this.value));
        loadProgram();
    }

    function programChanged(){
        _program(parseInt(this.value));
        loadProgram();
    }

    function loadProgram(){
        if(_month() && _year() && _program()){
            Helper.getData(salepointsLoaded, {"context": this, "module": "Program manage module", "function": "programChanged"}, '*', 'VIEW_ST_SALE_PROGRAM_DETAIL', "WHERE SPD_SAP_CODE = " + _program() + " AND SPD_MONTH_NUMBER = " + _month() + ' AND SPD_YEAR = ' + _year(), 'SAL_ID');
        }
    }

    function allowDrop(ev){
        ev.preventDefault();
    }

    function getSalepointCodes(ev){
        ev.preventDefault();
        if(ev.dataTransfer.getData("codes") != ''){
            var salepointCodes = ev.dataTransfer.getData("codes").split(',');
            insertSalepointsToProgram(salepointCodes);
            _state = 'loading';
        }
    }

    function insertSalepointsToProgram(codes){
        _savedSalepoints = 0;
        _salepointsToSave = codes.length;
        codes.map(function(salepointCode){
            Helper.insertData(salepointInsertedIntoProgram, {"context": this, "module": "Program manage module", "function": "oldProgramDeleted"}, "ST_SALE_PROGRAM_DETAIL",
                'SPD_SAP_CODE, SPD_MONTH_NUMBER, SPD_YEAR, SPD_SAL_CODE, SPD_SAL_LIMIT, SPD_CHILD_PROG_SPD_CODE',
                _program()+","+_month()+","+_year()+","+salepointCode+",NULL,NULL");
        })
        _state = 'loading';
    }

    function addSalepointsToProgram(){
        insertSalepointsToProgram(_salepointSourceGrid.getSelectedRows());
    }

    function showSalepointCard(){
        var index = this.getAttribute('data-index');
        var salepoint = Model.getSalepointInProgram()[index];
        onPointEdit({
            month: _month(),
            year: _year(),
            salepoint: {code: salepoint.salCode, name: salepoint.salName}
        });
    }

    function programDataLoaded(data){
        _programArray = [];
        _allProgram = {};
        data.map(function(program){
            if(program['SAP_ID'] !== 'default'){
                _programArray.push(program);
            }
            _allProgram[program['SAP_CODE']] = program;
        });
        if(_month() && _year() && _program()){
            _state = 'loading';
            loadProgram();
        }else{
            _state = 'default';
            m.redraw();
        }

    }

    function salepointInsertedIntoProgram(){
        _savedSalepoints++;
        if(_savedSalepoints === _salepointsToSave){
            _informModal = new Modal({
                id: 'programInformModal',
                state: 'show',
                content: [
                    'Точки успешно сохранены в программе!'
                ],
                isStatic: false,
                header: 'Сохранение программы',
                isFooter: true,
                isFullScreen: false,
                modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                zIndex: 1005,
                confirmBtn: 'Ок',
                cancelBtn: 'none',
                onConfirm: function(){
                    _informModal = '';
                }
            });
            _newGrid = false;
            loadProgram();
        }
    }

    function searchSalepoint(){
        _search(this.value);
        _searchRegExp = _search().trim() === '' ? false : new RegExp(_search(),"i");
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        Helper.getData(programDataLoaded, {"context": this, "module": "Program manage module", "function": "controller"}, '*', 'ST_SALE_PROGRAM', "WHERE 1=1");
    }

    function view(ctrl) {
        switch(_state){
            case 'default':
                return m("div", {class: "m-ps-manage"}, [
                    m("div", {class: "ps-manage__salepoint-source-container component-container"}, [
                        m("p", 'Для начала работы выберите год и месяц программы из выпадающих списков в правой части экрана.'),
                        m("p", 'После выбора месяца и года в появившейся таблице-"источнике" выделите торговые точки, которые должны быть добавлены в программу, отмечая их выбором чекбокса.'),
                        m("p", 'Кликните на торговую точку в таблице-"получателе" в правой части экрана для ее редактирования.'),
                        m("p", 'Для удаления тороговых точек из программы, выделите нужные элементы в таблице справа и нажмите кнопку "Удалить".')
                    ]),
                    m("div", {class: "ps-manage__move-btn-container"}, [
                        m("button", {class: "btn btn-default ps-manage__move-btn", disabled: true}, '>>')
                    ]),
                    m("div", {class: "ps-manage__salepoint-dest-container"}, [
                        m("div", {class: "ps-manage__tools component-container"}, [
                            m("select", {class: "form-control ps-manage__program-choose", onchange: programChanged}, [
                                m("option", {selected: true, disabled: true}, 'Выберите программу'),
                                _programArray.map(function(programObj){
                                    return m("option", {value: programObj['SAP_CODE'], selected:_program() === programObj['SAP_CODE']}, programObj['SAP_NAME'])
                                })
                            ]),
                            m("select", {class: "form-control ps-manage__year-choose", onchange: yearChanged}, [
                                m("option", {selected: true, disabled: true}, 'Выберите год'),
                                _yearArray.map(function(y){
                                    return m("option", {value: y, selected:_year() === y}, y)
                                })
                            ]),
                            m("select", {class: "form-control ps-manage__month-choose", onchange: monthChanged}, [
                                m("option", {selected: true, disabled: true}, 'Выберите месяц'),
                                Object.keys(_monthArray).map(function(monthIndex){
                                    return m("option", {value: monthIndex, selected: _month() === monthIndex}, _monthArray[monthIndex])
                                })
                            ]),
                        ]),
                        m("div", {class: "ps-manage__salepoint-table-container component-container clearfix"}),
                        m("div", {class: "ps-manage__info-search-container component-container"}, [
                            m("input", {type: "text", class: "form-control ps-manage__salepoint-search-input", placeholder: "поиск точки", value: _search(), oninput: searchSalepoint}),
                            m("strong", {class: "ps-manage__salepoint-in-program-info"}, 'Всего точек в программе: '+Model.getSalepointInProgram().length)
                        ])
                    ]),
                ])
            break;
            case 'loading':
                return new Modal({
                    id: '',
                    state: 'show',
                    content: [
                        m("img", {
                            style: "margin-right: 20px;width: 40px;height: 40px;",
                            src: "dist/assets/images/loading.gif"
                        }),
                        'Пожалуйста, подождите...',
                        m("p", {style: "margin-top: 15px;"}, 'Операция может занять продолжительное время.')
                    ],
                    isStatic: true,
                    header: 'Загрузка данных',
                    isFooter: false,
                    isFullScreen: false,
                    modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                    zIndex: 1001
                })
            break;
            case 'manage':
                return m("div", {class: "m-ps-manage"}, [
                    m("div", {class: "ps-manage__salepoint-source-container"}, [
                        m.component(_salepointSourceGrid)
                    ]),
                    m("div", {class: "ps-manage__move-btn-container"}, [
                        m("button", {class: "btn btn-default ps-manage__move-btn", onclick: addSalepointsToProgram}, '>>')
                    ]),
                    m("div", {class: "ps-manage__salepoint-dest-container"}, [
                        m("div", {class: "ps-manage__tools component-container"}, [
                            m("select", {class: "form-control ps-manage__program-choose", onchange: programChanged}, [
                                _programArray.map(function(programObj){
                                    return m("option", {value: programObj['SAP_CODE'], selected:_program() === programObj['SAP_CODE']}, programObj['SAP_NAME'])
                                })
                            ]),
                            m("select", {class: "form-control ps-manage__year-choose", onchange: yearChanged}, [
                                _yearArray.map(function(y){
                                    return m("option", {value: y, selected:_year() === y}, y)
                                })
                            ]),
                            m("select", {class: "form-control ps-manage__month-choose", onchange: monthChanged}, [
                                Object.keys(_monthArray).map(function(monthIndex){
                                    return m("option", {value: monthIndex, selected: _month() === monthIndex}, _monthArray[monthIndex])
                                })
                            ]),
                        ]),
                        m("div", {class: "ps-manage__salepoint-table-container component-container clearfix"}, [
                            m("div", {class: "ps-manage__drag-container"+(_isDragging ? '_droppable' : ''), ondrop: getSalepointCodes, ondragover: allowDrop},
                                m("table", {class: "table table-bordered table-striped table-hover ps-manage__salepoint-table"}, [
                                    m("thead", [
                                        m("tr", {}, [
                                            m("th", {class: ""}, "Код ТТ"),
                                            m("th", {class: ""}, "Название ТТ"),
                                            m("th", {class: ""}, "Лимит"),
                                            m("th", {class: ""}, "Переброс на программу"),
                                        ])
                                    ]),
                                    m("tbody", [
                                        Model.getSalepointInProgram().map(function(salObj, index){
                                            var program = salObj['salChildProgram'] ? _allProgram[salObj['salChildProgram']]['SAP_NAME']  : '-';
                                            //var program = salObj['salChildProgram'];
                                            if(_searchRegExp){
                                                if(salObj['salId'].search(_searchRegExp) !== -1 || salObj['salName'].search(_searchRegExp) !== -1){
                                                    return m("tr", {'data-index': index, onclick: showSalepointCard}, [
                                                        m("td", {}, salObj['salId']),
                                                        m("td", {}, salObj['salName']),
                                                        m("td", {}, salObj['salLimit'] ? salObj['salLimit'] : 'нет'),
                                                        m("td", {}, program),
                                                    ])
                                                }
                                            }else{
                                                return m("tr", {'data-index': index, onclick: showSalepointCard}, [
                                                    m("td", {}, salObj['salId']),
                                                    m("td", {}, salObj['salName']),
                                                    m("td", {}, salObj['salLimit'] ? salObj['salLimit'] : 'нет'),
                                                    m("td", {}, program),
                                                ])
                                            }

                                        })
                                    ])
                                ])
                            )
                        ]),
                        m("div", {class: "ps-manage__info-search-container component-container"}, [
                            m("input", {type: "text", class: "form-control ps-manage__salepoint-search-input", placeholder: "поиск точки", value: _search(), oninput: searchSalepoint}),
                            m("strong", {class: "ps-manage__salepoint-in-program-info"}, 'Всего точек в программе: '+Model.getSalepointInProgram().length)
                        ])
                    ]),
                    _salepointProgramEditModal,
                    _informModal
                ]);
            break;
        }
    }

    return{
        controller: controller,
        view: view
    }
}