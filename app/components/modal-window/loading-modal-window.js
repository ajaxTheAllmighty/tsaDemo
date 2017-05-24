'use strict';
var m = require('mithril');
var Modal = require('./modal-window.js');
module.exports = function (config) {
    var header = config.header || 'Загрузка данных';
    var text = config.text || 'Операция может занять продолжительное время.';

    function view() {
        return new Modal({
            id: 'appLoadingWindow',
            state: 'show',
            content: [
                m("img", {
                    class: "app-loading-window__loader",
                    src: "dist/assets/images/loading.gif"
                }),
                'Пожалуйста, подождите...',
                m("p", {class: "app-loading-window__message"}, text)
            ],
            isStatic: true,
            header: header,
            isFooter: false,
            isFullScreen: false,
            modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
            zIndex: 9999
        })
    }

    return{
        view: view
    }
};