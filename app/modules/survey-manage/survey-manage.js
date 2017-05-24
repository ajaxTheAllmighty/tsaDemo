'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
var SurveyPicker = require('./steps/survey-picker.js');
var QuestionAnswerManage = require('./steps/question-answer-manage.js');
var SurveyConstructor = require('./steps/survey-constructor.js');

module.exports = function () {
    var _state = 'selectSurvey';
    var _survey = false;
    //Step 1
    var _surveyPicker;
    //Step 2
    var _qaManage;
    //Step 3
    var _surveyConstructor;

    function toStep1(){
        _survey = false;
        _surveyPicker = new SurveyPicker({
            onSurveySelect: function(survey){
                _survey = survey;
                toStep2();
                m.redraw();
            }
        });
        _state = 'selectSurvey';
    }

    function toStep2(){
        _qaManage = new QuestionAnswerManage({
            survey: _survey
        });
        _state = 'qaManage';
    }

    function toStep3(){
        _surveyConstructor = m.component(new SurveyConstructor({
            state: 'loading',
            survey: _survey
        }))
        _state = 'surveyConstructor';
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        _surveyPicker = new SurveyPicker({
            onSurveySelect: function(survey){
                _survey = survey;
                toStep2();
                m.redraw();
            }
        });
    }

    function view(ctrl) {
        switch(_state){
            case 'selectSurvey': //Step 1
                return m("div", {class: "m-survey-manage"}, [
                    m("div", {class: "m-survey-manage__step-menu component-container clearfix"}, [
                        m("button", {class: "btn btn-link btn-system-link active"}, t('surveyPickerLink', 'SurveyManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", disabled: "disabled"}, t('questionAnswerManageLink', 'SurveyManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", disabled: "disabled"}, t('surveyConstructorLink', 'SurveyManageModule'))
                    ]),
                    m("div", {class: "m-survey-manage__content"}, [
                        _surveyPicker
                    ])

                ])
            break;
            case 'qaManage': //Step 2
                return m("div", {class: "m-survey-manage"}, [
                    m("div", {class: "m-survey-manage__step-menu component-container clearfix"}, [
                        m("button", {class: "btn btn-link btn-system-link", onclick: toStep1}, _survey.name),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link active"}, t('questionAnswerManageLink', 'SurveyManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", onclick: toStep3}, t('surveyConstructorLink', 'SurveyManageModule'))
                    ]),
                    m("div", {class: "m-survey-manage__content"}, [
                        _qaManage
                    ])
                ])
            break;
            case 'surveyConstructor': //Step3
                return m("div", {class: "m-survey-manage"}, [
                    m("div", {class: "m-survey-manage__step-menu component-container clearfix"}, [
                        m("button", {class: "btn btn-link btn-system-link", onclick: toStep1}, _survey.name),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", onclick: toStep2}, t('questionAnswerManageLink', 'SurveyManageModule')),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link active"}, t('surveyConstructorLink', 'SurveyManageModule')),
                    ]),
                    m("div", {class: "m-survey-manage__content"}, [
                        _surveyConstructor
                    ])
                ])
            break;
        }
    }

    return{
        controller: controller,
        view: view
    }
};