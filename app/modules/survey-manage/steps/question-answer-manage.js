'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
module.exports = function (config) {
    var survey = config.survey;
    var _questionGrid;
    var _answerGrid = false;

    function showAnswers(questionData){
        _answerGrid = m.component(new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: "key-grid",
            keyField: {name: 'ANS_QUE_CODE', value: questionData[0]['QUE_CODE']},
            allowNew: true,
            gridView: "VIEW_ST_ANSWER",
            perPage: 50,
            staticFilters: {
                1:{
                    showCustomText: true,
                    hideHint: false,
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldName: 'ANS_QUE_CODE',
                    fieldTitle: t('answerGridFilterLabel', 'SM_QuestionAnswerManageModule', {question: questionData[0]['QUE_TEXT']}),
                    filterField: 'ANS_QUE_CODE',
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: questionData[0]['QUE_CODE']
                }
            },
            showSelectColumn: false
        }));
        m.redraw();
    }

    function controller(){
        _questionGrid = m.component(new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: "key-grid",
            keyField: {name: 'QUE_SUR_CODE', value: survey.code},
            allowNew: true,
            gridView: "VIEW_ST_QUESTION", //VIEW_ST_QUESTION_SIMPLE
            perPage: 20,
            staticFilters: {
                1:{
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldName: 'QUE_SUR_CODE',
                    fieldTitle: "Опрос",
                    filterField: 'QUE_SUR_CODE',
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: survey.code
                }
            },
            showSelectColumn: false,
            additionalColumns: {
                showAnswersBtn: {
                    name: "",
                    width: 200,
                    button: {
                        name: t('showAnswersBtn', 'SM_QuestionAnswerManageModule'),
                        onclick: function () {
                            var questionCode = this.getAttribute('data-key');
                            Helper.getData(showAnswers, {"context": this, "module": "SurveyConstructorModule", "function": "toStep2"}, 'QUE_CODE, QUE_TEXT', 'VIEW_ST_QUESTION', "WHERE QUE_CODE = " + questionCode);
                        }
                    }
                }
            }
        }));
    }

    function view(){
        return m("div", {class: "qa-container", style: "width: 100%; height: 100%;"}, [
            m("div", {class: "b-question-container"}, [
                _questionGrid
            ]),
            m("div", {class: "b-answer-container"}, [
                _answerGrid ? _answerGrid : m("div", {class: "b-answer-container__hint-block component-container"}, t('answerGridHint', 'SM_QuestionAnswerManageModule'))
            ])
        ])
    }

    return {
        controller: controller,
        view: view
    }
}