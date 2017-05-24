'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
module.exports = function (config) {

    var survey = config.survey || 41;

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        Helper.getData(questionsLoaded, {"context": this, "module": "Survey Constructor Step", "function": "controller"}, 'QUE_CODE, QUE_TEXT, MAX(SUD_SHOW_ORDER) AS ORD', 'VIEW_ST_SURVEY_DETAILS', "WHERE SUD_SUR_CODE = " + survey + " GROUP BY QUE_CODE, QUE_TEXT", "MAX(SUD_SHOW_ORDER)");

    }

    function view(){
        return m("div", {class: "m-survey-landing"}, [

        ])
    }

    return{
        controller: controller,
        view: view
    }
};