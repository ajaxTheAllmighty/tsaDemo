'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
var Modal = require('../../components/modal-window/modal-window.js');
module.exports = function(){
    var login = m.prop('demo');
    var password = m.prop('demo');
    var _sessionExpired = '';

    var _userData = {
        "PER_NAME": "(Пользователь)",
        "USE_GND_CODE": null,
        "USE_ID": "USE00000635",
        "LOC_CODE": 6641,
        "USE_CHANGED_BY": null,
        "USE_WORKSTART": "2015-12-18 00:00:00.0",
        "PER_CODE": 24,
        "USE_BDN_CODE": 109,
        "USE_ACTIVE": "1   ",
        "USE_DR_CHANGED_DATE": null,
        "USE_LANG": "ru_RU",
        "USE_NOTES": null,
        "USE_ACCESS_TOKEN": "55fb0403296704c307d15ff2f0751738ee60adc3",
        "USE_TYPE": null,
        "CMP_NAME": "Demo Company",
        "USR_ID": "USR00000374",
        "USE_SVT_CODE": null,
        "USE_DATE_OF_BIRTH": null,
        "USE_SYNC_TIME_INTERVAL": 0,
        "USE_USR_CODE": 374,
        "USE_CONTACT": "",
        "USE_CODE": 194,
        "USE_IS_IN_STAFF": 0,
        "USE_LOC_CODE": 6641,
        "LOC_NAME": "Алматы",
        "USR_NAME": "Демо",
        "USE_PER_CODE": 24,
        "USR_DESC": "",
        "LOC_PARENT_CODE": null,
        "USE_CHANGED": null,
        "USE_PARENT_CODE": 192,
        "USE_IIN": "",
        "USE_REQ_NEW_PASS": "0   ",
        "USE_DPT_CODE": null,
        "ACCESS_TOKEN_ACTIVE": 1,
        "USE_MAIL": "demo@mail.com",
        "USE_CREATED": null,
        "USE_IMEI": null,
        "USE_SHOW_WELCOME_MSG": 1,
        "USE_TP_CHANGED_DATE": null,
        "USE_CHANGE_POSITION": null,
        "CMP_CODE": 1,
        "LOC_ID": "6641",
        "USE_GPS_TRACK_INTERVAL": 30,
        "USE_HOUSE": null,
        "USR_CODE": 374,
        "USE_CREATED_BY": null,
        "USE_WORKEND": null,
        "USE_DESC": "ÐÐ´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¾Ñ€",
        "USE_NAME": "Пользователь",
        "USE_ACCESS_TOKEN_EXPIRED": "2017-05-22 10:33:47.363",
        "USE_HASH_PASSWORD": ""
    }

    var _menuData = [
        {
            "PAR_MNU_NAME_KAZ": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸_kaz",
            "PAR_MNU_NAME_ENG": "Data",
            "MNU_VIEW_NAME": "",
            "MNU_ID": "MNU1",
            "PAR_MNU_CODE": 1,
            "MNU_IS_ACTIVE": 1,
            "MNU_NAME": "Справочники",
            "MNU_CODE": 1,
            "CMP_CODE": 1,
            "MNU_NAME_KAZ": "Ð¢Ð¾Ñ€Ð³Ð¾Ð²Ñ‹Ðµ Ñ‚Ð¾Ñ‡ÐºÐ¸_kaz",
            "MNU_IS_REFERENCE": 0,
            "MNU_DESC": null,
            "USR_CODE": 374,
            "MNU_PARENT_ID": 0,
            "PAR_MNU_NAME": "ROOT",
            "MNU_MODULE": "",
            "PAR_MNU_IS_ACTIVE": 1,
            "PAR_MNU_ORDER": 1,
            "MNU_NAME_ENG": "Data",
            "MNU_FULL_NAME": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸ / Ð¢Ð¾Ñ€Ð³Ð¾Ð²Ñ‹Ðµ Ñ‚Ð¾Ñ‡ÐºÐ¸",
            "USR_NAME": "ÐÐ´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¾Ñ€",
            "PAR_MNU_PARENT_ID": 28,
            "MNU_ORDER": 1,
            "MRF_FIELD_ACCESS": "1   ",
            "PAR_MNU_MODULE": null
        },
        {
            "PAR_MNU_NAME_KAZ": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸_kaz",
            "PAR_MNU_NAME_ENG": "Data",
            "MNU_VIEW_NAME": "VIEW_ST_SALEPOINT",
            "MNU_ID": "MNU2",
            "PAR_MNU_CODE": 1,
            "MNU_IS_ACTIVE": 1,
            "MNU_NAME": "Торговые точки",
            "MNU_CODE": 2,
            "CMP_CODE": 1,
            "MNU_NAME_KAZ": "Ð¢Ð¾Ñ€Ð³Ð¾Ð²Ñ‹Ðµ Ñ‚Ð¾Ñ‡ÐºÐ¸_kaz",
            "MNU_IS_REFERENCE": 1,
            "MNU_DESC": null,
            "USR_CODE": 374,
            "MNU_PARENT_ID": 1,
            "PAR_MNU_NAME": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸",
            "MNU_MODULE": "modules/references/MainReferenceSmartGrid.swf",
            "PAR_MNU_IS_ACTIVE": 1,
            "PAR_MNU_ORDER": 1,
            "MNU_NAME_ENG": "POS",
            "MNU_FULL_NAME": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸ / Ð¢Ð¾Ñ€Ð³Ð¾Ð²Ñ‹Ðµ Ñ‚Ð¾Ñ‡ÐºÐ¸",
            "USR_NAME": "ÐÐ´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¾Ñ€",
            "PAR_MNU_PARENT_ID": 28,
            "MNU_ORDER": 1,
            "MRF_FIELD_ACCESS": "1   ",
            "PAR_MNU_MODULE": null
        },
        {
            "PAR_MNU_NAME_KAZ": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸_kaz",
            "PAR_MNU_NAME_ENG": "Data",
            "MNU_VIEW_NAME": "VIEW_ST_PRODUCTS",
            "MNU_ID": "MNU3",
            "PAR_MNU_CODE": 1,
            "MNU_IS_ACTIVE": 1,
            "MNU_NAME": "Продукция",
            "MNU_CODE": 14,
            "CMP_CODE": 1,
            "MNU_NAME_KAZ": "ÐŸÑ€Ð¾Ð´ÑƒÐºÑ†Ð¸Ñ_kaz",
            "MNU_IS_REFERENCE": 1,
            "MNU_DESC": "",
            "USR_CODE": 374,
            "MNU_PARENT_ID": 1,
            "PAR_MNU_NAME": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸",
            "MNU_MODULE": "modules/references/MainReferenceSmartGrid.swf",
            "PAR_MNU_IS_ACTIVE": 1,
            "PAR_MNU_ORDER": 1,
            "MNU_NAME_ENG": "Production",
            "MNU_FULL_NAME": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸ / ÐŸÑ€Ð¾Ð´ÑƒÐºÑ†Ð¸Ñ",
            "USR_NAME": "ÐÐ´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¾Ñ€",
            "PAR_MNU_PARENT_ID": 28,
            "MNU_ORDER": 3,
            "MRF_FIELD_ACCESS": "1   ",
            "PAR_MNU_MODULE": null
        },
        {
            "PAR_MNU_NAME_KAZ": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸_kaz",
            "PAR_MNU_NAME_ENG": "Data",
            "MNU_VIEW_NAME": "",
            "MNU_ID": "MNU1",
            "PAR_MNU_CODE": 1,
            "MNU_IS_ACTIVE": 1,
            "MNU_NAME": "Орг. позиции",
            "MNU_CODE": 2,
            "CMP_CODE": 1,
            "MNU_NAME_KAZ": "Ð¢Ð¾Ñ€Ð³Ð¾Ð²Ñ‹Ðµ Ñ‚Ð¾Ñ‡ÐºÐ¸_kaz",
            "MNU_IS_REFERENCE": 0,
            "MNU_DESC": null,
            "USR_CODE": 375,
            "MNU_PARENT_ID": 0,
            "PAR_MNU_NAME": "ROOT",
            "MNU_MODULE": "",
            "PAR_MNU_IS_ACTIVE": 1,
            "PAR_MNU_ORDER": 1,
            "MNU_NAME_ENG": "Data",
            "MNU_FULL_NAME": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸ / Ð¢Ð¾Ñ€Ð³Ð¾Ð²Ñ‹Ðµ Ñ‚Ð¾Ñ‡ÐºÐ¸",
            "USR_NAME": "ÐÐ´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¾Ñ€",
            "PAR_MNU_PARENT_ID": 28,
            "MNU_ORDER": 2,
            "MRF_FIELD_ACCESS": "1   ",
            "PAR_MNU_MODULE": null
        },
        {
            "PAR_MNU_NAME_KAZ": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸_kaz",
            "PAR_MNU_NAME_ENG": "Data",
            "MNU_VIEW_NAME": "VIEW_ST_USER",
            "MNU_ID": "MNU2",
            "PAR_MNU_CODE": 2,
            "MNU_IS_ACTIVE": 1,
            "MNU_NAME": "Орг. позиции",
            "MNU_CODE": 5,
            "CMP_CODE": 1,
            "MNU_NAME_KAZ": "Ð¢Ð¾Ñ€Ð³Ð¾Ð²Ñ‹Ðµ Ñ‚Ð¾Ñ‡ÐºÐ¸_kaz",
            "MNU_IS_REFERENCE": 1,
            "MNU_DESC": null,
            "USR_CODE": 375,
            "MNU_PARENT_ID": 2,
            "PAR_MNU_NAME": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸",
            "MNU_MODULE": "modules/references/MainReferenceSmartGrid.swf",
            "PAR_MNU_IS_ACTIVE": 1,
            "PAR_MNU_ORDER": 1,
            "MNU_NAME_ENG": "POS",
            "MNU_FULL_NAME": "Ð¡Ð¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¸ / Ð¢Ð¾Ñ€Ð³Ð¾Ð²Ñ‹Ðµ Ñ‚Ð¾Ñ‡ÐºÐ¸",
            "USR_NAME": "ÐÐ´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¾Ñ€",
            "PAR_MNU_PARENT_ID": 28,
            "MNU_ORDER": 1,
            "MRF_FIELD_ACCESS": "1   ",
            "PAR_MNU_MODULE": null
        }
    ]


    function closeAlert(e){
        e.preventDefault();
        $('#authFailedAlert').hide();
    }

    function showAlert(){
        $('#authFailedAlert').show();
    }

    function getToken(e){
        e.preventDefault();
        if(login() === 'demo' && password() === 'demo'){
            tryLogin();
        }else{
            showAlert();
        }
    }

    function tryLogin(){
        Globals.setUserData(_userData);
        Globals.setLang(_userData['USE_LANG']);
        Globals.setUserHierarchy('');
        Globals.setIsAuthorized(true);
        sortMenuItems(_menuData);
    }

    function sortMenuItems($data){
        var menuArray = [];
        var menuItems = [];
        var rootMenu = [];
        for (var i = 0; i < $data.length; i++) {
            var menuItem = $data[i];
            if(menuItem['PAR_MNU_NAME'] == 'ROOT'){
                rootMenu.push(menuItem);
            }else{
                if(!menuArray.hasOwnProperty(menuItem['MNU_PARENT_ID'])){
                    menuArray[menuItem['MNU_PARENT_ID']] = [];
                }
                menuArray[menuItem['MNU_PARENT_ID']].push(menuItem);
            }
            if(!menuItems.hasOwnProperty(menuItem['MNU_CODE'])){
                menuItems[menuItem['MNU_CODE']] = [];
            }
            menuItems[menuItem['MNU_CODE']].push(menuItem);
        }
        Globals.setMenuData({menuArray: menuArray, menuItems: menuItems, rootMenu: rootMenu});
        Globals.setDatePickerDefaults();
        m.route("/");
    }

    function controller() {
        document.title = Config.title;
        if(typeof m.route.param("session_expired") !== 'undefined'){
            _sessionExpired = new Modal({
                id: 'timerModal',
                state: 'show',
                content: [
                    m("p", {style: "text-align: center;"}, 'Время текущей сессии истекло.'),
                    m("p", {style: "text-align: center; margin-bottom: 0px;"}, 'Необходимо снова войти в систему.')
                ],
                isStatic: false,
                header: 'Сессия завершена',
                isFooter: true,
                isFullScreen: false,
                modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                zIndex: 1100,
                onConfirm: function(){
                    _sessionExpired = '';
                    m.route("/login");
                },
                cancelBtn: 'none'
            })
            login('');
            password('');
        }
    }

    function view() {
        return m("div", {class: "page-login"},[
            m("div", {class: "page-login__top hidden-xs"}),
            m("div", {class: "page-login__middle"}, [
                m("div", {class: "page-login__middle-inner"}, [
                    m("div", {class: "row page-login__logo-container"}, [
                        m("div", {class: "col-sm-2"}),
                        m("div", {class: "col-sm-8 row page-login__logo-container-inner"}, [
                            m("img", {src: "dist/assets/images/"+Config.logo})
                            //m('h1', {class: "page-login__logo-text"}, 'TSA '),
                            //'incident system'
                        ]),
                        m("div", {class: "col-sm-2"})
                    ])
                ])
            ]),
            m("div", {class: "page-login__empty-middle hidden-xs"}),
            m("div", {class: "page-login__bottom"}, [
                m("div", {class: "row"}, [
                    m("div", {class: "col-sm-6"}, []),
                    m("div", {class: "col-sm-4 page-login__auth-form-container"}, [
                        m("div", {class: "alert alert-danger page-login__alert-message", id: "authFailedAlert"},[
                            m("a[href='#']", {class: "close", onclick: closeAlert}, m.trust("&times;")),
                            m("strong", t('authError', 'LoginPage')),
                            t('incorrectPassword', 'LoginPage')
                        ]),
                        m("form", {class: "auth-form", onsubmit: getToken},[
                            m("div", {class: "row auth-form__input-row"}, [
                                m("div", {class: "col-sm-3 auth-form__label-container"}, [
                                    m("label", {"for": "userLogin"}, t('loginPlaceholder', 'LoginPage')),
                                ]),
                                m("div", {class: "col-sm-9"}, [
                                    m("input", {class: "form-control", type: "text", id: "userLogin", oninput: m.withAttr("value", login), value: login()})
                                ])
                            ]),
                            m("div", {class: "row auth-form__input-row"}, [
                                m("div", {class: "col-sm-3 auth-form__label-container"}, [
                                    m("label", {"for": "userPassword"}, t('passwordPlaceholder', 'LoginPage')),
                                ]),
                                m("div", {class: "col-sm-9"}, [
                                    m("input", {class: "form-control", type: "password", id: "userPassword", oninput: m.withAttr("value", password), value: password()})
                                ])
                            ]),
                            m("div", {class: "row auth-form__input-row"}, [
                                m("div", {class: "col-sm-offset-3 auth-form__submit-btn-container"}, [
                                    m("button", {class: "auth-form__submit-button btn btn-default", type: "submit", id: "userAuthButton"}, t('authBtn', 'LoginPage'))
                                ]),
                            ]),
                        ])
                    ]),
                    m("div", {class: "col-sm-2"}, []),
                ])
            ]),
            _sessionExpired
        ])
    }
    return {
        controller: controller,
        view: view
    }
};

