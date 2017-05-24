'use strict';
var m = require('mithril');
module.exports = function () {
    var state = 'default';
    var header = '';
    var messages = [];
    var messagesToShow = [];
    var afterClose;
    var errorCode = '';

    function init(options){
        if(state != 'show'){
            var now = new Date();
            errorCode = ''+now.getFullYear()+now.getMonth()+now.getDay()+now.getHours()+now.getMinutes()+now.getSeconds()+'_'+Globals.getUserData()['USE_CODE']+'_'+Math.floor( Math.random() * ( 1 + 9999 ) );
            state = options.state || "default";
            header = options.header || "Ошибка";
            messages = options.messages || [];
            messagesToShow = options.messagesToShow || [];
            afterClose = options.afterClose || false;
        }
        m.redraw();
    }

    function saveErrorToLogTable(){
        state = 'default';
        $('#systemMessageModal').modal('hide');
        var messageText = messages.join('\n');
        messageText = messageText.replace(/"/g, "");
        messageText = messageText.replace(/'/g, "");
        messageText = messageText.replace(/,/g, "");
        var postData = {
            "token": Globals.getToken(),
            "table": "AT_APP_ERROR_MESSAGE",
            "fields": "AEM_ID, AEM_MESSAGE, AEM_USE_CODE",
            "values": "'"+errorCode+"','"+messageText+"',"+Globals.getUserData()['USE_CODE']
        };

        $.ajax({
            type: 'POST',
            url: Config.frontServices.insertPage,
            data: postData,
            dataType : 'json',
            complete: function(){
                console.log('error saved!');
            }
        })
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
                    //shit shame
                    $('#systemMessageModal').modal('show');
                    $('#systemMessageModal').unbind('hidden.bs.modal');
                    $('#systemMessageModal').on('hidden.bs.modal', function () {
                        state = "default";
                        if(afterClose){
                            afterClose();
                        }
                    })
                }
                return  m("div", {class: "modal fade", id: "systemMessageModal", tabindex: "-1", role: "dialog", config: config},
                    m("div", {class: "modal-dialog", role: "document"},
                        m("div", {class: "modal-content"}, [
                            m("div", {class: "modal-header"},[
                                m("button", {type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"}, [
                                    m("span", {"aria-hidden": "true"}, m.trust("&times;"))
                                ]),
                                m("h4", {class: "modal-title"}, header + " ("+errorCode+")")
                            ]),
                            m("div", {class: "modal-body modal-title"}, [
                                m("p", t('callWithAdminMsg', 'SystemMessageModule')),
                                messagesToShow.map(function(message, index){
                                    return m("p", message);
                                })
                            ]),
                            m("div", {class: "modal-footer"}, [
                                m("button", {type: "button", class: "btn btn-system btn-system-cancel", onclick: saveErrorToLogTable}, t('sendError', 'SystemMessageModule')),
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
        init: init
    }
};