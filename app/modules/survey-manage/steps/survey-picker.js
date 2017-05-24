'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
module.exports = function (config) {
    var onSurveySelect = config.onSurveySelect;

    function getSurveyData(surveyCode){
        Helper.getData(surveyDataLoaded, {"context": this, "module": "SurveyConstructorModule", "function": "getSurveyData"}, '*', 'VIEW_ST_SURVEY_PROMO', "WHERE SUR_CODE = " + surveyCode);
        //Helper.getData(surveyDataLoaded, {"context": this, "module": "SurveyConstructorModule", "function": "getSurveyData"}, '*', 'VIEW_ST_SURVEY', "WHERE SUR_CODE = " + surveyCode);
    }

    function surveyDataLoaded(data){
        var survey = {
            code: data[0]['SUR_CODE'],
            name: data[0]['SUR_NAME']
        };
        onSurveySelect(survey);
    }

    return m("div", {class: "m-survey-picker__container", style: "width: 100%; height: 100%;"},
        m.component(new GridModule({
            moduleId: Globals.registerModule('grid'),
            mode: 'grid',
            allowNew: true,
            gridView: 'VIEW_ST_SURVEY_PROMO',
            perPage: 50,
            staticFiltersArray: [],
            additionalColumns: {
                showAnswersBtn: {
                    name: "",
                    width: 200,
                    button: {
                        name: t('gridCustomColumn', 'SM_SurveyPickerModule'),
                        onclick: function () {
                            var surveyCode = this.getAttribute('data-key');
                            getSurveyData(surveyCode);
                        }
                    }
                }
            }
        }))
    );
}