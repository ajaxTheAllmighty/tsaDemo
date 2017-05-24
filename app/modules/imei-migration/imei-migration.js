'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
var CardModule = require('../../modules/core/card/card.js');
var ImeiSearchComponent = require('./imei-search/imei-search.js');
var DestinationUserTreeComponent = require('./destination-user-tree/destination-user-tree.js');
var SourceImeiTreeComponent = require('./source-user-tree/source-user-tree.js');
module.exports = function () {
    var state = 'default';
    var selectedItemsCount = 0;
    var selectedItemsList = {};
    var destinationUser = false;

    var destUserTree;
    var sourceImeiTree;
    var imeiSearch;

    var _infoModalHeader = '';
    var _infoModalMessages = [];
    var _rowToInsertTmpImei;
    var _rowInsertedTmpImei;
    var _userTreeFullscreen = false;
    var _imeiSelectType = 'search';

    var _userCard = new CardModule;
    var _cardView = 'VIEW_ST_USER';
    var _cardPrimaryKeyObject = {COLUMN_NAME: 'USE_CODE', FIL_TABLE_NAME: 'ST_USER'};

    function tmpRowInserted(){
        _rowInsertedTmpImei++;
        //all rows inserted
        if( _rowInsertedTmpImei == _rowToInsertTmpImei){
            startMigrateProcedure();
        }
    }

    function startMigrateProcedure(){
        Helper.execQuery(migrateCompleted,  {"context": this, "module": "Imei Migration module", "function": "startMigrateProcedure"}, 'EXEC MIGRATE_IMEI @IN_USE_CODE = '+Globals.getUserData()['USE_CODE']+', @IN_DEST_USE_CODE='+destinationUser.code);
    }

    function migrateCompleted(){
        $('#migrationConfirmModal').modal('hide');
        showInfoModal(t('migrateModalHeader', 'ImeiMigrationModule'), [t('migrateModalHeader', 'migrateModalSuccessMessage')]);
        selectedItemsList = {};
        imeiSearch.clean();
        sourceImeiTree.clean();
        sourceImeiTree.refresh();
        destUserTree.refresh();
        m.redraw();
    }

    function clearTmpImeiTable(){
        Helper.execQuery(tmpImeiTableCleared,  {"context": this, "module": "Imei Migration module", "function": "clearTmpImeiTable"}, 'EXEC CLEAR_TMP_IMEI @IN_USE_CODE = '+Globals.getUserData()['USE_CODE']);
    }

    function tmpImeiTableCleared(){
        var imeiList = Helper.objectToArray(selectedItemsList);
        _rowToInsertTmpImei = imeiList.length;
        _rowInsertedTmpImei = 0;
        for (var i = 0; i < imeiList.length; i++) {
            var imeiObj = imeiList[i];
            Helper.insertData(tmpRowInserted, {"context": this, "module": "Imei Migration module", "function": "tmpImeiTableCleared"}, "TMP_MIGRATE_IMEI", 'TMI_USE_CODE, TMI_IMEI_CODE', Globals.getUserData()['USE_CODE']+','+imeiObj['IME_CODE']);
        }
    }

    function tryMigrate(){
        var error = false;
        var errorMessages = [];

        if(_imeiSelectType == 'search'){
            selectedItemsList = imeiSearch.getItemList();
            console.log(selectedItemsList);
        }else{
            selectedItemsList = sourceImeiTree.getItemList();
            console.log(selectedItemsList);
        }

        if(Helper.objectToArray(selectedItemsList).length < 1){
            error = true;
            errorMessages.push(t('migrateModalErrorNoDevice', 'ImeiMigrationModule'));
        }

        if(!destinationUser){
            error = true;
            errorMessages.push(t('migrateModalErrorNoUser', 'ImeiMigrationModule'));
        }

        if(error){
            showInfoModal(t('migrateModalErrorHeader', 'ImeiMigrationModule'), errorMessages);
        }else{
            showConfirmModal();
        }
    }

    function migrate(){
        clearTmpImeiTable();
    }

    function showInfoModal(header, messages){
        _infoModalHeader = header;
        _infoModalMessages = messages;
        $('#migrationInfoModal').modal('show');
    }

    function showConfirmModal(){
        $('#migrationConfirmModal').modal('show');
    }

    function changeUserTreeView(){
        _userTreeFullscreen = !_userTreeFullscreen;
    }

    function toogleType(){
        if(_imeiSelectType == 'search'){
            imeiSearch.clean();
            _imeiSelectType = 'tree';
        }else{
            _imeiSelectType = 'search';
            sourceImeiTree.clean();
        }
        selectedItemsCount = 0;
    }

    //CARD SUBMODULE
    function editUserCard(){
        var key = destinationUser['code'];
        _userCard = new CardModule;
        _userCard.load({
            id: 'treeCard-'+Globals.registerModule('card'),
            viewPrimaryKeyValue: key,
            view: _cardView,
            viewPrimaryKeyObject: _cardPrimaryKeyObject,
            state: 'loading',
            onCardSave: function () {
                destUserTree.refreshNode(key);
            }
        });
    }

    function createUserCard(){
        _userCard = new CardModule;
        _userCard.load({
            id: 'treeCard-'+Globals.registerModule('card'),
            view: _cardView,
            viewPrimaryKeyObject: _cardPrimaryKeyObject,
            state: 'loading',
            mode: 'create',
            onCardSave: function () {
                //refreshNode(key);
            }
        });
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        imeiSearch = new ImeiSearchComponent;
        destUserTree = new DestinationUserTreeComponent;
        sourceImeiTree = new SourceImeiTreeComponent;
        var destTreeConfig = {
            id: Globals.registerModule('DestinationUserTreeComponent'),
            tableName: "VIEW_ST_IMEI_INFO",
            codeField: "USE_CODE",
            titleField: "USE_NAME",
            parentField: "USE_PARENT_CODE",
            root: {"USE_CODE": Globals.getUserData()['USE_CODE'], "USE_NAME": Globals.getUserData()['USE_NAME']},
            mode: "ajax",
            onSelect: function(selectedObj){
                destinationUser = selectedObj;
            }
        };
        var sourceTreeConfig = {
            id: Globals.registerModule('SourceImeiTreeComponent'),
            tableName: "VIEW_ST_IMEI_INFO",
            codeField: "USE_CODE",
            titleField: "USE_NAME",
            parentField: "USE_PARENT_CODE",
            root: {"USE_CODE": Globals.getUserData()['USE_CODE'], "USE_NAME": Globals.getUserData()['USE_NAME']},
            mode: "ajax",
            onSelect: function(count){
                selectedItemsCount = count;
            }
        };

        var imeiSearchConfig = {
            onAddRemove: function(count){
                selectedItemsCount = count;
            }
        }
        return {
            destinationTree: m.component(destUserTree, destTreeConfig),
            sourceTree: m.component(sourceImeiTree, sourceTreeConfig),
            imeiSearch: m.component(imeiSearch, imeiSearchConfig)
        }
    }

    function view(ctrl){
        switch (state){
            case 'loading':
                return m("div", {}, "Loading...");
            break;
            case "default":
                return m("div", {class: "m-imei-migration"}, [
                    //left part
                    m("div", {class: "migration_choose-container" + (_userTreeFullscreen ? '__hidden' : '')}, [
                        m("div", {class: "imei-type-toogle component-container"}, [
                            m("button", {class: "btn btn-link btn-system-link"+(_imeiSelectType == 'search' ? ' active' : ''), onclick: (_imeiSelectType == 'tree' ? toogleType : null)}, t('searchByInventoryNumberBtn', 'ImeiMigrationModule')),
                            m("span", {class: "choose-type__delimiter"}, ' / '),
                            m("button", {class: "btn btn-link btn-system-link"+(_imeiSelectType == 'tree' ? ' active' : ''), onclick: (_imeiSelectType == 'search' ? toogleType : null)}, t('chooseFromTreeBtn', 'ImeiMigrationModule')),
                            m("button", {class: "imei-migrate-btn btn btn-system btn-success", onclick: tryMigrate}, t('migrateBtn', 'ImeiMigrationModule')+(selectedItemsCount > 0 ? " ("+selectedItemsCount+")" : ""))
                        ]),
                        m("div", {class: "component-container imei-source-container"}, [
                            (_imeiSelectType == 'search' ? ctrl.imeiSearch : ctrl.sourceTree),
                        ]),
                    ]),
                    //right part
                    m("div", {class: "migration-tree" + (_userTreeFullscreen ? '__full' : '')},
                        m("div", {class: "component-container"}, [
                            m("button", {class: "btn btn-link btn-system-link", onclick: changeUserTreeView}, (_userTreeFullscreen ? t('normalScreenBtn', 'ImeiMigrationModule') : t('fullScreenBtn', 'ImeiMigrationModule'))),
                            (destinationUser != false ?
                                m("div", {class: "imei-migration__user-control-container"}, [
                                    m("button", {class: "btn btn-system btn-system-primary imei-migration__edit-user-btn", onclick: editUserCard}, t('editUserBtn', 'ImeiMigrationModule')),
                                    m("button", {class: "btn btn-system btn-system-primary imei-migration__create-user-btn", onclick: createUserCard}, t('createUserBtn', 'ImeiMigrationModule')),
                                ]) : ''
                            )
                        ]),
                        m("div", {class: "tree-component-container component-container"},[
                            ctrl.destinationTree
                        ])
                    ),

                    //modals
                    m("div", {class: "dest-user-component_sub-modules"}, [
                        m.component(_userCard)
                    ]),
                    m("div", {class: "migration_modal-container"}, [
                        m("div", {class: "modal fade migration-confirm-modal", id: "migrationConfirmModal", tabindex: "-1", role: "dialog"},
                            m("div", {class: "modal-dialog"},
                                m("div", {class: "modal-content"}, [
                                    m("div", {class: "modal-header"}, [
                                        m("button", {type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"}, m.trust("&times;")),
                                        m("h4", {class: "modal-title"}, t('migrateModalHeader', 'ImeiMigrationModule'))
                                    ]),
                                    m("div", {class: "modal-body"},
                                        m("p", t('migrateModalConfirmMessage', 'ImeiMigrationModule', {user: destinationUser.title}))
                                    ),
                                    m("div", {class: "modal-footer"}, [
                                        m("button", {type: "button", class: "btn btn-system btn-system-cancel", "data-dismiss":"modal"}, t('migrateModalCancelBtn', 'ImeiMigrationModule')),
                                        m("button", {type: "button", class: "btn btn-system btn-system-primary", onclick: migrate}, t('migrateModalConfirmBtn', 'ImeiMigrationModule')),
                                    ])
                                ])
                            )
                        ),
                        m("div", {class: "modal fade b-info-modal", id: "migrationInfoModal", tabindex: "-1", role: "dialog"},
                            m("div", {class: "modal-dialog"},
                                m("div", {class: "modal-content"}, [
                                    m("div", {class: "modal-header"}, [
                                        m("button", {type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"}, m.trust("&times;")),
                                        m("h4", {class: "modal-title"}, _infoModalHeader)
                                    ]),
                                    m("div", {class: "modal-body"},[
                                        _infoModalMessages.map(function(message, index){
                                            return m("p", {}, message)
                                        })
                                    ]),
                                    m("div", {class: "modal-footer"}, [
                                        m("button", {type: "button", class: "btn btn-system btn-system-primary", "data-dismiss":"modal"}, t('okBtn', 'App')),
                                    ])
                                ])
                            )
                        )
                    ])
                ])
            break;
            default :
                return m("div", {class: "default-state"});
            break;
        }
    }

    return{
        controller: controller,
        view: view
    }
};