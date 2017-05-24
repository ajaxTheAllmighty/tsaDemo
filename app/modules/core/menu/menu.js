'use strict';
var m = require('mithril');
module.exports = function () {
    var menuData = {};
    function generateLink($item){
        var link = '';
        switch($item['MNU_MODULE']){
            case 'modules/references/MainReferenceSmartGrid.swf':
                if($item['MNU_IS_REFERENCE'] == 1){
                    try{
                        link = '/справочники/'+$item[Globals.getLangMenu()].replace('/','|');
                    }catch(e){
                        link = '/справочники/нет_имени';
                        //console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
                    }
                }
                break;
            case 'modules/operations/ManageRoutes.swf':
                link = '/маршруты';
                break;
            case 'modules/reports/ReportViewerExcel.swf':
                link = '/отчеты';
                break;
            case 'file-process':
                link = '/обработка_файлов';
                break;
            case 'indirect-process':
                link = '/продажи_оптовиков';
                break;
            case 'shipment':
                link = '/shipment';
                break;
            case 'routes-upload':
                link = '/импорт-маршрутов';
                break;
            case 'plan-upload':
                link = '/импорт-планов';
                break;
            case 'calendar':
                link = '/календарь';
                break;
            case 'salepoint-program-manage':
                link = '/управление_программами';
                break;
            case 'imei-migration':
                link = '/перенос_устройств';
                break;
            case 'report-manage':
                link = '/управление_отчетами';
                break;
            case 'city-report':
                link = '/отчеты_по_городам';
                break;
            case 'modules/operations/ManageRouteCalendar.swf':
                link = '/маршруты';
                break;
            case 'modules/merch/ManageSurveys.swf':
                link = '/опросы_1_2_1';
                break;
            case 'modules/admin/ManageUsersByCompany.swf':
                link = '/орг_структура';
                break;
            case 'modules/admin/ManageUsers.swf':
                link = '/орг_структура';
                break;
            case 'modules/merch/ManageSurveysSimple.swf':
                link = '/опросы';
                break;
            case 'modules/reports/ReportPromoVisitsOnMap.swf':
                link = '/результаты_активности';
                break;
            case 'modules/operations/ManageVisits.swf':
                link = '/визиты';
                break;
            default:
                link = '/';
                break;
        }
        return link;
    }

    function saveCurrentLink(){
        Globals.setCurrentMenuItem(this.getAttribute('data-code'));
        m.route(this.getAttribute('data-link'));
    }

    function controller() {
        menuData = Globals.getMenuData();
        Globals.isAuth();
    }

    function view() {
        return m("div", {class: "b-menu"},  [
            m("nav", {class: "navbar navbar-default"},
                m("div", {class: "container-fluid b-menu__container-fluid"}, [
                    m("div", {class: "collapse navbar-collapse b-menu__navbar-collapse", id: "main-menu-collapse"},[
                        m("ul", {class: "nav navbar-nav"}, [
                            menuData.rootMenu.map(function(rootItem, index) {
                                var rootIsActive = false;
                                if(rootItem['MNU_CODE'] == Globals.getCurrentMenuItem()['PAR_MNU_CODE']){
                                    rootIsActive = true;
                                }
                                return m("li", {class: "dropdown"+(rootIsActive ? " active" : "")}, [
                                    m("a", {class: "dropdown-toggle", "data-toggle": "dropdown", role: "button", "aria-haspopup": "true", "aria-expanded": "false"}, [
                                        rootItem[Globals.getLangMenu()] + (rootIsActive ? " / "+Globals.getCurrentMenuItem()[Globals.getLangMenu()] : ""),
                                        m("span", {class: "caret"}, "")
                                    ]),
                                    (typeof menuData.menuArray[rootItem['MNU_CODE']] != 'undefined' ?
                                        m("ul", {class: "dropdown-menu"}, [
                                            menuData.menuArray[rootItem['MNU_CODE']].map(function(subItem, index) {
                                                var isActive = '';
                                                if(subItem['MNU_CODE'] == Globals.getCurrentMenuItem()['MNU_CODE']){
                                                    isActive = 'active';
                                                }
                                                return m("li", {class: ""+isActive},
                                                    m("button", {class: "btn menu-btn", "data-code": subItem['MNU_CODE'], "data-link": generateLink(subItem), onclick: saveCurrentLink}, subItem[Globals.getLangMenu()])
                                                )
                                            })
                                        ]) : ''
                                    )
                                ])
                            })
                        ])
                    ])
                ])
            )
        ]);
    }

    return{
        controller: controller,
        view: view
    }
};