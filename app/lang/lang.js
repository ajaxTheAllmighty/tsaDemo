'use strict';
var ru = require('./ru.js');
var en = require('./en.js');
var Helper = require('../components/helper.js')();
module.exports = function(){
    var langs = {
        ru: ru,
        en: en
    };

    function t(key, context, params){
        try{
            var result = langs[Globals.getLangApp()][context][key];
            if(typeof params !== 'undefined'){
                Object.keys(params).map(function(pKey){
                    var pValue = params[pKey];
                    pKey = '{' + pKey + '}';
                    result = result.replace(pKey, pValue);
                })
            }
            return result;
        }catch(e){
            return "t: "+key;
        }
    }

    return {
        t: t
    }
}


