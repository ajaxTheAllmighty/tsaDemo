'use strict';
var m = require('mithril');
var Step2 = require('./step-2.js');
var Step3 = require('./step-3.js');
module.exports = function(){
    function toStep2(){
        //init 2 step module and set callback when all files uploaded
        var step2 = new Step2;
        $('#uploadFilesForm')[0].reset();
        $('#fileListTable tbody').empty();
        step2.init({
            finishUploadCallback: allowStep3
        });
        //hide first step and show second
        $('.b-first-step').hide();
        $('.b-second-step').show();

        //do active menu item
        $('#step1Btn').removeClass('active').prop('disabled', true);
        $('#step2Btn').addClass('active').prop('disabled', true);
    }

    function toStep3(){
        var step3 = new Step3;
        step3.init();
        //hide first step and show second
        $('.b-second-step').hide();
        $('.b-third-step').show();

        //do active menu item
        $('#step2Btn').removeClass('active').prop('disabled', true);
        $('#step3Btn').addClass('active').prop('disabled', true);
    }

    function allowStep2(){
        $('#step2Btn').prop('disabled', false);
    }

    function allowStep3(){
        $('#step3Btn').prop('disabled', false);
    }

    function stepButtonsListeners(){
        $('#step2Btn').on('click', function () {
            toStep2();
        })
        $('#step3Btn').on('click', function () {
            toStep3();
        })
    }

    function init(){
        $('#systemButtonsContainer').empty();
        $('#processFileListTable tbody').empty();
        $('#logContainer').empty();
        stepButtonsListeners();
        toStep2();

    }

    return{
        init: init,
        toStep2: toStep2,
        toStep3: toStep3
    }
};
