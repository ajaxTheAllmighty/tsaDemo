'use strict';
var m = require('mithril');
module.exports = function () {
    var publicOptions = {};
    function getPageList(){
        var pageList = [],
            start = 0,
            pages = Math.ceil(publicOptions.items / publicOptions.itemsOnPage),
            end = pages,
            left = Math.max(parseInt(publicOptions.currentPage) - publicOptions.edges, 0),
            right = Math.min(parseInt(publicOptions.currentPage) + publicOptions.edges, pages);

        for(var i = start; i < end; i ++){
            var pageObj = {page:i+1, name: i+1};

            if(i + 1 == publicOptions.currentPage){
                pageObj.isCurrent = true;
            }
            if(	i == 0 || i == pages - 1 || pages < publicOptions.displayedPages){
                pageList.push(pageObj)
            } else{
                if(i == (right + 1) || i == (left - 1)) {
                    pageObj.name = publicOptions.ellipsis;
                    pageObj.isInactive = true;
                    pageList.push(pageObj);
                }
                if( i <= right && i >= left){
                    pageList.push(pageObj)
                }
            }

        }
        return pageList;
    }

    function selectPage(){
        publicOptions.onPageClick.call(this, this.getAttribute('data-page'));
    }

    function init($options){
        publicOptions = $.extend({
            items: 1,
            itemsOnPage: 1,
            currentPage: 1,
            displayedPages: 3,
            edges: 2,
            ellipsis : '&hellip;',
            prevText: 'Пред.',
            nextText: 'След.',
            onPageClick: function(pageNumber, event) {}
        }, $options || {});
    }

    function controller() {
        console.log('init old pagination');
        return {
            items: function () {
                return getPageList();
            },
            changePage: selectPage
        }
    }

    function view(ctrl) {
        return m("nav", {class: "pagination-container"},
            m("ul", {class: "pagination"}, [
                ctrl.items().map(function (item, index) {
                    if(item.isCurrent){
                        return m("li", {class: "active"},
                            m("a", item.name)
                        )
                    }else{
                        if(item.isInactive){
                            return m("li", {class: "disabled"},
                                m("a",
                                    m.trust(item.name)
                                )
                            )
                        }
                        return m("li", {},
                            m("a", {"data-page": item.page, onclick: ctrl.changePage},
                                m.trust(item.name)
                            )
                        )
                    }
                })
            ])
        );
    }

    return{
        init: init,
        controller: controller,
        view: view
    }
};