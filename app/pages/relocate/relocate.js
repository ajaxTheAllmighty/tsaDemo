'use strict';
var m = require('mithril');
var Helper = require('../../components/helper.js')();
var Modal = require('../../components/modal-window/modal-window.js');
module.exports = function(){
    var response;
    var _state = 'loading';
    var _errors = [];

    function getLinkParams(hash){
        $.ajax({
            type: 'POST',
            url: Config.frontServices.relocatePage,
            data: {'hash': hash, 'operation': 'relocate'},
            dataType : 'json',
            success: function(data){
                response = data;
            },
            complete: function(){
                if(response.hasOwnProperty('error')){
                    console.log(response.error, response.code);
                    _errors.push('Данная ссылка уже неактивна.');
                    _state = 'error';
                    m.redraw();
                }else{
                    response = response[0];
                    Globals.setToken(response['USE_ACCESS_TOKEN']);
                    Timer.start();
                    Helper.getData(userDataLoaded, {"context": this, "module": "Relocate Page", "function": "getLinkParams"}, '*', 'VIEW_AUTHENTICATION', "WHERE USE_CODE = "+response['AAR_USE_CODE']);
                }
            },
            error: function(e){
                console.log(e);
                _errors.push('Ошибка получения данных.');
                _state = 'error';
                m.redraw();
            }
        });
    }

    function userDataLoaded(userData){
        if(userData.length == 1){
            Globals.setUserData(userData[0]);
            Globals.setLang(userData[0]['USE_LANG']);
            getHierarchy();
        }else{
            console.log('auth error!');
            _errors.push('Ошибка авторизации.');
            _state = 'error';
            m.redraw();
        }
    }

    function getHierarchy(){
        Helper.getData(hierarchyLoaded, {"context": this, "module": "Login Page", "function": "getHierarchy"}, 'USE_CODE', 'F_GET_USER_HIERARCHY(' + Globals.getUserData()['USE_CODE'] + ')', "WHERE 1=1");
    }

    function hierarchyLoaded(data) {
        var userHierarchy = '';
        for (var i = 0; i < data.length; i++) {
            if(i == 0){
                userHierarchy += data[i]['USE_CODE'];
            }else{
                userHierarchy += "," + data[i]['USE_CODE'];
            }
        }
        Globals.setUserHierarchy(userHierarchy);
        Globals.setIsAuthorized(true);
        loadMainMenu();
    }

    function loadMainMenu(){
        Helper.getData(sortMenuItems, {"context": this, "module": "Login Page", "function": "loadMainMenu"}, '*', 'VIEW_ST_MENU_ROLE_FILTER', "WHERE MNU_IS_ACTIVE = 1 AND USR_CODE = "+ Globals.getUserData()['USR_CODE']+" AND MRF_FIELD_ACCESS > 0", 'MNU_ORDER');
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
        relocate();
    }

    function relocate(){
        try{
            Globals.setRelocateData(JSON.parse(response['AAR_DATA']));
        }catch(e){
            console.log('enable get parse data');
        }
        console.log(response);
        m.route(response['AAR_ROUTE']);
    }

    function controller() {
        _errors = [];
        if (typeof m.route.param("hash") !== 'undefined') {
            var hash = m.route.param("hash");
            getLinkParams(hash);
        } else {
            m.route('/login');
        }
    }

    function view() {
        switch(_state){
            case 'loading':
                return m("div", {class: "relocate-page"},[
                    new Modal({
                        id: 'relocateLoading',
                        state: 'show',
                        content: [
                            m("img", {
                                class: "grid-loading-modal__body--loader",
                                src: "dist/assets/images/loading.gif"
                            }),
                            t('loadingModalBodyMsg', 'GridModule')
                        ],
                        isStatic: true,
                        header: 'Загрузка данных для перенаправления',
                        isFooter: false,
                        isFullScreen: false,
                        modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                        zIndex: 1005
                    })
                ])
            break;
            case 'error':
                return m("div", {class: "relocate-page"},[
                    new Modal({
                        id: 'relocateError',
                        state: 'show',
                        content: [
                            _errors.map(function(error){
                                return m("p", error)
                            }),
                            m("strong", 'Необходимо авторизоваться в системе.')
                        ],
                        isStatic: false,
                        header: 'Ошибка перенаправления',
                        isFooter: true,
                        cancelBtn: 'none',
                        confirmBtn: 'Ok',
                        onConfirm: function(){
                            m.route('login/')
                        },
                        isFullScreen: false,
                        modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                        zIndex: 1005
                    })
                ])
            break;
        }
    }
    return {
        controller: controller,
        view: view
    }
};

