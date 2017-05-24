'use strict';
var Config = function(){
    var title = 'BAT - Targeted Surveys and Audit';
    var logo = 'tsa.png';
    var serverAddress = 'http://89.218.7.214:1080/';
    var mainServices = 'BAT_APP_SERVICES_BY';
    var rootFolder = 'tsa/';
    var exportFolder = '/PROMO/BY/csv';
    var helpFile = '/PROMO/BY/help/HELP.html';
    var reportBackupFolder = 'reports/templates/backup/';
    var frontServices = {
        //loginPage:    serverAddress + 'TSA.APP.KZ/Operations',
        //selectPage:   serverAddress + 'TSA.APP.KZ/Operations',
        //updatePage:   serverAddress + 'TSA.APP.KZ/Operations',
        //insertPage:   serverAddress + 'TSA.APP.KZ/Operations',
        //queryPage:    serverAddress + 'TSA.APP.KZ/Operations',
        //exportPage:   serverAddress + 'TSA.APP.KZ/Operations',
        //relocatePage: serverAddress + 'TSA.APP.KZ/Operations',
        //uploadPhoto:  serverAddress + 'TSA.APP.KZ/Operations'
        loginPage:   'http://service.tsaplatform.com/TSA.APP.BAT-UZ/Operations',
        selectPage:  'http://service.tsaplatform.com/TSA.APP.BAT-UZ/Operations',
        updatePage:  'http://service.tsaplatform.com/TSA.APP.BAT-UZ/Operations',
        insertPage:  'http://service.tsaplatform.com/TSA.APP.BAT-UZ/Operations',
        queryPage:   'http://service.tsaplatform.com/TSA.APP.BAT-UZ/Operations',
        exportPage:  'http://service.tsaplatform.com/TSA.APP.BAT-UZ/Operations',
        relocatePage:'http://service.tsaplatform.com/TSA.APP.BAT-UZ/Operations',
        uploadPhoto: 'http://service.tsaplatform.com/TSA.APP.BAT-UZ/Operations'
    };

    return {
        reportBackupFolder: reportBackupFolder,
        serverAddress: serverAddress,
        mainServices: mainServices,
        frontServices: frontServices,
        rootFolder: rootFolder,
        exportFolder: exportFolder,
        helpFile: helpFile,
        title: title,
        logo: logo
    };
}();