'use strict';
var m = require('mithril');
module.exports = function () {
    var state = 'default';
    var header = '';
    var messages = [];
    var content = false;
    var cancelBtn = '';
    var confirmBtn = '';
    var cancelCallback;
    var confirmCallback;

    function init(options){
        state = options.state || "default";
        cancelBtn = options.cancelBtn || "Отмена";
        confirmBtn = options.confirmBtn || "Ок";
        header = options.header || "";
        messages = options.messages || [];
        content = options.content || false;
        cancelCallback = options.cancelCallback || false;
        confirmCallback = options.confirmCallback || false;
        m.redraw();
    }
    
    function confirmFunction(){
        state = "default";
        $('#systemDialogModal').modal('hide');
        if(confirmCallback){
            confirmCallback();
        }
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){

    }

    function view(){
        switch(state){
            case 'default':
                return m("div", {class: "default-state"}, "");
            break;
            case 'show':
                var config = function(){
                    $('#systemDialogModal').modal('show');
                    $('#systemDialogModal').unbind('hidden.bs.modal');
                    $('#systemDialogModal').on('hidden.bs.modal', function () {
                        state = "default";
                        if(cancelCallback){
                            cancelCallback();
                        }
                    })
                }
                return  m("div", {class: "modal fade", id: "systemDialogModal", tabindex: "-1", role: "dialog", config: config},
                    m("div", {class: "modal-dialog", role: "document"},
                        m("div", {class: "modal-content"}, [
                            m("div", {class: "modal-header"},[
                                m("button", {type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"}, [
                                    m("span", {"aria-hidden": "true"}, m.trust("&times;"))
                                ]),
                                m("h4", {class: "modal-title"}, header)
                            ]),
                            m("div", {class: "modal-body modal-title"}, [
                                messages.map(function(message, index){
                                    return m("p", message);
                                }),
                                (content ? content : '')
                            ]),
                            m("div", {class: "modal-footer"}, [
                                m("button", {type: "button", class: "btn btn-system btn-system-cancel", "data-dismiss": "modal"}, cancelBtn),
                                m("button", {type: "button", class: "btn btn-system btn-system-primary", "data-dismiss": "modal", onclick: confirmFunction}, confirmBtn),
                            ])
                        ])
                    )
                );
            break;
            default:
                return m("div", {class: "default-state"}, "");
            break;
        }
    }

    return{
        controller: controller,
        view: view,
        init: init
    }
};