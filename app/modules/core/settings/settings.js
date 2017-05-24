'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function () {
    //lang settings
    var _lang = false;

    //password settings
    var _password = m.prop('');
    var _passwordConfirm = m.prop('');
    var _passwordSaveErrors = [];

    var _modalWindow = '';

    function changeLang(){
        _lang = this.value;
    }

    function checkPassword(){
        _passwordSaveErrors = [];
        //var passwordRuleRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{6,12})$/;
        var passwordRuleRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{3,})$/;

        if(_password() !== _passwordConfirm()){
            _passwordSaveErrors.push(t('passwordErrorNotEqual', 'SettingsModule'));
        }

        if(!passwordRuleRegex.test(_password())){
            _passwordSaveErrors.push(t('passwordErrorNotTest', 'SettingsModule'));
        }

        if(_passwordSaveErrors.length > 0){
            return false;
        }
        return true;
    }

    function savePassword(){
        if(_password() != ''){
            if(checkPassword()){
                Helper.updateData(passwordSaved, this, "USE_PASSWORD = '"+_password()+"'", 'ST_USER', "USE_CODE = "+Globals.getUserData()['USE_CODE']);
            }
        }else{
            showSuccessMessage();
        }
    }

    function passwordSaved(){
        showSuccessMessage();
    }

    function langSaved(){
        Globals.setLang(_lang);
        savePassword();
    }

    function showSuccessMessage(){
        _password('');
        _passwordConfirm('');
        _passwordSaveErrors = [];

        _modalWindow = new Modal({
            id: 'settingsModal',
            state: 'show',
            header: t('modalSavedHeader', 'SettingsModule'),
            content: [
                t('modalSavedMessage', 'SettingsModule')
            ],
            isStatic: false,
            isFooter: true,
            isFullScreen: false,
            modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
            zIndex: 1005,
            confirmBtn: t('okBtn', 'App'),
            cancelBtn: 'none',
            onConfirm: function(){
                _modalWindow = '';
                m.route('/');
            }
        })
        m.redraw();
    }

    function saveSettings(){
        if(_lang != Globals.getLang()){
            Helper.updateData(langSaved, this, "USE_LANG = '"+_lang+"'", 'ST_USER', "USE_CODE = "+Globals.getUserData()['USE_CODE']);
        }else{
            savePassword();
        }
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        _lang = Globals.getLang();
    }

    function view(){
        return m("div", {class: "b-settings"}, [
            m("div", {class: "b-settings__lang-container component-container clearfix"}, [
                m("h2", {class: "b-set-lang__header"}, t('langChooseHeader', 'SettingsModule')),
                m("div", {class: "b-set-lang__lang-list"}, [
                    Helper.objectToArray(Globals.getLangList()).map(function(langObj){
                        return m("div", {class: "radio"}, [
                            m("label", {},[
                                m("input", {type: "radio", name: "lang", value: langObj.alias, onchange: changeLang, checked: (_lang == langObj.alias)}),
                                langObj.name
                            ])
                        ])
                    })
                ]),
                m("h2", {class: "b-set-password__header"}, t('passwordChangeHeader', 'SettingsModule')),
                m("div", {class: "form-group"}, [
                    m("label", {class: "b-set-password__password-label", for: "passwordField"}, t('passwordLabel', 'SettingsModule')),
                    m("input", {class: "b-set-password__password-input form-control", id: "passwordField", type: "password", oninput: m.withAttr("value", _password), value: _password()})
                ]),
                m("div", {class: "form-group"}, [
                    m("label", {class: "b-set-password__password-confirm-label", for: "passwordConfirmField"}, t('passwordConfirmLabel', 'SettingsModule')),
                    m("input", {class: "b-set-password__password-confirm-input form-control", id: "passwordConfirmField", type: "password", oninput: m.withAttr("value", _passwordConfirm), value: _passwordConfirm()})
                ]),
                (_passwordSaveErrors.length > 0 ? m("div", {class: "b-set-password__error-container alert alert-danger"}, [
                    _passwordSaveErrors.map(function(error){
                        return m("p", error)
                    })
                ]) : '')

            ]),
            m("div", {class: "b-settings__save-btn-container component-container clearfix"}, [
                m("button", {class: "btn btn-system btn-system-primary b-settings__save-btn", onclick: saveSettings}, t('saveBtn', 'App'))
            ]),
            _modalWindow
        ])
    }

    return{
        controller: controller,
        view: view
    }
};