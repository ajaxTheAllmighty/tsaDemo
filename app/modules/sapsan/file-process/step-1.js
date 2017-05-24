'use strict';
module.exports = function(){
    function fileLinkListener($callback){
        $('#prepareFileLink').on('click', function () {
            $callback();
        })
    }

    function init($o){
        $('.b-first-step').show();
        fileLinkListener($o.linkClickCallback);
    }

    return{
        init: init
    }
};

