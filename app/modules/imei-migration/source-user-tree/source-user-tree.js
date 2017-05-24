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

    var _selectedItemsList = {};
    var _selectedItems = [];
    var _dataLoaded = false;
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
        if(!_dataLoaded){
            Helper.getData(allNodesLoaded, {"context": this, "module": "Tree Component", "function": "loadAllNodes"}, '*', tableName, "WHERE "+parentField+" IN ("+Globals.getUserHierarchy()+")");
        }
    }

    function allNodesLoaded(allNodes){
        _dataLoaded = true;
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

    function addRemoveImei(){
        _currentScrollPosition = document.getElementById("sourceImeiTree-"+id).scrollTop;
        var imeiCode = parseInt(this.getAttribute('data-imei'));
        if(this.checked){
            _selectedItems.push(imeiCode);
            _selectedItemsList[imeiCode] = {'IME_CODE' : imeiCode};
        }else{
            var index = _selectedItems.indexOf(imeiCode);
            if(index != -1){
                _selectedItems.splice(index, 1);
            }
            delete _selectedItemsList[imeiCode];
        }
        onSelect(Object.keys(_selectedItemsList).length);
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
        if(typeof rootObj == "undefined"){
            rootObj = rootNode;
        }
        var isSearching = false;
        var imeiCount = (rootObj.hasOwnProperty('IMEI_COUNT') ? rootObj['IMEI_COUNT'] : 0);
        var imei = (rootObj['IME_INVENTORY'] == null ? false : (rootObj['IME_INVENTORY'] != '' ? ' ('+rootObj['IME_INVENTORY']+')' : " (нет инвен-го номера)"));
        var allOpenedNodes = _openedNodes.concat(_openedBySearchNodes);
        var childrenCount = (typeof _loadedNodes[rootObj[codeField]] != 'undefined' ? _loadedNodes[rootObj[codeField]].length : 1);

        if(_searchedNodes.indexOf(rootObj[codeField]) != -1){
            isSearching = true;
        }

        if(allOpenedNodes.indexOf(rootObj[codeField]) != -1){
            return m("li", {}, [
                m("span", {class: (childrenCount > 0 ? "tree-component_opened-node": "tree-component_empty-node"), "data-code": rootObj[codeField], onclick: closeNode}, (childrenCount > 0 ? "-": "")),
                m("div", {class: "tree-node"+(isSearching ? ' tree-node__searching' : ''), "data-code": rootObj[codeField], "data-title": rootObj[titleField]}, [
                    (imei ? m("input", {type: "checkbox", "data-imei":rootObj['IME_CODE'], onchange: addRemoveImei, checked: (_selectedItems.indexOf(rootObj['IME_CODE']) != -1 ? 'checked' : '')}) : ''),
                    rootObj[titleField]+(imeiCount > 0 ? ' (кол-во планшетов: '+imeiCount+')' : ''),
                    (imei ? imei : '')
                ]),
                m("ul", {}, [
                    childrenCount > 0 ?
                        _loadedNodes[rootObj[codeField]].map(function(childObj, index){
                            return showTree(childObj)
                        }) : ''
                ])
            ])
        }else{
            if(typeof _loadedNodes[rootObj[codeField]] == 'undefined'){
                //root node
                //console.log(rootObj[codeField]);
            }
            return m("li", {}, [
                (childrenCount > 0 ? m("span", {class: "tree-component_closed-node", "data-code": rootObj[codeField], onclick: openNode}, "+"): ""),
                m("div", {class: "tree-node"+(isSearching ? ' tree-node__searching' : ''), "data-code": rootObj[codeField], "data-title": rootObj[titleField]}, [
                    m("label", {class: "tree-node__label"+(imei ? ' has-imei' : '')}, [
                        (imei ? m("input", {type: "checkbox", "data-imei":rootObj['IME_CODE'], onchange: addRemoveImei, checked: (_selectedItems.indexOf(rootObj['IME_CODE']) != -1 ? 'checked' : '')}) : ''),
                        rootObj[titleField]+(imeiCount > 0 ? ' (кол-во планшетов: '+imeiCount+')' : ''),
                        (imei ? imei : '')
                    ])
                ])
            ])
        }
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
        _currentScrollPosition = document.getElementById("sourceImeiTree-"+id).scrollTop;
        var rootCode = parseInt(this.getAttribute('data-code'));
        if(!_loadedNodes.hasOwnProperty(rootCode)){
            console.log('load children');
            _state = 'loading';
            loadChildren(rootCode);
        }
        _openedNodes.push(rootCode);
    }

    function closeNode(){
        _currentScrollPosition = document.getElementById("sourceImeiTree-"+id).scrollTop;
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

    function getItemList(){
        return _selectedItemsList;
    }

    function clean(){
        _selectedItems = [];
        _selectedItemsList = {};
        _openedNodes = [];
        _openedBySearchNodes = [];
        _nodeSearchText('');
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
                return m("div", {class: "src-tree-component", id: "sourceImeiTree-"+id, config: function(el){el.scrollTop = _currentScrollPosition;}}, [
                    m("div", {class: "inner-addon right-addon"}, [
                        m("i", {class: "glyphicon glyphicon-search"}),
                        m("input", {type: "text", class: "form-control", oninput: searchNodes, value: _nodeSearchText(), placeholder: "Поиск"}),
                    ]),
                    m("ul", {}, [
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
        clean: clean,
        getItemList: getItemList
    }
};