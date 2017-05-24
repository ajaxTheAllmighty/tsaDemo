'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var TableComponent = require('../../../components/table/table.js');
var Modal = require('../../../components/modal-window/modal-window.js');
var DayDetailsModule = require('./day-details.js');
module.exports = function (config) {
    var startDate = config.startDate;
    var endDate = config.endDate;
    var users = config.users;

    var _datesArray = [];
    var _dateVisitArray = {};
    var _DayDetails = '';

    function parseDate(str, delimiter) {
        if(typeof delimiter == 'undefined'){
            delimiter = '-';
        }
        if(str){
            var m = str.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
            if(m) {
                return {d: m[1], m: m[2], y: m[3]};
            }else{
                var m = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
                if(m){
                    return {d:m[3], m:m[2], y:m[1]};
                }
            }
        }
        return false;
    }

    function visitsLoaded(data){
        data.map(function(visitObj){
            var date = visitObj['CAL_DATE'];
            var useCode = visitObj['USE_CODE'];
            if(_dateVisitArray.hasOwnProperty(date)){
                var dateObject = _dateVisitArray[date];
                if(!dateObject.hasOwnProperty(useCode)){
                    dateObject[useCode] = visitObj;
                }
            }else{
                _dateVisitArray[date] = {};
                _dateVisitArray[date][useCode] = visitObj;
            }
        });

        var sD = parseDate(startDate);
        var eD = parseDate(endDate);
        var start = new Date(sD.y, sD.m-1, sD.d, 0, 0, 0);
        var end = new Date(eD.y, eD.m-1, eD.d, 0, 0, 0);

        while (start <= end){
            _datesArray.push(start.getFullYear()+'-'+('0' + (start.getMonth()+1)).slice(-2)+'-'+('0' + start.getDate()).slice(-2));
            start.setDate(start.getDate() + 1);
        }
        m.redraw();
    }

    function showVisitDetails(){
        var date = this.getAttribute('data-day');
        var routeCode = this.getAttribute('data-routeCode');
        var routeName = this.getAttribute('data-routeName');
        var userCode = this.getAttribute('data-userCode');
        var userName = this.getAttribute('data-userName');
        var pD = parseDate(date);
        date = pD.d+'-'+pD.m+'-'+pD.y;

        _DayDetails = new Modal({
            id: 'dayDetailsModal',
            state: 'show',
            content: [
                new DayDetailsModule({
                    date: date,
                    routeCode: routeCode,
                    routeName: routeName,
                    userCode: userCode,
                    userName: userName
                })
            ],
            isStatic: false,
            header: 'Детали за "'+date+'"',
            isFooter: false,
            isFullScreen: true
        })
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {
        var useCodes = [];
        users.map(function(userObj){
            useCodes.push(userObj.code);
        });
        Helper.getData(visitsLoaded, {"context": this, "module": "VM-VisitMapModule", "function": "controller"}, '*', 'VIEW_ST_VISIT_MAP', "WHERE USE_CODE IN ("+useCodes.join(',')+") AND (CAL_DATE BETWEEN CONVERT(DATETIME,'"+startDate+"',104) AND CONVERT(DATETIME,'"+endDate+"',104))");
    }

    function view() {
        var tableConfig = function(el){
            if($('table',el).height() > $(el).height()){
                $('#VisitDateTable').css('margin-bottom', '17px');
            }

            //fixed header
            el.addEventListener("scroll",function(){
                var translate = "translate(0,"+this.scrollTop+"px)";
                $('#VisitDateTable thead').css('transform', translate);
                $('#VisitDetailsTable thead').css('transform', translate);
                //$('body').css('transform', 'translateY(-' + dest + 'px)');
                //thead.style.transform = translate;
                //this.querySelector("thead").style.transform = translate;
            });

            var dateTableContainer = $(".VM_visit-map__date-table");
            $(".VM_visit-map__detail-table").scroll(function() {
                dateTableContainer.prop("scrollTop", this.scrollTop);
            });
        }

        return m("div", {class: "VM_visit-map component-container"}, [
            m("div", {class: "VM_visit-map__date-table"}, [
                m("table", {id: "VisitDateTable", class: "table table-bordered table-striped table-hover"}, [
                    m("thead", [
                        m("tr", [
                            m("th", {class: "VM_visit-map__date-column"}, 'Дата')
                        ])
                    ]),
                    m("tbody", [
                        _datesArray.map(function(date){
                            return m("tr", [
                                m("td", {class: "VM_visit-map__date-column"}, date)
                            ])
                        })
                    ])
                ]),
            ]),
            m("div", {class: "VM_visit-map__detail-table", config: tableConfig}, [
                m("table", {id: "VisitDetailsTable", class: "table table-bordered table-striped table-hover"}, [
                    m("thead", [
                        m("tr", [
                            users.map(function(userObj){
                                return m("th",  userObj.name)
                            })
                        ])
                    ]),
                    m("tbody", [
                        _datesArray.map(function(date){
                            return m("tr", [
                                _dateVisitArray.hasOwnProperty(date) ?
                                    users.map(function(userObj){
                                        if(_dateVisitArray[date].hasOwnProperty(userObj.code)){
                                            return m("td", [
                                                m("button", {class: "VM_visit-map__visit-detail-btn btn btn-link btn-system-link", style: "color: " + _dateVisitArray[date][userObj.code]['ROU_COLOR'],
                                                    'data-routeCode': _dateVisitArray[date][userObj.code]['ROU_CODE'],
                                                    'data-routeName': _dateVisitArray[date][userObj.code]['ROU_NAME'],
                                                    'data-userName': _dateVisitArray[date][userObj.code]['USE_NAME'],
                                                    'data-day': date,
                                                    'data-userCode': userObj.code, onclick: showVisitDetails}, _dateVisitArray[date][userObj.code]['ROU_LABEL'])
                                            ]);
                                        }else{
                                            return m("td", 'нет данных');
                                        }
                                    }) :
                                    //empty
                                    users.map(function(userObj){
                                        return m("td", 'нет данных');
                                    })
                            ])
                        })
                    ])
                ])
            ]),
            _DayDetails
        ])
    }

    return {
        controller: controller,
        view: view
    }
}