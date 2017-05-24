'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var TableComponent = require('../../../components/table/table.js');
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function (config) {
    var _SourceGrid = '';
    var _DestTable = '';
    var _InfoModal = '';
    var _selectedUsersCount = 0;

    var UserModel = {
        columns: [
            {name: 'code', title: 'Код', width: '30%'},
            {name: 'name', title: 'Имя ТП', width: '70%'}
        ],
        users: [],
        addUser: function(obj){
            UserModel.users.push({
                key: obj['USE_CODE'],
                code: obj['USE_CODE'],
                name: obj['USE_NAME']
            })
        },
        removeUser: function(index){
            UserModel.users.splice(index,1);
        }
    };

    function moveUsers(){
        if(_SourceGrid.getSelectedRows().length){
            Helper.getData(usersDataLoaded, {"context": this, "module": "VM-UserPickerModule", "function": "moveUsers"}, 'USE_CODE, USE_NAME', 'ST_USER', "WHERE USE_CODE IN ("+_SourceGrid.getSelectedRows().join(',')+")");
        }else{
            _InfoModal = new Modal({
                id: 'visitManageModal',
                state: 'show',
                content: [
                    'Выберите пользователей в таблице-"источнике" в левой части экрана.'
                ],
                isStatic: false,
                header: 'Ошибка',
                isFooter: true,
                isFullScreen: false,
                modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                zIndex: 1005,
                confirmBtn: 'Ок',
                cancelBtn: 'none',
                onConfirm: function(){
                    _InfoModal = '';
                }
            });
        }
    }

    function usersDataLoaded(data){
        var usersToExclude = [];
        data.map(function(userObj){
            UserModel.addUser(userObj);
        });

        UserModel.users.map(function(userObj){
            usersToExclude.push(userObj.key);
        });

        _SourceGrid.refresh({
            staticFilters: {
                1: {
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "notIn",
                    fieldTitle: '',
                    fieldName: "USE_CODE",
                    filterField: "USE_CODE",
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: usersToExclude.join(',')
                }
            }
        });
    }

    function removeUsers(){
        var userIndex = _DestTable.getSelectedRows().indexArray;
        userIndex.sort(function(a, b){return b-a});
        userIndex.map(function(index){
            UserModel.removeUser(index);
        });

        var usersToExclude = [];
        UserModel.users.map(function(userObj){
            usersToExclude.push(userObj.key);
        });

        _selectedUsersCount = 0;
        _DestTable.uncheckAll();
        if(UserModel.users.length > 0){
            _SourceGrid.refresh({
                staticFilters: {
                    1: {
                        isHidden: true,
                        andOrCondition: "AND",
                        condition: "notIn",
                        fieldTitle: '',
                        fieldName: "USE_CODE",
                        filterField: "USE_CODE",
                        id: "1",
                        isGroupCondition: true,
                        type: "INT",
                        value: usersToExclude.join(',')
                    }
                }
            });
        }else{
            _SourceGrid.refresh({
                staticFilters: {
                    1: {
                        isHidden: true,
                        andOrCondition: "AND",
                        condition: "equal",
                        fieldTitle: '',
                        fieldName: "1",
                        filterField: "1",
                        id: "1",
                        isGroupCondition: true,
                        type: "INT",
                        value: 1
                    }
                }
            });
        }
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        _SourceGrid = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: "grid",
            allowNew: false,
            gridView: "VIEW_ST_USER",
            perPage: 50,
            showSelectColumn: true
        });

        if(UserModel.users.length > 0){
            var usersToExclude = [];

            UserModel.users.map(function(userObj){
                usersToExclude.push(userObj.key);
            });

            _SourceGrid.refresh({
                staticFilters: {
                    1: {
                        isHidden: true,
                        andOrCondition: "AND",
                        condition: "notIn",
                        fieldTitle: '',
                        fieldName: "USE_CODE",
                        filterField: "USE_CODE",
                        id: "1",
                        isGroupCondition: true,
                        type: "INT",
                        value: usersToExclude.join(',')
                    }
                }
            });
        }

        _DestTable = new TableComponent({
            columns: UserModel.columns,
            data:UserModel.users,
            isFlat: true,
            isSelectColumn: true,
            onCheck: function(count){
                _selectedUsersCount = count;
                m.redraw();
            }
        });
    }

    function view() {
        return m("div", {class: "VM_user-select"}, [
            m("div", {class: "VM_user-select__source-grid-container"}, [
                _SourceGrid
            ]),
            m("button", {class: "btn btn-default VM_user-select__move-user-btn", onclick: moveUsers}, '>>'),
            m("div", {class: "VM_user-select__dest-table-container component-container"}, [
                m("div", {class: "VM_user-select__dest-table-tools", style: "width: 100%; height: 30px; margin-bottom: 10px;"}, [
                    'Кол-во пользователей: ' + UserModel.users.length,
                    _selectedUsersCount > 0 ?
                        m("button", {class: "VM_user-select__remove-user-btn btn btn-system btn-danger", onclick: removeUsers}, 'Удалить ('+_selectedUsersCount+')') :
                        m("button", {class: "VM_user-select__remove-user-btn btn btn-system btn-danger", disabled: true}, 'Удалить')
                ]),
                m("div", {class: "VM_user-select__dest-table-component-container", style: "width: 100%; height: calc(100% - 40px);"}, [
                    _DestTable
                ])
            ]),
            _InfoModal
        ])
    }

    return {
        controller: controller,
        view: view,
        getUsers: function(){
            return UserModel.users;
        }
    }
}