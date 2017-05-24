'use strict';
var m = require('mithril');
var Modal = require('../../components/modal-window/modal-window.js');

module.exports = function () {
    var _state = 'default';
    var _currentDate;
    var _nextDate;
    var _resultGrid;
    var _datepickerIsInit = false;

    function datePicker(el){
        if(!_datepickerIsInit){
            $(el).datepicker({
                format: 'dd-mm-yyyy',
                language: Globals.getLangApp()
            }).change(function(){
                _currentDate = $(el).datepicker("getDate");
                _nextDate = new Date();
                _nextDate.setDate(_currentDate.getDate() + 1);
                dateChanged();
            });
            _datepickerIsInit = true;
        }
    }

    function dateChanged(){
        var staticFilters = {
            '1': {
                isHidden: true,
                andOrCondition: "AND",
                condition: "between",
                fieldTitle: '',
                fieldName: "VIS_START_DATE",
                filterField: "VIS_START_DATE",
                id: "1",
                isGroupCondition: true,
                type: "DATE",
                value: {start: getTextDate(_currentDate), end: getTextDate(_currentDate)}
            }
        };
        _resultGrid.refresh({
            staticFilters: staticFilters
        });
    }

    function getTextDate(date, delimiter){
        if(typeof delimiter === 'undefined'){
            delimiter = '-';
        }
        return ('0' + date.getDate()).slice(-2) + delimiter+ ('0' + (date.getMonth()+1)).slice(-2) + delimiter+ date.getFullYear();
    }

    function openMap(){
        var url = Config.serverAddress + Config.rootFolder + 'maps/visitmap/index.html?date='+getTextDate(_currentDate, '.')+'&where='+encodeURIComponent(_resultGrid.getSqlCondition())+'&USE_CODE='+Globals.getUserData()['USE_CODE']+'&USR_CODE='+Globals.getUserData()['USR_CODE'];
        var win = window.open(url, '_blank');
        win.focus();
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        _currentDate = new Date();
        _nextDate = new Date();
        _nextDate.setDate(_currentDate.getDate() + 1);
        _resultGrid = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'grid',
            allowNew: false,
            gridView: 'VIEW_ST_PROMO_FOR_MAP',
            perPage: 50,
            staticFilters:{
                '1': {
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "between",
                    fieldTitle: '',
                    fieldName: "VIS_START_DATE",
                    filterField: "VIS_START_DATE",
                    id: "1",
                    isGroupCondition: true,
                    type: "DATE",
                    value: {start: getTextDate(_currentDate), end: getTextDate(_nextDate)}
                }
            },
            showSelectColumn: false,
            contextActionsList: ['export, rowMode'],
            isModal: false
        });
    }

    function view(){
        switch(_state){
            case 'loading':
                return m("div", {class: "m-activity-map"}, [
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
                ])
            break;
            case 'default':
                return m("div", {class: "m-activity-map"}, [
                    m("div", {class: "m-activity-map__tools-container"}, [
                        m("label", [
                            t('dateInputLabel', 'ActivityOnMapModule'),
                            m("div", {class: "inner-addon right-addon m-activity-map__calendar-container"}, [
                                m("i", {class: "glyphicon glyphicon-calendar"}, ''),
                                m("input", {type: "text", class: "form-control", value: getTextDate(_currentDate), config: datePicker})
                            ]),
                        ]),
                        m("button", {class: "btn btn-system btn-system-primary m-activity-map__show-map-btn", onclick: openMap}, t('showResultBtn', 'ActivityOnMapModule'))
                    ]),
                    m("div", {class: "m-activity-map__grid-container"}, [
                        m.component(_resultGrid)
                    ])
                ])
            break;
        }
    }

    return{
        controller: controller,
        view: view
    }
};