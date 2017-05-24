'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function (config) {
    var questionCodes = config.questionCodes;
    var questions = config.questions;
    var _questionSelected = false;
    var _toAll = false;

    function selectQuestion(){
        _questionSelected = parseInt(this.getAttribute('data-code'));
    }

    function typeChanged(){
        _toAll = this.checked;
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function view(){
        return m("div", {class: "m-next-question-picker"}, [
            m("div", {class: "checkbox next-question-tools"}, [
                m("label", [
                    m("input", {type: "checkbox", checked: _toAll, onchange: typeChanged}),
                    'Применить ко всем ответам'
                ])
            ]),
            m("div", {class: "next-question-picker__table-container"}, [
                m("table", {class: "table table-bordered table-striped next-question-picker__table"}, [
                    m("thead",
                        m("tr", [
                            m("th", {class: "survey-constructor-table__number-column"}, '#'),
                            m("th", {class: "survey-constructor-table__number-column"}, 'Код'),
                            m("th", {class: "survey-constructor-table__number-column"}, 'Вопрос'),
                        ])
                    ),
                    m("tbody", [
                        questionCodes.map(function(questionCode, index){
                            var question = questions[questionCode];
                            return m("tr", {class: (_questionSelected == question['QUE_CODE'] ? 'selected-row' : ''), 'data-code': question['QUE_CODE'], onclick: selectQuestion} ,[
                                m("td", {class: "survey-table__clickable-column", "data-index": index, "data-key": question['QUE_CODE']}, index+1),
                                m("td", {class: "survey-table__clickable-column", "data-index": index, "data-key": question['QUE_CODE']}, question['QUE_CODE']),
                                m("td", {class: "survey-table__clickable-column", "data-index": index, "data-key": question['QUE_CODE']}, question['QUE_TEXT']),
                            ])
                        })
                    ])
                ])
            ])
        ])
    }

    return {
        view: view,
        getQuestion: function(){
            return _questionSelected;
        },
        getType: function(){
            return _toAll;
        }
    }
}