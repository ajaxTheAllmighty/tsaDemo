'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
var Modal = require('../../components/modal-window/modal-window.js');
module.exports = function () {
    var treeInited = false;
    var _users = [];
    var _state = 'loading';
    var _unsaved = false;
    var _movedUsers = {};
    var _userUpdated = 0;
    var _userToUpdate = 0;
    var _saveErrors = [];
    var _Card = '';
    var _cardHeader = '';
    var _InfoModal = '';

    function loadUsers(){
        Helper.getData(usersLoaded, {"context": this, "module": "User Tree Module", "function": "loadUsers"},
            'USE_CODE, USE_NAME, USE_PARENT_CODE, USE_USR_CODE',
            'VIEW_ST_USER',
            "WHERE USE_CODE IN (" + Globals.getUserHierarchy() +")");
    }

    function usersLoaded(data){
        _users = [];
        data.map(function(userObject, index){
            if(userObject['USE_PARENT_CODE'] === false || userObject['USE_CODE'] == Globals.getUserData()['USE_CODE']){
                _users.push({ id: userObject['USE_CODE'], parent: '#', text: userObject['USE_NAME'], type : setRole(userObject['USE_USR_CODE']) });
            }else{
                _users.push({ id: userObject['USE_CODE'], parent: userObject['USE_PARENT_CODE'], text: userObject['USE_NAME'], type : setRole(userObject['USE_USR_CODE']) });
            }
        })
        _state = 'tree';
        m.redraw();
    }

    function setRole(roleCode){
        return null;
        var role;
        switch(roleCode){
            case 374:
                role = 'admin';
                break;
            case 376:
                role = 'super';
                break;
            case 377:
                role = 'promo';
                break;
            default:
                role = roleCode;
                break;
        }
        return role;
    }

    function initTree(el){
        if(treeInited){return;}

        $("#userTreeContainer").jstree('destroy');
        $("#userTreeContainer")
            .on('move_node.jstree', function (e, data) {
                var userObject = {id: data.node.id, parent: data.parent, name: data.node.text};
                _movedUsers[userObject.id] = userObject;
                _unsaved = true;
                m.redraw();
            })
            .on('changed.jstree', function (e, data) {
                if(data.action == 'select_node' && !isNaN(data.node.id)){
                    var userCode = data.node.id;
                    if(!isNaN(userCode)){
                        _Card = new CardModule;
                        _Card.load({
                            id: 'gridCard-'+Globals.registerModule('card'),
                            viewPrimaryKeyValue: userCode,
                            view: 'VIEW_ST_USER',
                            viewPrimaryKeyObject: {COLUMN_NAME: 'USE_CODE', FIL_TABLE_NAME: 'ST_USER'},
                            state: 'loading',
                            onCardSave: function () {
                                _InfoModal = new Modal({
                                    id: 'surveyInformModal',
                                    state: 'show',
                                    content: t('userModalSuccessMessage', 'UserTreeModule'),
                                    isStatic: false,
                                    header: t('userModalHeader', 'UserTreeModule'),
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
                                m.redraw();
                            },
                            isModal: false
                        });
                        _cardHeader = data.node.text;
                        m.redraw();
                    }
                }
            })
            .jstree({
                "core" : {
                    "animation" : 0,
                    "check_callback" : true,
                    "themes" : {
                        "stripes" : true
                    },
                    "data" : _users
                },
                "types" : {
                    "admin" : {
                        "icon" : "dist/assets/images/js-tree/admin.png"
                    },
                    "super" : {
                        "icon" : "dist/assets/images/js-tree/super.png"
                    },
                    "promo" : {
                        "icon" : "dist/assets/images/js-tree/promo.png"
                    }
                },
                "plugins" : [
                    "dnd",
                    "search",
                    "state",
                    "types",
                    "wholerow"
                ],
                "dnd" : {
                    "copy" : false
                }
            });
        treeInited = true;
    }

    function searchUser(){
        m.redraw.strategy('none');
        $('#userTreeContainer').jstree(true).search(this.value);
    }

    function saveTreeChanges(){
        _userToUpdate = Object.keys(_movedUsers).length;
        _userUpdated = 0;
        console.log('toUpdate', _userToUpdate);
        console.log('updated', _userUpdated);
        for(var userCode in _movedUsers) {
            var treeUserObject = _movedUsers[userCode];
            if( (!isNaN(treeUserObject.id) && !isNaN(treeUserObject.parent)) || (!isNaN(treeUserObject.id) && treeUserObject.parent == '#')){
                if(treeUserObject.parent != '#'){
                    Helper.updateData(userMoved, {"context": this, "module": "User Tree Module", "function": "saveTreeChanges"}, "USE_PARENT_CODE = '" + treeUserObject.parent + "'", "ST_USER", "USE_CODE=" + treeUserObject.id);
                }
            }else{
                _saveErrors.push(treeUserObject);
                userMoved();
            }
        }
    }

    function userMoved(){
        _userUpdated++;
        console.log(_userToUpdate,_userUpdated);
        if(_userToUpdate === _userUpdated){
            var content = '';
            if(_saveErrors.length === 0){
                content = t('infoModalSuccessMessage', 'UserTreeModule');
            }else{
                content = [
                    t('infoModalErrorMessage', 'UserTreeModule'),
                    _saveErrors.map(function(user, index){
                        return m("p", {}, t('infoModalErrorDetail', 'UserTreeModule', {user: user.name}))
                    })
                ];
            }
            _InfoModal = new Modal({
                id: 'surveyInformModal',
                state: 'show',
                content: content,
                isStatic: false,
                header: t('infoModalHeader', 'UserTreeModule'),
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
            _movedUsers = {};
            _unsaved = false;
            treeInited = false;
            loadUsers();
        }
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        loadUsers();
    }

    function view(){
        switch(_state){
            case 'loading':
                return m("div", {class: "class: m-user-tree"},
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
                )
            break;
            case 'tree':
                return m("div", {class: "m-user-tree"}, [
                    m("div", {class: "m-user-tree__tree-part"}, [
                        m("div", {class: "m-user-tree__tree-tools component-container"}, [
                            m("div", {class: "inner-addon right-addon m-user-tree__tree-user-search-container"}, [
                                m("i", {class: "glyphicon glyphicon-search"}, ''),
                                m("input", {type: "text", class: "form-control", placeholder: t('searchPlaceholder', 'UserTreeModule'), oninput: searchUser})
                            ]),
                            m("button", {class: "btn btn-system btn-success m-user-tree__save-tree-btn", disabled: !_unsaved, onclick: saveTreeChanges}, t('saveChangesBtn', 'UserTreeModule'))
                        ]),
                        m("div", {class: "m-user-tree__tree-container component-container", id: "userTreeContainer", config: initTree}, '')
                    ]),
                    m("div", {class: "m-user-tree__card-container component-container"}, [
                        m("h3", {class: "m-user-tree__card-header"}, t('cardHeader', 'UserTreeModule', {user: _cardHeader})),
                        _Card
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