'use strict';
var m = require('mithril');
var MapModule = require('./map.js');
var Helper = require('../../../components/helper.js')();
var Modal = require('../../../components/modal-window/modal-window.js');
var ModalLoading = require('../../../components/modal-window/loading-modal-window.js');
module.exports = function (config) {
    var salCode = config.salCode || false;
    var zIndex = config.zIndex || 1010;
    var _state = 'loading';
    var _errors = [];
    var _tries = 20;
    var _tryInterval;
    var _Map;
    var _modalWindow = '';
    var _isInited = false;
    var _isMainPoint = false;

    var Model = {
        salepoint: {},
        setData: function(data){
            Model.salepoint = data;
        },
        update: function(key, value){
            Model.salepoint[key] = value;
        },
        getCoordinates: function(){
            if( _Map.checkCoordinate(Model.salepoint['SAL_LATITUDE']) && _Map.checkCoordinate(Model.salepoint['SAL_LONGITUDE']) ){
                return {
                    latitude: Model.salepoint['SAL_LATITUDE'],
                    longitude: Model.salepoint['SAL_LONGITUDE']
                }
            }
            return false;
        },
        yandexAddress: {
            country: '',
            admArea: '',
            city: '',
            street: '',
            house: ''
        },
        updateYandexAddress: function(addressObj){
            Model.yandexAddress = addressObj;
        }
    };

    function movePointModal(newCoordinates){
        _modalWindow = new Modal({
            id: 'locatorModalWindow',
            state: 'show',
            content: [
                'Сохранить новые координаты?'
            ],
            isStatic: false,
            header: 'Сохранение данных',
            isFooter: true,
            isFullScreen: false,
            modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
            zIndex: zIndex + 1,
            confirmBtn: 'Ок',
            cancelBtn: 'Отмена',
            onCancel: function(){
                if(_isMainPoint){
                    _Map.setPointCoordinate(Model.getCoordinates(), null);
                }
            },
            onConfirm: function(){
                Model.salepoint['SAL_LATITUDE'] = newCoordinates.latitude;
                Model.salepoint['SAL_LONGITUDE'] = newCoordinates.longitude;
                if(!_isMainPoint){
                    _Map.drawPoint({
                        latitude: Model.salepoint['SAL_LATITUDE'],
                        longitude:Model.salepoint['SAL_LONGITUDE'],
                        name: Model.salepoint['SAL_NAME']
                    });
                    _Map.getYandexAddressByCoordinates(function(address){
                        Model.updateYandexAddress(address);
                        m.redraw();
                    });
                    _isMainPoint = true;
                }else{
                    _Map.setPointCoordinate(Model.getCoordinates(), function(address){
                        Model.updateYandexAddress(address);
                        m.redraw();
                    });
                }
                Helper.updateData(null, {"context": this, "module": "Locator", "function": "updatePointCoordinatesAjax"}, "SAL_LONGITUDE = '" + Model.salepoint['SAL_LONGITUDE'] + "', SAL_LATITUDE = '" + Model.salepoint['SAL_LATITUDE'] + "'", "ST_SALEPOINT", "SAL_CODE=" + salCode);
                _modalWindow = '';
                m.redraw();
            }
        });
        m.redraw();
    }

    function createMap(){
        _Map = new MapModule({
            mapContainer: 'locatorMapContainer',
            onPointMove: movePointModal,
            onMapClick: movePointModal
        });
    }

    function checkYandexMaps(){
        _tries--;
        if(_tries > 0){
            if(typeof ymaps !== 'undefined'){
                clearInterval(_tryInterval);
                ymaps.ready(function (){
                    createMap();
                    getSalepointData(salCode);
                })
            }
        }else{
            _errors.push('Error! Enable load yandex maps script.');
            _state = 'error';
            m.redraw();
        }
    }

    function getSalepointData(salepointCode){
        Helper.getData(salepointDataLoaded, {"context": this, "module": "Locator", "function": "getPointData"}, '*', 'VIEW_ST_SALEPOINT', "WHERE SAL_CODE = '"+salepointCode+"'");
    }

    function salepointDataLoaded(data){
        Model.setData(data[0]);
        _state = 'locator';
        if(!Model.getCoordinates()){
            showHintModal();
        }
        m.redraw();
    }

    function searchByYandex(){
        var address = Model.salepoint['LOC_NAME']+', '+Model.salepoint['SAL_NOTES']+', '+Model.salepoint['SAL_HOUSE'];
        _Map.searchByYandex(address, movePointModal);
    }

    function initMap(){
        if(_isInited){ return; }
        _Map.init();
        var coordinates = Model.getCoordinates();

        //if salepoint coordinates are valid
        if(Model.getCoordinates()){
            _Map.drawPoint({
                latitude: Model.salepoint['SAL_LATITUDE'],
                longitude:Model.salepoint['SAL_LONGITUDE'],
                name: Model.salepoint['SAL_NAME']
            });
            _Map.getYandexAddressByCoordinates(function(address){
                Model.updateYandexAddress(address);
                m.redraw();
            });
            _isMainPoint = true;
        }else{
            console.log('no coordinates');
        }
        _isInited = true;
    }

    function showHintModal(){
        _modalWindow = new Modal({
            id: 'locatorModalWindow',
            state: 'show',
            content: [
                m("p", 'Отсутствуют координаты у торговой точки "' + Model.salepoint['SAL_NAME'] + '"!'),
                m("p", [
                    'Кликните в нужную точку на карте, чтобы задать координаты или воспользуйтесь поиском ',
                    m("a", {onclick: function(e){
                        e.preventDefault();
                        _modalWindow = '';
                        searchByYandex();
                    }}, 'Yandex'),
                    ' и кликните на результат поиска.'
                ])
            ],
            isStatic: false,
            header: 'Установка координат',
            isFooter: true,
            isFullScreen: false,
            modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
            zIndex: zIndex + 1,
            confirmBtn: 'Ок',
            cancelBtn: 'none',
            onConfirm: function(){
                _modalWindow = '';
            }
        });
    }

    function changeAddress(){
        _modalWindow = new Modal({
            id: 'locatorModalWindow',
            state: 'show',
            content: [
                'Заменить текущий адрес на "' + Model.yandexAddress.street + ', ' + Model.yandexAddress.house + '"?'
            ],
            isStatic: false,
            header: 'Сохранение адреса',
            isFooter: true,
            isFullScreen: false,
            modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
            zIndex: zIndex + 1,
            confirmBtn: 'Ок',
            cancelBtn: 'Отмена',
            onConfirm: function(){
                Model.salepoint['SAL_NOTES'] = Model.yandexAddress.street;
                Model.salepoint['SAL_HOUSE'] = Model.yandexAddress.house;
                Helper.updateData(null, {"context": this, "module": "Locator", "function": "updatePointCoordinatesAjax"}, "SAL_NOTES = '" + Model.salepoint['SAL_NOTES'] + "', SAL_HOUSE = '" + Model.salepoint['SAL_HOUSE'] + "'", "ST_SALEPOINT", "SAL_CODE=" + salCode);
                _modalWindow = '';
                m.redraw();
            }
        });
    }

    function changeYandexStreet(){
        Model.yandexAddress.street = this.value;
    }

    function changeYandexHouse(){
        Model.yandexAddress.house = this.value;
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        _errors = [];
        if(!salCode){
            _errors.push('Incorrect salepoint code in params!');
            _state = 'error';
            m.redraw();
        }else{
            //add Yandex maps source script
            if(typeof ymaps === 'undefined'){
                var yandexSourceScript = document.createElement('script');
                yandexSourceScript.setAttribute('src','https://api-maps.yandex.ru/2.1/?lang=ru-RU');
                document.head.appendChild(yandexSourceScript);
            }
            //check while ymaps loading
            _tryInterval = setInterval(checkYandexMaps, 500);
        }
    }

    function view(ctrl) {
        switch(_state){
            case 'loading':
                return m("div", {class: "m-map-locator"}, [
                    new ModalLoading({header: "Загрузка данных"})
                ])
            break;
            case 'locator':
                return m("div", {class: "m-map-locator"}, [
                    m("div", {class: "m-map-locator__map-container", id: "locatorMapContainer", config: initMap}, ''),
                    m("div", {class: "m-map-locator__info-panel"}, [
                        m("div", {class: "b-address-box"}, [
                            m("h3", {style: "display: inline-block; margin-top: 0px;"}, 'Адрес в системе'),
                            m("button", {class: "btn btn-default", style: "float: right;", onclick: searchByYandex}, 'Поиск Yandex'),
                            m("div", {class: "form-group address-line"}, [
                                m("label", {for: "dbSalCode"}, 'Код точки'),
                                m("input", {class: "form-control", type: "text", disabled: true, value: Model.salepoint['SAL_ID']})
                            ]),
                            m("div", {class: "form-group address-line"}, [
                                m("label", {for: "dbAddressLocation"}, 'Населенный пункт'),
                                m("input", {class: "form-control", type: "text", disabled: true, value: Model.salepoint['LOC_NAME']})
                            ]),
                            m("div", {class: "form-group address-line " + (Model.salepoint['SAL_NOTES'] !== Model.yandexAddress.street ? 'has-error' : '')}, [
                                m("label", {for: "dbAddressStreet"}, 'Улица/микрорайон'),
                                m("input", {class: "form-control", type: "text", disabled: true, value: Model.salepoint['SAL_NOTES']})
                            ]),
                            m("div", {class: "form-group address-line " + (Model.salepoint['SAL_HOUSE'] !== Model.yandexAddress.house ? 'has-error' : '')}, [
                                m("label", {for: "dbAddressHouse"}, 'Номер дома'),
                                m("input", {class: "form-control", type: "text", disabled: true, value: Model.salepoint['SAL_HOUSE']})
                            ]),
                            m("h3", 'Yandex адрес'),
                            m("div", {class: "yandex-address-panel"}, [
                                m("div", {class: "form-group address-field"}, [
                                    m("label", {for: "address-street"}, 'Улица/микрорайон'),
                                    m("input", {class: "form-control", type: "text", value: Model.yandexAddress.street, onchange: changeYandexStreet})
                                ]),
                                m("div", {class: "form-group address-field"}, [
                                    m("label", {for: "address-house"}, 'Номер дома'),
                                    m("input", {class: "form-control", type: "text", value: Model.yandexAddress.house, onchange: changeYandexHouse})
                                ]),
                                m("button", {class: "btn btn-success m-map-locator__change-address-btn", onclick: changeAddress, disabled: !_isMainPoint}, 'Заменить текущий адрес Yandex-адресом')
                            ])
                        ])
                    ]),
                    _modalWindow
                ]);
            break;
            case 'error':
                return m("div", {class: "m-map-locator"},
                    m("div", {class: "-map-locator__error-container alert"},
                        _errors.map(function(error){
                            return m("p", error)
                        })
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