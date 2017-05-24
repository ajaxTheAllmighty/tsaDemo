'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
var Modal = require('../../components/modal-window/modal-window.js');
var TaskPicker = require('./steps/task-picker.js');
var UserSalepointManage = require('./steps/user-salepoint-manage.js');

module.exports = function () {
    var _state = 'taskPicker';
    var _task = false;
    var redrawCount = 0;
    var _modalWindow = '';
    //Step 1
    var _taskPicker;
    //Step 2
    var _taskManage;
    var _mode;

    function toStep1(){
        _task = false;
        _taskPicker = new TaskPicker({
            onTaskSelect: function(task){
                _task = task;
                toStep2();
                m.redraw();
            }
        });
        _state = 'taskPicker';
    }

    function toStep2(){
        _taskManage = new UserSalepointManage({
            task: _task,
            onModeChange: function(mode){
                _mode = mode;
            }
        });
        _state = 'taskManage';
    }

    function changeMode(){
        redrawCount++;
        var newMode = this.value;
        _modalWindow = new Modal({
            id: 'taskManageWarningModal',
            state: 'show',
            content: [
                'Задача может быть назначена либо на пользователей, либо на торговые точки. При добавление записей нового типа, старые детали задачи будут удалены.'
            ],
            isStatic: false,
            header: 'Предупреждение!',
            isFooter: true,
            isFullScreen: false,
            modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
            zIndex: 1005,
            confirmBtn: 'Ок',
            cancelBtn: 'Отмена',
            onCancel: function(){
                console.log(_mode);
            },
            onConfirm: function(){
                _mode = newMode;
                _taskManage.changeMode(_mode);
                _modalWindow = '';
            }
        });
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        _taskPicker = new TaskPicker({
            onTaskSelect: function(task){
                _task = task;
                toStep2();
                m.redraw();
            }
        });
    }

    function view(ctrl) {
        console.log('redraw ', _mode);
        switch(_state){
            case 'taskPicker': //Step 1
                return m("div", {class: "m-task-manage"}, [
                    m("div", {class: "m-task-manage__step-menu component-container clearfix"}, [
                        m("button", {class: "btn btn-link btn-system-link active"}, 'Выбор задачи'),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", disabled: "disabled"}, 'Редактирование задачи'),
                    ]),
                    m("div", {class: "m-task-manage__content"}, [
                        _taskPicker
                    ])
                ])
            break;
            case 'taskManage': //Step 2
                return m("div", {class: "m-task-manage"}, [
                    m("div", {class: "m-task-manage__step-menu component-container clearfix"}, [
                        m("button", {class: "btn btn-link btn-system-link", onclick: toStep1}, _task.name),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link active"}, 'Редактирование задачи'),
                        m("div", {class: "m-task-manage__toggle-tool-container"}, [
                            m("label", {for: "taskTypeToggle"}, [
                                'Задача будет назначена на ',
                            ]),
                            m("select", {class: "form-control m-task-manage__task-toggle", id: "taskTypeToggle", onchange: changeMode, key: redrawCount}, [
                                m("option", {value: 'hint', disabled: true, selected: true}, 'Выберите тип'),
                                m("option", {value: 'salepoint', selected: _mode === 'salepoint'}, 'на торговые точки'),
                                m("option", {value: 'user', selected: _mode === 'user'}, 'на пользователей')
                            ])
                        ])
                    ]),
                    m("div", {class: "m-task-manage__content"}, [
                        _taskManage
                    ]),
                    _modalWindow
                ])
            break;
        }
    }

    return{
        controller: controller,
        view: view
    }
};