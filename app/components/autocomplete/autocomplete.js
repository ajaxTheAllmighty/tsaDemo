'use strict';
var m = require('mithril');
module.exports = function () {
    var state = "default";
    var isSmall = false;
    var maxToShow = 10;
    var value = m.prop(false);
    var title = m.prop("");
    var dataArray = [];
    var valueField = 'code';
    var titleField = 'title';
    var founded = 0;
    var foundArray = [];
    var selectedIndex = 0;
    var onSelect;
    var placeholder;

    function selectItem(){
        value(this.getAttribute("data-value"));
        title(this.innerHTML);
        state = 'default';
        selectedIndex = 0;
        onSelect(title(), value());
    }

    function onFocus(){
        state = 'list';
    }

    function onBlur(){
        setTimeout(function(){
            state = 'default';
            m.redraw();
        }, 200);
    }

    function onInput(){
        title(this.value);
        search();
    }

    function search(){
        founded = 0;
        foundArray = [];
        for (var i = 0; i < dataArray.length; i++) {
            var option = dataArray[i];
            var regExp = new RegExp(title(),"i");
            if(option[titleField] != null && option[titleField] != ''){
                if(option[titleField].search(regExp) != -1){
                    foundArray.push(option);
                    if(i == maxToShow){break;}
                }
            }
        }
    }

    function clean(){
        value(false);
        title('');
        search();
    }

    ///////////////////////////////////////////////////
    //     COMPONENT CONTROLLER AND VIEW METHODS     //
    ///////////////////////////////////////////////////

    function controller(config) {
        isSmall = config.isSmall || false;
        valueField = config.valueField || 'value';
        titleField = config.titleField || 'title';
        value = m.prop(config[valueField] || false);
        title = m.prop(config[titleField] || "");
        maxToShow = config.maxToShow || 10;
        placeholder = config.placeholder || t("inputPlaceholder", "AutocompleteComponent");
        onSelect = config.onSelect || function(){console.log(value(), title())};
        dataArray = config.data || [];
        search();

        document.onkeydown = function(e){
            if(state == 'list'){
                e = e || window.event;
                if (e.keyCode == '38') {
                    if(selectedIndex > 0){
                        selectedIndex--;
                    }
                    m.redraw();
                }
                if (e.keyCode == '40') {
                    if(selectedIndex < foundArray.length - 1){
                        selectedIndex++;
                    }
                    m.redraw();
                }
                if (e.keyCode == '13') {
                    var selectedItem = foundArray[selectedIndex];
                    value(selectedItem[valueField]);
                    title(selectedItem[titleField]);
                    state = 'default';
                    selectedIndex = 0;
                    onSelect(title(), value(), true);
                    m.redraw();
                }
            }
        };
    }

    function view() {
        switch(state){
            case 'default':
                return m("div", {class: "ac-component"}, [
                    m("div", {class: "ac-input-container"},
                        m("input", {class: "form-control"+(isSmall ? ' ac-input_small' : ''), type: "text", value: title(), placeholder: placeholder, oninput: onInput, onfocus: onFocus}),
                        m("span", {class: "ac-list-icon_closed"}, [])
                    ),
                ]);
            break;
            case 'list':
                return m("div", {class: "ac-component"}, [
                    m("div", {class: "ac-input-container"},
                        m("input", {class: "form-control"+(isSmall ? ' ac-input_small' : ''), type: "text", value: title(), placeholder: placeholder, oninput: onInput, onblur: onBlur, config: function(el){el.focus();}}),
                        m("span", {class: "ac-list-icon_open"}, [])
                    ),
                    m("div", {class: "ac-options-container"}, [
                        foundArray.map(function(option, index){
                            return m("div", {class: "ac-option"+(index == selectedIndex ? '_active' : ''), "data-value": option[valueField], "data-title": option[titleField], onclick: selectItem}, option[titleField])
                        })
                    ])
                ]);
            break;
        }
    }
    return{
        clean: clean,
        controller: controller,
        view: view
    }
};