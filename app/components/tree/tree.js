'use strict';
var m = require('mithril');
var Helper = require('../helper.js');
module.exports = function () {
    var tableName;
    var codeField;
    var titleField;
    var parentField;
    var root;
    var mode;
    var onSelect;
    
    var _selectItem = false;
    var _state = "default";
    var _openedNodes = [];
    var _loadedNodes = [];

    function showTree(rootObj){
        var isSelected = false;
        if(typeof rootObj == "undefined"){
            rootObj = root;
        }

        if(_selectItem && _selectItem.code == rootObj[codeField]){
            isSelected = true;
        }

        if(_openedNodes.indexOf(rootObj[codeField]) != -1){
            var childrenCount = _loadedNodes[rootObj[codeField]].length;
            return m("li", {}, [
                m("span", {class: (childrenCount > 0 ? "tree-component_opened-node": "tree-component_empty-node"), "data-code": rootObj[codeField], onclick: closeNode}, (childrenCount > 0 ? "-": "")),
                m("div", {class: "tree-node"+(isSelected ? " tree-node__selected" : ""), "data-code": rootObj[codeField], "data-title": rootObj[titleField], onclick: selectNode}, [
                    rootObj[titleField]
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
                m("div", {class: "tree-node"+(isSelected ? " tree-node__selected" : ""), "data-code": rootObj[codeField], "data-title": rootObj[titleField], onclick: selectNode}, [
                    rootObj[titleField]
                ])
            ])
        }
    }

    function selectNode(){
        var nodeCode = parseInt(this.getAttribute('data-code'));
        var nodeTitle = this.getAttribute('data-title');
        _selectItem = {code: nodeCode, title: nodeTitle};
        onSelect(_selectItem);
    }

    function openNode(){
        var rootCode = parseInt(this.getAttribute('data-code'));
        if(!_loadedNodes.hasOwnProperty(rootCode)){
            _state = 'loading';
            loadChildren(rootCode);
        }
        _openedNodes.push(rootCode);
    }

    function closeNode(){
        var rootCode = parseInt(this.getAttribute('data-code'));
        if(_openedNodes.indexOf(rootCode) != -1){
            _openedNodes.splice(_openedNodes.indexOf(rootCode));
        }
    }

    function loadChildren(root){
        Helper.getDataEx(childrenLoaded, {root: root},{"context": this, "module": "Tree Component", "function": "loadChildren"}, codeField+', '+titleField, tableName, "WHERE "+parentField+" = '"+root+"'");
    }

    function childrenLoaded(data, params){
        _loadedNodes[params.root] = data;
        _state = 'default';
        m.redraw();
    }

    ///////////////////////////////////////////////////
    //      COMPONENT CONTROLLER AND VIEW METHODS    //
    ///////////////////////////////////////////////////

    function controller(config) {
        tableName = config.tableName || false;
        codeField = config.codeField || false;
        titleField = config.titleField || false;
        parentField = config.parentField || false;
        root = config.root || false;
        mode = config.mode || "ajax";
        onSelect = config.onSelect || function(){console.log(_selectItem)};
    }

    function view() {
        switch(_state){
            case 'default':
                return m("div", {class: "tree-component"}, [
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
        view: view
    }
};