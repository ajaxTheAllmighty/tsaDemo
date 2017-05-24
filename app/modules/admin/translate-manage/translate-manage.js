'use strict';
var m = require('mithril');
module.exports = function () {
    var _TranslateGrid = '';
    var _search = '';
    var _langObject = {};
    var _langArray = [];

    function searchByFieldName(){
        var staticFilters = {
            '1': {
                isHidden: true,
                andOrCondition: "AND",
                condition: "like",
                fieldTitle: '',
                fieldName: "FIL_VIEW_COLUMN_NAME",
                filterField: "FIL_VIEW_COLUMN_NAME",
                id: "1",
                isGroupCondition: true,
                type: "TEXT",
                value: _search
            }
        };
        _TranslateGrid.refresh({
            staticFilters: staticFilters
        });
    }

    function searchByTranslate(){
        var field = _langObject.db;

        var staticFilters = {
            '1': {
                isHidden: true,
                andOrCondition: "AND",
                condition: "like",
                fieldTitle: '',
                fieldName: field,
                filterField: field,
                id: "1",
                isGroupCondition: true,
                type: "TEXT",
                value: _search
            }
        };
        _TranslateGrid.refresh({
            staticFilters: staticFilters
        });
    }

    function searchChanged() {
        _search = this.value.trim();
    }

    function langChanged() {
        _langObject = _langArray[parseInt(this.value)];
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        _TranslateGrid = new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'grid',
            allowNew: false,
            gridView: 'VIEW_ST_FILTER',
            perPage: 50,
            showSelectColumn: true,
            contextActionsList: ['export', 'groupEdit', 'rowMode'],
            isModal: false
        });

        var langListObject = Globals.getLangList();
        Object.keys(langListObject).map(function(langShort){
            _langArray.push(langListObject[langShort])
        })

        _langObject = _langArray[0];
    }

    function view(){
        return m("div", {class: "m-translate-manage"}, [
            m("div", {class: "m-translate-manage__tools-container component-container"}, [
                m("div", {class: "m-translate-manage__search-input inner-addon right-addon"}, [
                    m("i", {class: "glyphicon glyphicon-search"}),
                    m("input", {type: "text", class: "form-control", onchange: searchChanged}),
                ]),
                m("button", {class: "m-translate-manage__search_by_field btn btn-system btn-system-primary", onclick: searchByFieldName}, 'Поиск по имени столбца'),
                m("button", {class: "m-translate-manage__search_by_translate btn btn-system btn-system-primary", onclick: searchByTranslate}, 'Поиск по переводу'),
                m("select", {class: "form-control m-translate-manage__lang-choose", onchange: langChanged}, [
                    _langArray.map(function(langObj, index){
                        return m("option", {value: index}, langObj.name)
                    })
                ]),
            ]),
            m("div", {class: "m-translate-manage__grid-container"}, [
                _TranslateGrid
            ])
        ])
    }

    return{
        controller: controller,
        view: view
    }
};