'use strict';
var m = require('mithril');
var MainPage = require('./pages/main/main.js');
var LoginPage = require('./pages/login/login.js')();
var ReferencePage = require('./pages/reference/reference.js');
var CalendarPage = require('./pages/calendar/calendar.js');
var FileProcessPage = require('./pages/file-process/file-process.js');
var IndirectProcessPage = require('./pages/indirect-process/indirect-process.js');
var ShipmentProcessPage = require('./pages/shipment-process/shipment-process.js');
var RoutesUploadPage = require('./pages/routes-upload/routes-upload.js');
var PlanUploadPage = require('./pages/plan-upload/plan-upload.js');
var ReportPage = require('./pages/report/report.js')();
var ImeiMigrationPage = require('./pages/imei-migration/imei-migration.js');
var ReportManagePage = require('./pages/report-manage/report-manage.js');
var RoutesPage = require('./pages/routes/routes.js');
var SettingsPage = require('./pages/settings/settings.js');
var SurveyManagePage = require('./pages/survey-manage/survey-manage.js');
var SurveyManageSimplePage = require('./pages/survey-manage-simple/survey-manage.js');
var ProgramPage = require('./pages/program-manage/program-manage.js');
var LocatorPage = require('./pages/maps/locator.js');
var HierarchyPage = require('./pages/user-tree/user-tree.js');
var ActivitiesOnMapPage = require('./pages/activity-on-map/activity-on-map.js');
var TaskManagePage = require('./pages/task-manage/task-manage.js');
var RelocatePage = require('./pages/relocate/relocate.js')();
var AdminTranslateManage = require('./pages/admin/translate-manage/translate-manage.js');
var VisitPage = require('./pages/visit/visit.js');
var SurveyLandingPage = require('./pages/survey-landing/survey-landing.js');
module.exports = function () {
    return {
        "/": MainPage,
        "/справочники/:referenceName": ReferencePage,
        "/календарь": CalendarPage,
        "/login": LoginPage,
        "/обработка_файлов": FileProcessPage,
        "/продажи_оптовиков": IndirectProcessPage,
        "/shipment": ShipmentProcessPage,
        "/импорт-маршрутов": RoutesUploadPage,
        "/импорт-планов": PlanUploadPage,
        "/отчеты": ReportPage,
        "/перенос_устройств": ImeiMigrationPage,
        "/управление_отчетами": ReportManagePage,
        "/маршруты": RoutesPage,
        "/настройки": SettingsPage,
        "/опросы_1_2_1": SurveyManagePage,
        "/опросы": SurveyManageSimplePage,
        //"/отчеты_по_городам": ChartsPage,
        "/управление_программами": ProgramPage,
        "/локатор": LocatorPage,
        "/орг_структура": HierarchyPage,
        "/результаты_активности": ActivitiesOnMapPage,
        "/задачи": TaskManagePage,
        "/визиты": VisitPage,
        "/relocate/:hash": RelocatePage,
        "/управление_переводом": AdminTranslateManage,
        "/survey": SurveyLandingPage
        //"/тест": TestPage
    };
}