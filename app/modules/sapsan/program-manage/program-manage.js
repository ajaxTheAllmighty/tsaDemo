'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var ProgramSalepointManage = require('./steps/program-salepoint-manage.js');
var SalepointEditModule = require('./steps/salepoint-edit.js');
module.exports = function () {
    var _state = 'psManage';
    var _PSManage = '';
    var _SalepointEdit;

    var salepoint = m.prop(false);
    var year = m.prop(false);
    var month = m.prop(false);

    function toPSManage(){
        _state = 'psManage';
    }

    function toSalepointEdit(){
        _state = 'salepointEdit';
        _SalepointEdit = new SalepointEditModule({
            month: month(),
            year: year(),
            salepoint: salepoint()
        });
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        _PSManage = m.component(
            new ProgramSalepointManage({
                onPointEdit: function(config){
                    salepoint(config.salepoint);
                    year(config.year);
                    month(config.month);
                    toSalepointEdit();
                }
            })
        );
    }

    function view(ctrl) {
        switch(_state){
            case 'psManage':
                return m("div", {class: "m-program-manage"}, [
                    m("div", {class: "m-program-manage__step-menu component-container clearfix"}, [
                        m("button", {class: "btn btn-link btn-system-link active"}, 'Управление программами'),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link", onclick: toSalepointEdit}, 'Управление клиентами'),
                    ]),
                    m("div", {class: "m-program-manage__content"}, [
                        _PSManage
                    ])
                ])
            break;
            case 'salepointEdit':
                return m("div", {class: "m-program-manage"}, [
                    m("div", {class: "m-program-manage__step-menu component-container clearfix"}, [
                        m("button", {class: "btn btn-link btn-system-link", onclick: toPSManage}, 'Управление программами'),
                        m("span", {}, " > "),
                        m("button", {class: "btn btn-link btn-system-link active"}, 'Управление клиентами'),
                    ]),
                    m("div", {class: "m-program-manage__content"}, [
                        _SalepointEdit
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