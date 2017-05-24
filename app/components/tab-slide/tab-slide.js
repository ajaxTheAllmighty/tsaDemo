'use strict';
var m = require('mithril');
module.exports = function (config) {
    var _isFirstDraw = true;
    var tabId = config.tabId || 'someTab';
    var tabClass = config.tabClass || 'someTabClass';
    var tabHeader = config.tabHeader || '';
    var tabContent = config.tabContent || [];
    var tabLocation = config.tabLocation || 'left';
    var tabImage = config.tabImege || 'dist/assets/images/total_tab.png';
    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function view(){
        var tabConfig = function(){
            $('#'+tabId).unbind();
            $('#'+tabId).tabSlideOut({
                tabHandle: '#'+tabId+"__handle",
                pathToTabImage: tabImage,
                imageHeight: '415px',
                imageWidth: '50px',
                tabLocation: tabLocation,
                speed: 300,
                action: 'click',
                topPos: '100px',
                leftPos: '20px',
                fixedPosition: false
            });
            _isFirstDraw = false;
        }

        return m("div", {id: tabId, class: tabClass, config: (_isFirstDraw ? tabConfig : null)}, [
            m("div", {id: tabId+"__handle", class: tabClass+"__handle"}),
            (tabHeader ? m("h3", {class: tabClass+"__header"}, tabHeader) : ''),
            m("div", {class: tabClass+"__content"},
                tabContent
            )
        ]);
    }

    return {
        view: view
    }
};