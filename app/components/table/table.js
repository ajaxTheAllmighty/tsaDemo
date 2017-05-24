'use strict';
var m = require('mithril');
module.exports = function (config) {
    var _state = 'default';
    var columns = config.columns;
    var isFlat = config.isFlat || false;
    var data = config.data || [];
    var isSelectColumn = config.isSelectColumn || false;
    var style = config.style || false;
    var tableClass = config.tableClass || 'table-bordered table-striped';
    var onCheck = config.onCheck || function(){};
    var onClick = config.onClick || false;

    var _lastSelectedRow = false;
    var _shiftPressed = false;
    var _selectedRows = [];
    var _selectedRowsIndex = [];
    var _indexKeyArray = {};
    var _mainCheckboxChecked = false;

    function selectTableRow() {
        var key = parseInt(this.getAttribute('data-key'));
        var rowIndex = parseInt(this.getAttribute('data-index'));
        if (!_shiftPressed) {
            _lastSelectedRow = rowIndex;
            if (this.checked) {
                _selectedRows.push(key);
                _selectedRowsIndex.push(rowIndex);
            } else {
                var indexS = _selectedRows.indexOf(key);
                if (indexS !== -1) {
                    _selectedRows.splice(indexS, 1);
                }

                var index = _selectedRowsIndex.indexOf(rowIndex);
                if (index !== -1) {
                    _selectedRowsIndex.splice(index, 1);
                }
            }
        } else {
            var start = rowIndex;
            var end = _lastSelectedRow;
            if (rowIndex > _lastSelectedRow) {
                start = _lastSelectedRow;
                end = rowIndex;
            }

            for (var i = start; i < end + 1; i++) {
                var key = _indexKeyArray[i];
                //check all
                if (this.checked) {
                    if (_selectedRows.indexOf(key) === -1) {
                        _selectedRows.push(key);
                    }

                    if (_selectedRowsIndex.indexOf(i) === -1) {
                        _selectedRowsIndex.push(i);
                    }
                } else {
                    var indexS = _selectedRows.indexOf(key);
                    if (indexS !== -1) {
                        _selectedRows.splice(indexS, 1);
                    }

                    var index = _selectedRowsIndex.indexOf(i);
                    if (index !== -1) {
                        _selectedRowsIndex.splice(index, 1);
                    }
                }
            }
            m.redraw();
        }
        _mainCheckboxChecked = (_selectedRows.length === data.length);
        onCheck(_selectedRows.length);
    }

    function checkUncheckAll(){
        _selectedRows = [];
        _selectedRowsIndex = [];
        if(!_mainCheckboxChecked){
            data.map(function(row, index) {
                _selectedRows.push(row.key);
                _selectedRowsIndex.push(index);
            })
        }
        _mainCheckboxChecked = !_mainCheckboxChecked;
        onCheck(_selectedRows.length);
    }

    function onClickHandler(){
        onClick(this.getAttribute('data-key'));
    }

    function controller() {

    }

    function view(ctrl) {
        switch(_state){
            case 'error':
                return m("div", {}, 'There is no key column!')
            break;
            case 'default':
                var tableConfig = function(el){
                    el.onkeydown = function(e){
                        if(e.keyCode == 16){
                            _shiftPressed = true;
                        }
                    }
                    el.onkeyup = function(e){
                        if(e.keyCode == 16){
                            _shiftPressed = false;
                        }
                    }

                    //fixed header
                    el.addEventListener("scroll",function(){
                        var translate = "translate(0,"+this.scrollTop+"px)";
                        this.querySelector("thead").style.transform = translate;
                    });
                }
                
                return m("div", {class: "table-component", config: tableConfig, style: style ? style : ''}, [
                    m("table", {class: "table " + tableClass}, [
                        m("thead",
                            m("tr", [
                                isSelectColumn ? m("th", {},
                                    m("input", {type: "checkbox", checked: _mainCheckboxChecked, onchange: checkUncheckAll})
                                ) : '',
                                columns.map(function(column){
                                    var width = false;
                                    if(typeof column.width !== 'undefined'){
                                        width = column.width;
                                    }
                                    return m("th", {style: width ? 'width:'+width+' ;' : ''}, column.title)
                                })
                            ])
                        ),
                        m("tbody", [
                            data.map(function(row, index){
                                if(isSelectColumn){
                                    var checked = _selectedRows.indexOf(row.key) != -1 ? "checked" : "";
                                    _indexKeyArray[index] = row.key;
                                }
                                return m("tr", {'data-key': row.key, onclick: (onClick ? onClickHandler : null), class: (onClick ? 'table-component__hover-row' : '')}, [
                                    isSelectColumn ? m("td", {},
                                        m("input", {type: "checkbox", "data-key": row.key, "data-index": index, checked: checked, onchange: selectTableRow})
                                    ) : '',
                                    isFlat ?
                                        //flat data
                                        columns.map(function(column){
                                            var dataCell = row[column.name];
                                            return m("td", dataCell)
                                        }) :
                                        //custom styles for cells
                                        columns.map(function(column){
                                            var dataCell = row[column.name];
                                            var style = false;
                                            if(typeof dataCell.style !== 'undefined'){
                                                style = dataCell.style;
                                            }
                                            return m("td", {style: style ? style : ''}, dataCell.value)
                                        })
                                ])
                            })
                        ])
                    ])
                ])
            break;
        }
    }

    return{
        controller: controller,
        view: view,
        getSelectedRows: function(){
            return {
                indexArray: _selectedRowsIndex,
                keysArray: _selectedRows
            };
        },
        uncheckAll: function(){
            _selectedRows = [];
            _selectedRowsIndex = [];
        }
    }
}