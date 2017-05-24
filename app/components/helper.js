'use strict';
var m = require('mithril');
module.exports = function () {
    function isNumeric($number){
        return !isNaN(parseFloat($number)) && isFinite($number);
    }

    function isArray($obj){
        if( Object.prototype.toString.call($obj) === '[object Array]' ) {
            return true;
        }
        return false;
    }

    function cloneObject(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = cloneObject(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = cloneObject(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    }

    function getURLParameter($name){
        return decodeURIComponent((new RegExp('[?|&]' + $name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
    }

    function checkResponse(requestData, response, callback, module, params){
        Timer.refresh();
        var error = false;
        var errorMessages = [];
        var messagesToShow = [];
        if(typeof response != 'undefined' && response.hasOwnProperty('error')) {
            error = true;
            var afterClose = null;
            if(response.hasOwnProperty('code')){
                errorMessages = [];
                switch(response.code){
                    case 'sql_error':
                        errorMessages.push(t('sqlError', 'Helper'));
                        messagesToShow.push(t('sqlError', 'Helper'));
                        errorMessages.push(response.error);
                        messagesToShow.push(response.error);
                    break;
                    case 'query_is_empty':
                        errorMessages.push(t('requiredParamsError', 'Helper'));
                        messagesToShow.push(t('requiredParamsError', 'Helper'));
                    break;
                    case 'token_expired':
                        afterClose = function(){
                            m.route('/login');
                        };
                        errorMessages.push(t('sessionExpiredError', 'Helper'));
                        messagesToShow.push(t('sessionExpiredError', 'Helper'));
                    break;
                }
            }
            if(typeof module.module != 'undefined' && typeof module.function != 'undefined'){
                errorMessages.push(t('moduleError', 'Helper', [{find: '{module}', replace: module.module}, {find: '{function}', replace: module.function}]));
            }
            var requestText = 'QUERY PARAMS: ';
            for(var key in requestData){
                if(key != 'token'){
                    requestText += key+' - "'+requestData[key]+'"; ';
                }
            }
            errorMessages.push(requestText);
            //shit shame
            $('.modal-backdrop').remove();
            console.log('show system error');
            GlobalSystemMessage.init({
                state: 'show',
                header: t('header', 'Helper'),
                messages: errorMessages,
                messagesToShow: messagesToShow,
                afterClose: (afterClose !== null ? afterClose : false)
            });
        }

        if(callback !== null && module.context !== null){
            if(typeof params != 'undefined'){
                callback.apply(module.context,[response, params]);
            }else{
                callback.apply(module.context,[response]);
            }
        }
    }

    function getData($callback, $context, $fields, $table, $where, $order, $start, $end){
        var requestData = {
            "token": Globals.getToken(),
            "fields": $fields,
            "table": $table,
            "where": $where,
            "operation": "get_query_data"
        };
        var selectData;

        if(typeof $order != 'undefined' && $order != null){
            requestData['order'] = $order;
        }

        if(typeof $start != 'undefined' && typeof $end != 'undefined'){
            requestData['start'] = $start;
            requestData['end'] = $end;
        }

        $.ajax({
            type: 'POST',
            url: Config.frontServices.selectPage,
            data: requestData,
            dataType : 'json',
            success: function(data){
                selectData = data;
            },
            complete: function(){
                checkResponse(requestData, selectData, $callback, $context);
            }
        });
    }

    function getCsv(callback, context, isReport, tableOrReport, where){
        var requestData = {
            token: Globals.getToken(),
            operation: "view_export"
        };
        if(isReport){
            requestData['report_code'] = tableOrReport;
        }else{
            requestData['table'] = tableOrReport;
            requestData['where'] = where;
        }
        var selectData;

        $.ajax({
            type: 'POST',
            url: Config.frontServices.exportPage,
            data: requestData,
            dataType : 'json',
            success: function(data){
                console.log(data);
                selectData = data;
            },
            complete: function(){
                checkResponse(requestData, selectData, callback, context);
            }
        });
    }

    function getDataEx($callback, $params, $context, $fields, $table, $where, $order, $start, $end){
        var requestData = {
            "token": Globals.getToken(),
            "fields": $fields,
            "table": $table,
            "where": $where,
            "operation": "get_query_data"
        };
        var selectData;

        if(typeof $order != 'undefined' && $order != null){
            requestData['order'] = $order;
        }

        if(typeof $start != 'undefined' && typeof $end != 'undefined'){
            requestData['start'] = $start;
            requestData['end'] = $end;
        }

        $.ajax({
            type: 'POST',
            url: Config.frontServices.selectPage,
            data: requestData,
            dataType : 'json',
            success: function(data){
                selectData = data;
            },
            complete: function(){
                checkResponse(requestData, selectData, $callback, $context, $params);
            }
        });
    }

    function updateData($callback, $context, $fields, $table, $where){
        var postData = {
            "token": Globals.getToken(),
            "fields": $fields,
            "table": $table,
            "where": $where,
            "operation": "set_update"
        };
        var selectData;
        $.ajax({
            type: 'POST',
            url: Config.frontServices.updatePage,
            data: postData,
            dataType : 'json',
            success: function(data){
                selectData = data;
            },
            complete: function(){
                checkResponse(postData, selectData, $callback, $context);
            }
        })
    }

    function insertData($callback, $context, $table, $fields, $values){
        var postData = {
            "token": Globals.getToken(),
            "table": $table,
            "fields": $fields,
            "values": $values,
            "operation": "set_insert"
        };
        var selectData = false;
        $.ajax({
            type: 'POST',
            url: Config.frontServices.insertPage,
            data: postData,
            dataType : 'json',
            success: function(data){
                selectData = data;
            },
            complete: function(){
                if($table === 'ST_USER'){
                    try{
                        Globals.setUserHierarchy(Globals.getUserHierarchy()+','+selectData[0].key)
                    }catch(e){
                        console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
                    }
                }
                checkResponse(postData, selectData, $callback, $context);
            }
        })
    }

    function execQuery($callback, $context, $query){
        var postData = {
            "token": Globals.getToken(),
            "query": $query,
            "operation": "exec_query"
        };
        var selectData;
        $.ajax({
            type: 'POST',
            url: Config.frontServices.queryPage,
            data: postData,
            dataType : 'json',
            success: function(data){
                selectData = data;
            },
            complete: function(){
                checkResponse(postData, selectData, $callback, $context);
            }
        })
    }

    function objectToArray($object){
        var array = [];
        for (var property in $object) {
            array.push($object[property]);
        }
        return array;
    }

    function getScrollbarWidth() {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        document.body.appendChild(outer);
        var widthNoScroll = outer.offsetWidth;
        // force scrollbars
        outer.style.overflow = "scroll";
        // add innerdiv
        var inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);
        var widthWithScroll = inner.offsetWidth;
        // remove divs
        outer.parentNode.removeChild(outer);
        return widthNoScroll - widthWithScroll;
    }

    function debounce(fn, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }

    function throttle(fn, threshhold, scope) {
        threshhold || (threshhold = 250);
        var last,
            deferTimer;
        return function () {
            var context = scope || this;
            var now = +new Date,
                args = arguments;
            if (last && now < last + threshhold) {
                // hold on to it
                clearTimeout(deferTimer);
                deferTimer = setTimeout(function () {
                    last = now;
                    fn.apply(context, args);
                }, threshhold);
            } else {
                last = now;
                fn.apply(context, args);
            }
        };
    }

    function formatBytes(bytes,decimals) {
        if(bytes == 0) return '0 Byte';
        var k = 1000;
        var dm = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    return{
        isNumeric: isNumeric,
        isArray: isArray,
        cloneObject: cloneObject,
        getURLParameter: getURLParameter,
        execQuery: execQuery,
        getData: getData,
        getCsv: getCsv,
        updateData: updateData,
        getDataEx: getDataEx,
        insertData: insertData,
        objectToArray: objectToArray,
        getScrollbarWidth: getScrollbarWidth,
        debounce: debounce,
        throttle: throttle,
        formatBytes: formatBytes
    }
};