'use strict';
var m = require('mithril');
module.exports = function (config) {
    var state = config.state || 'show';
    var content = config.content || '';
    var id = 'modalWindow-'+(config.id || 1);
    var isStatic = config.isStatic || false;
    var isFooter = config.isFooter || false;
    var header = config.header || 'Header';
    var isFullScreen = config.isFullScreen || false;
    var modalSizeParams = config.modalSizeParams || {width: '600px', height: '300px', padding: '15% 0 0 0'};
    var cancelBtn = config.cancelBtn || t('cancelBtn', 'App');
    var confirmBtn = config.confirmBtn || t('okBtn', 'App');
    var confirmBtnClass = config.confirmBtnClass || 'btn-system-primary';
    var onConfirm = config.onConfirm || function(){};
    var onCancel = config.onCancel || function(){};
    var zIndex = config.zIndex || 1000;

    function show(){
        state = 'show';
        document.getElementById(id).style.display = "block";
    }

    function hide(){
        state = 'hidden';
        onCancel();
        m.redraw();
    }

    function updatedContent(cnt){
        content = cnt;
    }

    function controller() {
        if(isFullScreen){
            modalSizeParams = {width: '100%', height: '100%', padding: '20px'};
        }
    }

    function view() {
        switch(state){
            case 'show':
                return m("div", {class: "modal-window", id: id, style: "padding: "+modalSizeParams.padding + ";z-index: " + zIndex + ';'},
                    m("div", {class: "modal-window__content", style: "width: " + modalSizeParams.width + (modalSizeParams.height ? "; height: " + modalSizeParams.height : '') + ";"}, [
                        m("div", {class: "modal-window__header"}, [
                            isStatic ? '' : m("button", {type: "button", class: "close","aria-hidden": true, onclick: hide}, m("span", '×')),
                            m("h2", header)
                        ]),
                        m("div", {class: "modal-window__body" + (isFooter ? '_with-footer' : '') + ' clearfix'}, [
                            content
                        ]),
                        (isFooter && !isStatic) ? m("div", {class: "modal-window__footer"}, [
                            cancelBtn !== 'none' ? m("button", {type: "button", class: "btn btn-system btn-system-cancel", onclick: hide}, cancelBtn) : '',
                            m("button", {type: "button", class: "btn btn-system "+confirmBtnClass, onclick: onConfirm}, confirmBtn),
                        ]) : ''
                    ])
                );
            break;
            case 'hidden':
                return m("div", {class: "modal-window_hidden", id: id}, '');
            break;
        }
    }

    return{
        controller: controller,
        view: view,
        updatedContent: updatedContent,
        show: show,
        hide: hide
    }
};