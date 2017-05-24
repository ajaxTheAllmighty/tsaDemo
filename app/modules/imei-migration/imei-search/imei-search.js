'use strict';
var m = require('mithril');
var AutocompleteComponent = require('../../../components/autocomplete/autocomplete.js');
var Helper = require('../../../components/helper.js')();
module.exports = function () {
    var state = 'loading';
    var _imeiArray = [];
    var _selectedItemsList = {};
    var _selectedItemCode = false;
    var onAddRemove;
    var _Ac;

    function loadImeiData(){
        Helper.getData(imeiDataLoaded, {"context": this, "module": "Imei Migration module", "function": "loadImeiData"}, 'IME_CODE, IME_INVENTORY, IME_SERIAL_NUMBER', 'VIEW_ST_IMEI', "WHERE IME_INVENTORY IS NOT NULL");
    }

    function imeiDataLoaded(data){
        _imeiArray = data;
        state = "default";
        m.redraw();
    }

    function addImei(){
        if(_selectedItemCode){
            if(_selectedItemsList.hasOwnProperty(_selectedItemCode)){
                console.log('Устройство уже добавлено');
            }else{
                Helper.getData(addRow, {"context": this, "module": "Imei Migration module", "function": "addImei"}, 'IME_CODE, IME_DEVICE, IME_INVENTORY, IME_SERIAL_NUMBER', 'VIEW_ST_IMEI', "WHERE IME_CODE = '"+_selectedItemCode+"'");
            }
        }
        _Ac.clean();
    }

    function addRow(data){
        var imeiObj = data[0];
        _selectedItemsList[imeiObj["IME_CODE"]] = imeiObj;
        onAddRemove(Object.keys(_selectedItemsList).length);
        m.redraw();
    }

    function removeImei(){
        var code = this.getAttribute('data-code');
        delete _selectedItemsList[code];
        onAddRemove(Object.keys(_selectedItemsList).length);
    }

    function getItemList(){
        return _selectedItemsList;
    }

    function clean(){
        _selectedItemsList = {};
        _Ac.clean();
    }

    ///////////////////////////////////////////////////
    //     COMPONENT CONTROLLER AND VIEW METHODS     //
    ///////////////////////////////////////////////////

    function controller(config) {
        onAddRemove = config.onAddRemove || null;
        _Ac = new AutocompleteComponent;
    }

    function view(ctrl) {
        switch(state){
            case 'default':
                var acConfig = {
                    data: _imeiArray,
                    maxToShow: 100,
                    valueField: "IME_CODE",
                    titleField: "IME_INVENTORY",
                    onSelect: function(title, value, instantAdd){
                        _selectedItemCode = value;
                        if(typeof instantAdd != 'undefined'){
                            addImei();
                        }
                    }
                };

                return m("div", {class: "imei-search-component"}, [
                    m("div", {class: "choose-container_search-block clearfix"}, [
                        m("div", {class: "choose-container_ac-container"},
                            m.component(_Ac, acConfig)
                        ),
                        m("div", {class: "choose-container_btn-container"},
                            m("button", {class: "choose-container_choose-btn btn btn-system btn-system-primary", onclick: addImei}, t('addBtn', 'IM_ImeiSearchModule'))
                        )
                    ]),
                    m("div", {class: "migration_imei-table-container"},
                        m("table", {class: "table table-bordered table-striped table-hover imei-table"}, [
                            m("thead", [
                                m("tr", {}, [
                                    m("th", t('tableColumnCode', 'IM_ImeiSearchModule')),
                                    m("th", t('tableColumnDevice', 'IM_ImeiSearchModule')),
                                    m("th", t('tableColumnInventory', 'IM_ImeiSearchModule')),
                                    m("th", t('tableColumnSerial', 'IM_ImeiSearchModule')),
                                    m("th", ""),
                                ])
                            ]),
                            m("tbody", {}, [
                                Helper.objectToArray(_selectedItemsList).map(function(item, index){
                                    return m("tr", {}, [
                                        m("td", {}, item["IME_CODE"]),
                                        m("td", {}, item["IME_DEVICE"]),
                                        m("td", {}, item["IME_INVENTORY"]),
                                        m("td", {}, item["IME_SERIAL_NUMBER"]),
                                        m("td",
                                            m("span", {class: "remove-imei-btn", "data-code": item["IME_CODE"], onclick: removeImei}, m.trust('×'))
                                        ),
                                    ])
                                })
                            ])
                        ])
                    ),
                ]);
                break;
            case 'loading':
                loadImeiData();
                return m("div", {class: "imei-search-component"}, [
                    m("div", "loading data")
                ]);
                break;
        }
    }
    return{
        clean: clean,
        getItemList: getItemList,
        controller: controller,
        view: view
    }
};