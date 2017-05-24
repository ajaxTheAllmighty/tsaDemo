'use strict';
var m = require('mithril');
module.exports = function () {
    var state = 'default';
    var header = '';
    var messages = [];
    var content = false;
    var afterClose;
    var isStatic = false;

    function init(options){
        isStatic = options.isStatic || false;
        state = options.state || "default";
        header = options.header || "";
        messages = options.messages || [];
        content = options.content || false;
        afterClose = options.afterClose || false;
        m.redraw();
    }

    function close(){
        $('#systemInfoModal').modal('hide');
        state = "default";
        m.redraw();
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
                    $('#systemInfoModal').modal('show');
                    $('#systemInfoModal').unbind('hidden.bs.modal');
                    $('#systemInfoModal').on('hidden.bs.modal', function () {
                        state = "default";
                        if(afterClose){afterClose();}
                    })
                }

                if(isStatic){
                    config.backdrop = 'static';
                    config.keyboard = false;
                }

                return  m("div", {class: "modal fade", id: "systemInfoModal", tabindex: "-1", role: "dialog", config: config},
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
                                m("button", {type: "button", class: "btn btn-system btn-system-cancel", "data-dismiss": "modal"}, t('closeBtn', 'App')),
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
        init: init,
        close: close
    }
};