'use strict';
var m = require('mithril');
module.exports = function (config) {
    var pages = 1;
    var currentPage = config.currentPage;
    var items = config.items > 0 ? config.items : 1;
    var itemsOnPage = config.itemsOnPage;
    var onPageClick = config.onPageClick;

    function prevPage(){
        if(currentPage > 1){
            currentPage--;
            changePage();
        }
    }

    function nextPage(){
        if(currentPage < pages){
            currentPage++;
            changePage();
        }
    }

    function inputChanged(){
        var value = this.value;
        if(value > 0 && value <= pages){
            currentPage = value;
            changePage();
        }
    }

    function onInput(){
        var value = this.value.replace(/[^0-9.]/g, "").replace(/^0+/, '');
        if(value > 0 && value <= pages){
            currentPage = value;
        }
        m.redraw.strategy('none');
    }

    function changePage(){
        onPageClick(currentPage);
    }

    function controller() {
        pages = Math.ceil(items / itemsOnPage);
        if(currentPage > pages){
            currentPage = 1;
        }
        document.onkeydown = function(e){
            if (e.keyCode == '13') {
                console.log(currentPage);
            }
        };
    }

    function view(ctrl) {
        return m("nav", {class: "pagination-container"},
            m("button", {class: "btn btn-default pagination__prev-btn", onclick: prevPage, disabled: currentPage === 1}, '<'),
            m("div", {class: "pagination__page-input-container"}, [
                m("input", {type: 'text', class: "form-control pagination__page-input", value: currentPage, onchange: inputChanged, oninput: onInput}),
                m("span", {class: "input-group-addon pagination__pages-count"}, ' / ' + pages)
            ]),
            m("button", {class: "btn btn-default pagination__next-btn", onclick: nextPage, disabled: currentPage === pages}, '>')
        );
    }

    return{
        controller: controller,
        view: view
    }
};