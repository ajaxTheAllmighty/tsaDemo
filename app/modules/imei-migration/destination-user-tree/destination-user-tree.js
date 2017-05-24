'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
module.exports = function () {
    var id;
    var tableName;
    var codeField;
    var titleField;
    var parentField;
    var rootNode;
    var mode;
    var onSelect;
    var selectItem = false;

    var _currentScrollPosition = 0;
    var _state = "default";
    var _openedNodes = [];
    var _loadedNodes = [];
    var _nodesToLoad = 0;
    var _nodesloaded = 0;
    var _allNodes = [];
    var _allNodesAssocArray = {};
    var _parentsNodes = {};
    var _nodeSearchText = m.prop('');
    var _openedBySearchNodes = [];
    var _searchedNodes = [];

    function loadAllNodes(){
        Helper.getData(allNodesLoaded, {"context": this, "module": "Tree Component", "function": "loadAllNodes"}, '*', tableName, "WHERE "+parentField+" IN ("+Globals.getUserHierarchy()+")");
    }

    function allNodesLoaded(allNodes){
        _allNodes = allNodes;
        prepareParentsNodes();
    }

    function prepareParentsNodes(){
        for (var i = 0; i < _allNodes.length; i++) {
            _parentsNodes[_allNodes[i][codeField]] = [_allNodes[i][parentField]];
            _allNodesAssocArray[_allNodes[i][codeField]] = _allNodes[i];
        }
        prepareData();
    }

    function prepareData(rootId){
        if(typeof rootId == 'undefined'){
            rootId = rootNode[codeField];
        }

        if(!_loadedNodes.hasOwnProperty(rootId)){
            _loadedNodes[rootId] = [];
        }

        for (var i = 0; i < _allNodes.length; i++) {
            if(_allNodes[i][parentField] == rootId){
                _loadedNodes[rootId].push(_allNodes[i]);
                //save full tree path for node
                //merge current node's parent and parent's parent array
                if(_parentsNodes.hasOwnProperty(_allNodes[i][parentField])){
                    _parentsNodes[_allNodes[i][codeField]] = _parentsNodes[_allNodes[i][codeField]].concat(_parentsNodes[_allNodes[i][parentField]]);
                }
                prepareData(_allNodes[i][codeField]);
            }
        }
    }

    function showTree(rootObj){
        var isSelected = false;
        var isSearching = false;

        if(typeof rootObj == "undefined"){
            rootObj = rootNode;
        }
        var imeiCount = (rootObj.hasOwnProperty('IMEI_COUNT') ? rootObj['IMEI_COUNT'] : 0);
        var imei = (rootObj['IME_INVENTORY'] == null ? '' : (rootObj['IME_INVENTORY'] != '' ? ' ('+rootObj['IME_INVENTORY']+')' : t('noInventoryNumberLabel', 'IM_DestinationUserTreeModule')));
        if(selectItem && selectItem.code == rootObj[codeField]){
            isSelected = true;
        }

        if(_searchedNodes.indexOf(rootObj[codeField]) != -1){
            isSearching = true;
        }

        var allOpenedNodes = _openedNodes.concat(_openedBySearchNodes);
        if(allOpenedNodes.indexOf(rootObj[codeField]) != -1){
            var childrenCount = _loadedNodes[rootObj[codeField]].length;
            return m("li", {}, [
                m("span", {class: (childrenCount > 0 ? "tree-component_opened-node": "tree-component_empty-node"), "data-code": rootObj[codeField], onclick: closeNode}, (childrenCount > 0 ? "-": "")),
                m("div", {class: "tree-node"+(isSearching ? ' tree-node__searching' : '')+(isSelected ? " tree-node__selected" : ""), "data-code": rootObj[codeField], "data-title": rootObj[titleField], onclick: selectNode}, [
                    rootObj[titleField]+(imeiCount > 0 ? t('deviceCountLabel', 'IM_DestinationUserTreeModule', {imeiCount: imeiCount}) : ''),
                    imei
                ]),
                m("ul", {}, [
                    childrenCount > 0 ?
                        _loadedNodes[rootObj[codeField]].map(function(childObj, index){
                            return showTree(childObj)
                        }) : ''
                ])
            ])
        }else{
            return m("li", {}, [
                m("span", {class: "tree-component_closed-node", "data-code": rootObj[codeField], onclick: openNode}, '+'),
                m("div", {class: "tree-node"+(isSearching ? ' tree-node__searching' : '')+(isSelected ? " tree-node__selected" : ""), "data-code": rootObj[codeField], "data-title": rootObj[titleField], onclick: selectNode}, [
                    rootObj[titleField]+(imeiCount > 0 ? t('deviceCountLabel', 'IM_DestinationUserTreeModule', {imeiCount: imeiCount}) : ''),
                    imei
                ])
            ])
        }
    }

    function selectNode(){
        _currentScrollPosition = document.getElementById("destUserTree-"+id).scrollTop;
        var nodeCode = parseInt(this.getAttribute('data-code'));
        var nodeTitle = this.getAttribute('data-title');
        if(selectItem.code == nodeCode){
            selectItem = false;
        }else{
            selectItem = {code: nodeCode, title: nodeTitle};
        }
        onSelect(selectItem);
    }

    function loadChildren(root){
        Helper.getDataEx(childrenLoaded, {root: root},{"context": this, "module": "Tree Component", "function": "loadChildren"}, '*', tableName, "WHERE "+parentField+" = '"+root+"'");
    }

    function childrenLoaded(data, params){
        _loadedNodes[params.root] = data;
        _state = 'default';
        m.redraw();
    }

    function openNode(){
        _currentScrollPosition = document.getElementById("destUserTree-"+id).scrollTop;
        var rootCode = parseInt(this.getAttribute('data-code'));
        if(!_loadedNodes.hasOwnProperty(rootCode)){
            console.log('load children');
            _state = 'loading';
            loadChildren(rootCode);
        }
        _openedNodes.push(rootCode);
    }

    function closeNode(){
        _currentScrollPosition = document.getElementById("destUserTree-"+id).scrollTop;
        var rootCode = parseInt(this.getAttribute('data-code'));
        if(_openedNodes.indexOf(rootCode) != -1){
            _openedNodes.splice(_openedNodes.indexOf(rootCode), 1);
        }
    }

    function refresh(){
        _state = 'loading';
        _nodesloaded = 0;
        _nodesToLoad = Object.keys(_loadedNodes).length;
        for(var rootCode in _loadedNodes){
            Helper.getDataEx(updateNode, {root: rootCode},{"context": this, "module": "Tree Component", "function": "refresh"}, '*', tableName, "WHERE "+parentField+" = '"+rootCode+"'");
        }
    }

    function refreshNode(nodeId){
        _state = 'loading';
        Helper.getDataEx(nodeRefreshed, {nodeId: nodeId},{"context": this, "module": "Tree Component", "function": "refreshNode"}, '*', tableName, "WHERE "+codeField+" = '"+nodeId+"'");
    }

    function nodeRefreshed(data, params){
        //shame shit
        //i did my best
        var nodeNewData = data[0];
        var nodeObj = _allNodesAssocArray[params.nodeId];
        var nodeParent = nodeObj[parentField];
        //search in tree node with needed id and update it
        for (var i = 0; i < _loadedNodes[nodeParent].length; i++) {
            var childNode = _loadedNodes[nodeParent][i];
            if(childNode[codeField] == params.nodeId){
                _loadedNodes[nodeParent][i] = nodeNewData;
            }
        }
        _state = 'default';
        m.redraw();
    }

    function updateNode(data, params){
        _loadedNodes[params.root] = data;
        _nodesloaded++;
        if(_nodesToLoad == _nodesloaded){
            _state = 'default';
            m.redraw();
        }
    }

    function openSearchedNodes(nodeId){
        _openedBySearchNodes = _openedBySearchNodes.concat(_parentsNodes[nodeId]);
    }

    function searchNodes(){
        _searchedNodes = [];
        _openedBySearchNodes = [];
        _nodeSearchText(this.value);
        if(_nodeSearchText() != ''){
            var regExp = new RegExp(_nodeSearchText(),"i");
            for (var i = 0; i < _allNodes.length; i++) {
                if(_allNodes[i][titleField] != null && _allNodes[i][titleField].search(regExp) != -1){
                    _searchedNodes.push(_allNodes[i][codeField]);
                    openSearchedNodes(_allNodes[i][codeField]);
                }
            }
        }
    }
    

    
    ///////////////////////////////////////////////////
    //      COMPONENT CONTROLLER AND VIEW METHODS    //
    ///////////////////////////////////////////////////

    function controller(config) {
        id = config.id || false;
        tableName = config.tableName || false;
        codeField = config.codeField || false;
        titleField = config.titleField || false;
        parentField = config.parentField || false;
        rootNode = config.root || false;
        mode = config.mode || "ajax";
        onSelect = config.onSelect || function(){console.log(selectItem)};
        loadAllNodes();
    }

    function view() {
        switch(_state){
            case 'default':
                return m("div", {class: "dest-user-component", id: "destUserTree-"+id, config: function(el){el.scrollTop = _currentScrollPosition;}}, [
                    m("div", {class: "inner-addon right-addon"}, [
                        m("i", {class: "glyphicon glyphicon-search"}),
                        m("input", {type: "text", class: "form-control", oninput: searchNodes, value: _nodeSearchText(), placeholder: t('searchPlaceholder', 'IM_DestinationUserTreeModule')}),
                    ]),
                    m("ul", [
                        showTree()
                    ])
                ]);
            break;
            case 'loading':
                return m("div", {}, "Loading...")
            break;
        }
    }

    return{
        controller: controller,
        view: view,
        refresh: refresh,
        refreshNode: refreshNode
    }
};