'use strict';
var m = require('mithril');
module.exports = function () {
    var _timer = false;
    var _sessionTime = 1000*60*30;
    function refresh(){
        clearTimeout(_timer);
        _timer = setTimeout(logout, _sessionTime);
    }

    function logout(){
        m.route('/login?session_expired');
    }

    function stop(){
        clearTimeout(_timer);
    }

    function start(){
        _timer = setTimeout(logout, _sessionTime);
    }

    return {
        start: start,
        stop: stop,
        refresh: refresh
    };
}