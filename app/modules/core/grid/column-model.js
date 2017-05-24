'use strict';
module.exports = function (columnArray, customColumns) {
    var _viewPrimaryKeyObject = false;
    var _accessibleColumnsInQuery = [];
    var _accessibleColumns = {};
    var _visibleColumnsAssoc = {};
    var _hiddenColumnsAssoc = {};
    //var _filterColumns = {};
    var _filterColumns = [];

    columnArray.map(function(columnObj, index){
        //primary key
        if(columnObj['FIL_IS_PRIMARY_KEY'] == 1){
            _viewPrimaryKeyObject = columnObj;
            _accessibleColumnsInQuery.push(columnObj['COLUMN_NAME']);
        }

        //show in filter list
        if(columnObj['FIL_SHOW_IN_FILTER'] == 1){
            _filterColumns.push({
                name: columnObj['COLUMN_NAME'],
                title: columnObj[Globals.getLangDb()],
                type: columnObj['FIL_GROUP'],
                dropDownView: columnObj['FIL_TABLE_NAME'],
                dropDownCodeField: columnObj['FIL_CODE_FIELD'],
                dropDownNameField: columnObj['FIL_NAME_FIELD']
            });
        }

        //accessible columns for grid
        if(columnObj['TRF_FIELD_ACCESS'] > 0){
            columnObj.minWidth = (!columnObj['COLUMN_WIDTH'] || columnObj['COLUMN_WIDTH'] == 0 ? 100 : columnObj['COLUMN_WIDTH']);
            columnObj.userWidth = false;
            _accessibleColumns[columnObj['COLUMN_NAME']] = columnObj;
            if(_accessibleColumnsInQuery.indexOf(columnObj['COLUMN_NAME']) == -1){
                _accessibleColumnsInQuery.push(columnObj['COLUMN_NAME']);
            }

            //columns visible by default
            if(columnObj['TRF_FIELD_ACCESS'] == 1){
                _visibleColumnsAssoc[columnObj['COLUMN_NAME']] = columnObj;
            }

            //hidden columns
            if(columnObj['TRF_FIELD_ACCESS'] == 2){
                _hiddenColumnsAssoc[columnObj['COLUMN_NAME']] = columnObj;
            }
        }
    });

    if(!_viewPrimaryKeyObject){
        console.error('Error! There is no primary key in view!');
    }

    return{
        getColumnsForQuery: function(){
            return _accessibleColumnsInQuery;
        },
        getFilterFields: function(){
            return _filterColumns;
        },
        getHiddenColumns: function(){
            var hiddenColumns = [];
            Object.keys(_hiddenColumnsAssoc).map(function(columnName, index){
                hiddenColumns.push(_hiddenColumnsAssoc[columnName]);
            });
            return hiddenColumns;
        },
        getHeaderColumns: function(){
            var headerColumns = [];
            _accessibleColumnsInQuery.map(function(columnName){
                if(_visibleColumnsAssoc.hasOwnProperty(columnName)){
                    headerColumns.push(_accessibleColumns[columnName]);
                }
            });
            //add custom columns to general array
            for (var column in customColumns) {
                _accessibleColumns[column] = {
                    COLUMN_NAME: column,
                    COLUMN_WIDTH: customColumns[column].width,
                    COLUMN_TITLE: customColumns[column].name,
                    FIL_GROUP: 'ADD_COLUMN'
                };
                headerColumns.push(_accessibleColumns[column]);
            }
            return headerColumns;
        },
        getPrimaryKeyObject: function(){
            return _viewPrimaryKeyObject;
        },
        setColumnWidth: function(columnName, width){
            if(_accessibleColumns.hasOwnProperty(columnName)){
                _accessibleColumns[columnName].userWidth = width;
            }
        },
        showColumn: function(columnName){
            _visibleColumnsAssoc[columnName] = _accessibleColumns[columnName];
            delete _hiddenColumnsAssoc[columnName];
        },
        hideColumn: function(columnName){
            _hiddenColumnsAssoc[columnName] = _accessibleColumns[columnName];
            delete _visibleColumnsAssoc[columnName];
        }
    }
};