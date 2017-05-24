'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
module.exports = function (config) {
    var userGrid = '';


    function getTaskData(taskCode){
        Helper.getData(surveyDataLoaded, {"context": this, "module": "TaskPickerModule", "function": "getSurveyData"}, '*', 'VIEW_ST_TASK_HEADER', "WHERE TAH_CODE = " + taskCode);
    }

    function surveyDataLoaded(data){
        var task = {
            code: data[0]['TAH_CODE'],
            name: data[0]['TAH_NAME']
        };
        onTaskSelect(task);
    }

    function controller(){

    }

    function view(){
        return m("div", {class: "m-task-picker__container", style: "width: 100%; height: 100%;"},
            m.component(new GridModule({
                moduleId: Globals.registerModule('grid'),
                mode: 'grid',
                allowNew: true,
                gridView: 'VIEW_ST_TASK_HEADER',
                perPage: 50,
                staticFiltersArray: [],
                additionalColumns: {
                    showAnswersBtn: {
                        name: "",
                        width: 200,
                        button: {
                            name: 'Выбрать',
                            onclick: function () {
                                var taskCode = this.getAttribute('data-key');
                                getTaskData(taskCode);
                            }
                        }
                    }
                }
            }))
        );
    }

    return {
        controller: controller,
        view: view
    }
}