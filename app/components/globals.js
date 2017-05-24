'use strict';
var m = require('mithril');
var Helper = require('./helper.js')();
module.exports = function(){
    var language = m.prop('ru_RU');
    var langSettings = m.prop({app: "ru", db: "FIL_NAME_LANG_RUS", menu: "MNU_NAME"});
    var langList = {
        'ru_RU': {app: "ru", db: "FIL_NAME_LANG_RUS", menu: "MNU_NAME", alias: "ru_RU", name: "Русский"},
        'en_US': {app: "en", db: "FIL_NAME_LANG_ENG", menu: "MNU_NAME_ENG", alias: "en_US", name: "English"},
        'kz_KZ': {app: "kz", db: "FIL_NAME_LANG_KAZ", menu: "MNU_NAME_KAZ", alias: "kz_KZ", name: "Қазақ"}
    };
    var userData = m.prop({});
    var userHierarchy = m.prop('');
    var isAuthorized = m.prop(false);
    var menuData = m.prop({});
    var currentMenuItem = m.prop({});
    var initedModules = {};
    var token = m.prop('');
    var relocateData = {};

    function isAuth(){
        if(!isAuthorized()){
            m.route('/login');
        }
    }

    function registerModule($moduleName){
        if(initedModules.hasOwnProperty($moduleName)){
            initedModules[$moduleName].id++;
        }else{
            initedModules[$moduleName] = {id: 1};
        }
        return initedModules[$moduleName].id;
    }

    function setCurrentMenuItem($itemCode){
        if($itemCode){
            var currentItem = menuData()['menuItems'][$itemCode][0];
            currentMenuItem(currentItem);
        }else{
            currentMenuItem(false);
        }
    }

    function setDatePickerDefaults(){
        $.fn.datepicker.dates['en'] = {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            today: "Today",
            clear: "Clear",
            format: "dd-mm-yyyy",
            titleFormat: "MM yyyy", /* Leverages same syntax as 'format' */
            weekStart: 1
        };

        $.fn.datepicker.dates['ru'] = {
            days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
            daysShort: ["Вск", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Суб"],
            daysMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
            monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
            today: "Сегодня",
            clear: "Очистить",
            format: "dd.mm.yyyy",
            weekStart: 1,
            monthsTitle: 'Месяцы'
        };
    }

    return {
        isAuth: isAuth,
        setToken: function ($key) {token($key);},
        setUserData: function ($data) {userData($data);},
        setUserHierarchy: function ($data) {userHierarchy($data);},
        setIsAuthorized: function ($data) {isAuthorized($data)},
        setMenuData: function ($data) {menuData($data)},
        setLang: function (lang) {
            if(typeof langList[lang] != 'undefined'){
                language(lang);
            }else{
                language('ru_RU');
            }
            langSettings(langList[lang]);
        },
        setCurrentMenuItem: setCurrentMenuItem,
        setRelocateData: function(data){
            relocateData = data;
        },
        setDatePickerDefaults: setDatePickerDefaults,
        registerModule: registerModule,
        getLang: function () {return language()},
        getLangApp: function () {return langSettings()["app"];},
        getLangDb: function () {return langSettings()["db"];},
        getLangMenu: function () {return langSettings()["menu"];},
        getLangList: function () {return langList;},
        getToken: function () {return token();},
        getUserData: function () {return userData();},
        getUserHierarchy: function () {return userHierarchy();},
        getMenuData: function () {return menuData();},
        getCurrentMenuItem: function () {return currentMenuItem();},
        getRelocateData: function(){
            return relocateData
        }
    }
};