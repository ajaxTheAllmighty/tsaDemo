'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
var Modal = require('../../components/modal-window/modal-window.js');
var TableComponent = require('../../components/table/table.js');
var UserPickerModule = require('./steps/user-picker.js');
var VisitMapModule = require('./steps/visit-map.js');

module.exports = function () {
    var _state = 'selectUser';
    var UserPicker = '';
    var VisitMap = '';
    var _InfoModal = '';
    var _startDate = '';
    var _endDate = '';


    function toStep1(){
        _state = 'selectUser';
    }

    function toStep2(){
        _state = 'visitmap';
        VisitMap = new VisitMapModule({
            startDate: _startDate,
            endDate: _endDate,
            users: UserPicker.getUsers()
        });
    }

    function datePickerRange(el, isInitialized){
        if (isInitialized) return;
        $(el).each(function() {
            $(this).datepicker("clearDates", {format: 'dd-mm-yyyy', language: Globals.getLangApp()})
        });
    }

    function showVisits(){
        var errors = [];
        if(UserPicker.getUsers().length === 0){
            errors.push('Выберите пользователей для просмотра визитов.');
        }

        if(_startDate === '' || _endDate === ''){
            errors.push('Выберите начальную и конечную дату для просмотра визитов.');
        }

        if(errors.length > 0){
            _InfoModal = new Modal({
                id: 'visitManageModal',
                state: 'show',
                content: [
                    errors.map(function(error){
                        return m("p", error);
                    })
                ],
                isStatic: false,
                header: 'Ошибка',
                isFooter: true,
                isFullScreen: false,
                modalSizeParams: {width: '600px', height: false, padding: '15% 0 0 0'},
                zIndex: 1005,
                confirmBtn: 'Ок',
                cancelBtn: 'none',
                onConfirm: function(){
                    _InfoModal = '';
                }
            });
        }else{
            toStep2();
        }
    }

    function startDateChanged(){
        _startDate = this.value;
    }

    function endDateChanged(){
        _endDate = this.value;
        if(_startDate === ''){
            _startDate = _endDate;
        }
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        UserPicker = new UserPickerModule();
    }

    function view(ctrl) {
        switch(_state){
            case 'selectUser':
                return m("div", {class: "m-visit-manage", style: "width: 100%; height: 100%;"}, [
                    m("div", {class: "m-visit-manage__tools-container component-container"}, [
                        m("div", {class: "m-visit-manage__tools-hint"}, 'Выберите пользователей и период для просмотра карты визитов'),
                        m("div", {class: "m-visit-manage__datepicker-container"}, [
                            m("div", {class: "m-visit-manage__datepicker input-group input-daterange", config: datePickerRange},
                                m("input", {type: "text", class: "form-control", placeholder: 'Начальная дата', value: (_startDate !== '' ? _startDate : ''), onchange: startDateChanged}),
                                m("span", {class: "input-group-addon"}, ' - '),
                                m("input", {type: "text", class: "form-control", placeholder: 'Конечная дата', value: (_endDate !== '' ? _endDate : ''), onchange: endDateChanged})
                            )
                        ]),
                        m("button", {class: "m-visit-manage__show-visits-btn btn btn-system btn-system-primary", onclick: showVisits}, 'Показать')
                    ]),
                    m("div", {class: "m-visit-manage__module-container"}, [
                        UserPicker
                    ]),
                    _InfoModal
                ])
            break;
            case 'visitmap':
                return m("div", {class: "m-visit-manage", style: "width: 100%; height: 100%;"}, [
                    m("div", {class: "m-visit-manage__tools-container component-container"}, [
                        m("button", {class: "m-visit-manage__user-picker-step-btn btn btn-link btn-system-link", onclick: toStep1}, 'Выбор торгового представителя'),
                        m("div", {class: "m-visit-manage__datepicker-container"}, [
                            m("div", {class: "m-visit-manage__datepicker input-group input-daterange", config: datePickerRange},
                                m("input", {type: "text", class: "form-control", placeholder: 'Начальная дата', value: (_startDate !== '' ? _startDate : ''), onchange: startDateChanged}),
                                m("span", {class: "input-group-addon"}, ' - '),
                                m("input", {type: "text", class: "form-control", placeholder: 'Конечная дата', value: (_endDate !== '' ? _endDate : ''), onchange: endDateChanged})
                            )
                        ]),
                        m("button", {class: "m-visit-manage__show-visits-btn btn btn-system btn-system-primary", onclick: showVisits}, 'Показать')
                    ]),
                    m("div", {class: "m-visit-manage__module-container"}, [
                        VisitMap
                    ]),
                    _InfoModal
                ])
            break;

        }
    }

    return{
        controller: controller,
        view: view
    }
};