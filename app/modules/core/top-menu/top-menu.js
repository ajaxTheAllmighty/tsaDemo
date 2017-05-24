'use strict';
var m = require('mithril');
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function () {
    var _modalWindow = '';

    function controller() {
        Globals.isAuth();
    }

    function showCopyRight(){
        _modalWindow = new Modal({
            id: 'settingsModal',
            state: 'show',
            content: [
                'Copyright © 2013  TOO "PrimeBridge". All Rights Reserved.'
            ],
            isStatic: false,
            header: t('copyrightHeader', 'MenuModule'),
            isFooter: true,
            isFullScreen: false,
            modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
            zIndex: 1005,
            confirmBtn: 'Ок',
            cancelBtn: 'none',
            onConfirm: function(){
                _modalWindow = '';
            }
        })
    }

    function view() {
        return m("div", {class: "b-top-menu"},  [
            m("nav", {class: "navbar navbar-default top-menu__navbar"},
                m("div", {class: "container-fluid"}, [
                    m("div", {class: "navbar-header"}, [
                        m("buttton", {type:"button", class: "navbar-toggle collapsed", "data-toggle":"collapse", "data-target": "#main-menu-collapse", "aria-expanded":"false"}, [
                            m("span", {class:"sr-only"}, "Toggle navigation"),
                            m("span", {class:"icon-bar"}, ""),
                            m("span", {class:"icon-bar"}, ""),
                            m("span", {class:"icon-bar"}, ""),
                        ]),
                        m("a[href='/']", {class: "navbar-brand", config: m.route},
                            "TSA ",
                            m("strong", {}, Globals.getUserData()["CMP_NAME"])
                        )
                    ]),
                    m("div", {class: "collapse navbar-collapse", id: "main-menu-collapse"},[
                        m("ul", {class: "nav navbar-nav navbar-right"},[
                            m("li", {class:"dropdown"}, [
                                m("a", {"data-toggle": "dropdown", class: "dropdown-toggle"},[
                                    m.trust(Globals.getUserData()["USE_NAME"]),
                                    m.trust("("+Globals.getUserData()["USR_NAME"]+")"),
                                    m("span", {class: "caret"})
                                ]),
                                m("ul", {class: "dropdown-menu"},[
                                    m("li",
                                        m("a", {onclick: function () {
                                            Timer.stop();
                                            location.reload();}
                                        },
                                        t('exitLink', 'MenuModule'))
                                    ),
                                    m("li",
                                        m("a", {onclick: showCopyRight}, t('aboutLink', 'MenuModule'))
                                    ),
                                    m("li",
                                        m("a", {onclick: function(){m.route('/настройки')}}, t('settingsLink', 'MenuModule'))
                                    ),
                                    m("li",
                                       m("a", {onclick: function(){m.route('/управление_переводом')}}, 'управление переводом')
                                    ),
                                    m("li",
                                        m("a", {onclick: function(){m.route('/survey')}}, 'survey')
                                    ),
                                ])
                            ]),
                            m("li",
                                m("a", {
                                        target: "_blank",
                                        //href: Config.helpFile+(Globals.getCurrentMenuItem().hasOwnProperty('MNU_CODE') ? '?MNU'+Globals.getCurrentMenuItem()['PAR_MNU_CODE']+'_MNU'+Globals.getCurrentMenuItem()['MNU_CODE']+'.html' : '')
                                    }, t('helpLink', 'MenuModule')
                                )
                            )
                        ])
                    ])
                ])
            ),
            _modalWindow
        ]);
    }

    return{
        controller: controller,
        view: view
    }
};