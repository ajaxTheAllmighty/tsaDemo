'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var Modal = require('../../../components/modal-window/modal-window.js');
module.exports = function () {
    var state;
    var currentDate;
    var monthCalendarArray = {};
    var weekendDays = [];
    var monthWorkingDays = 0;
    var monthWeekendDays = 0;
    var weekNumbers = [];

    var currentCalendarCell;
    var currentCellData = {};
    var _InfoModal = '';

    function getCalendarData(){
        monthCalendarArray = {};
        m.startComputation();
        state = 'loading';
        Helper.getData(calendarDataLoaded, {"context": this, "module": "Calendar module", "function": "getCalendarData"}, 'CAL_CODE, CAL_DATE, CAL_IS_WORKING, CAL_SUMTO', 'VIEW_WT_CALENDAR', "WHERE CAL_MONTH = "+ (currentDate.getMonth()+1)+ " AND CAL_YEAR = " + currentDate.getFullYear());
    }

    function parseDate(str, delimiter) {
        if(typeof delimiter == 'undefined'){
            delimiter = '-';
        }
        if(str){
            var m = str.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
            if(m) {
                return m[1] + delimiter + m[2] + delimiter + m[3];
            }else{
                var m = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
                if(m){
                    return m[3] + delimiter + m[2] + delimiter + m[1];
                }
            }
        }
        return false;
    }

    function calendarDataLoaded($data){
        monthWorkingDays = 0;
        for (var i = 0; i < $data.length; i++) {
            var dayObject = $data[i];
            monthCalendarArray[dayObject['CAL_DATE']] = {
                code: dayObject['CAL_CODE'],
                start: dayObject['CAL_DATE'],
                end: dayObject['CAL_DATE'],
                sumTo: dayObject['CAL_SUMTO'],
                rendering: 'background',
                isActive: (dayObject['CAL_IS_WORKING'] == 1 ? true : false)
            };
            if(dayObject['CAL_IS_WORKING'] == 1){
                monthWorkingDays++;
            }
        }
        monthWeekendDays = $data.length - monthWorkingDays;
        Helper.execQuery(getWeek,  {"context": this, "module": "Calendar module", "function": "calendarDataLoaded"}, "SET DATEFIRST 1");
    }

    function getWeek() {
        Helper.getData(weekLoaded, {"context": this, "module": "Calendar module", "function": "calendarDataLoaded"}, 'CAL_WEEK', 'VIEW_CALENDAR_WEEK', "WHERE CAL_MONTH = "+ (currentDate.getMonth()+1)+ " AND CAL_YEAR = " + currentDate.getFullYear());
    }

    function weekLoaded(data){
        weekNumbers = data;
        state = 'loaded';
        m.endComputation();
    }

    function showError(){
        $('#errorModal').modal('show');
    }

    function showModal(calendarCell, dayObject){
        currentCalendarCell = calendarCell;
        currentCellData.code = dayObject.code;
        currentCellData.date = dayObject.start;
        if(dayObject.isActive){
            $('#fieldSumTo').prop('disabled', true);
        }else{
            $('#fieldSumTo').prop('disabled', false);
        }

        $('#modalCalendarHeader').html(t('dateEditHeader', 'CalendarModule')+'"'+parseDate(dayObject.start)+'"');
        $('#isWeekend').prop('checked', !dayObject.isActive);
        $("#fieldSumTo").datepicker("update", parseDate(dayObject.sumTo));
        $('#fieldSumTo').val(parseDate(dayObject.sumTo));
        $('#calendarModal').modal('show');
    }

    function saveCell(){
        currentCellData.isActive = !$('#isWeekend').prop('checked');
        currentCellData.sumTo = $('#fieldSumTo').val();
        if(!currentCellData.isActive && parseDate(currentCellData.date) == currentCellData.sumTo){
            $('#calendarModal').modal('hide');
            _InfoModal = new Modal({
                id: 'calendarInfoModal',
                state: 'show',
                content: [
                    t('sumToSameDateError', 'CalendarModule')
                ],
                isStatic: false,
                header: 'Ошибка',
                isFooter: true,
                isFullScreen: false,
                modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                zIndex: 1100,
                onConfirm: function(){
                    _InfoModal = '';
                },
                cancelBtn: 'none'
            })
            m.redraw();
        }else{
            if(currentCellData.isActive){
                currentCalendarCell.css('background-color', '#8BC34A');
            }else{
                currentCalendarCell.css('background-color', '#FF2D2D');
            }
            Helper.updateData(calendarUpdated, this, "CAL_IS_WORKING = "+(currentCellData.isActive ? 1 : 0)+", CAL_SUMTO = CONVERT(DATETIME,'"+currentCellData.sumTo+"',104)", "WT_CALENDAR", "CAL_CODE = "+currentCellData.code);
        }
    }

    function calendarUpdated(){
        $('#calendarModal').modal('hide');
        getCalendarData();
        $('#calendar').fullCalendar('destroy');
        $('#calendar').fullCalendar('render');
    }

    function initCalendar(el){
        weekendDays = [];
        $(el).fullCalendar('destroy');
        $(el).fullCalendar({
            lang : Globals.getLangApp(),
            header: {
                left: 'prevYear, prev, next, nextYear',
                center: 'title',
                right: ''
            },
            defaultDate: currentDate.getFullYear()+"-"+(currentDate.getMonth()+1)+"-"+15,
            dayRender: function (date, cell) {
                if(monthCalendarArray.hasOwnProperty(date.format())){
                    var dayObject = monthCalendarArray[date.format()];
                    if(dayObject.isActive){
                        if(dayObject.sumTo != dayObject.start){
                            cell.append('<div class="cell-sum-to" id="cellDay-'+dayObject.code+'">'+t('sumToLabel', 'CalendarModule') + parseDate(dayObject.sumTo, '.') + '</div>');
                        }
                        cell.css("background-color", "#8BC34A");
                    }else{
                        cell.append('<div class="cell-sum-to" id="cellDay-'+dayObject.code+'">Суммируется с ' + parseDate(dayObject.sumTo, '.') + '</div>');
                        cell.css("background-color", "#FF2D2D");
                        weekendDays.push(parseDate(date.format()));
                    }
                }
            },
            dayClick: function(date, jsEvent, view) {
                var currentDay = new Date();
                if((date._d.getMonth() >= currentDay.getMonth() && date._d.getFullYear() >= currentDay.getFullYear()) || date._d.getFullYear() > currentDay.getFullYear()){
                    var selectedDate = date.format();
                    var dayObject = monthCalendarArray[selectedDate];
                    showModal($(this),dayObject);
                }else{
                    showError();
                }
            },
            events: Helper.objectToArray(monthCalendarArray)
        });

        $('.fc-right').append('<div class="legeng-content"><div class="legend-row"><div class="legend-container"><div class="work-day-block"></div> - '+t('workDayLabel', 'CalendarModule')+' ('+monthWorkingDays+')</div></div> <div class="legend-row"><div class="legend-container"><div class="weekend-day-block"></div> - '+t('weekendDayLabel', 'CalendarModule')+' ('+monthWeekendDays+')</div></div></div>');

        $('.fc-prev-button').unbind('click');
        $('.fc-prev-button').click(function() {
            state = 'default';
            currentDate.setMonth(currentDate.getMonth() - 1 );
            getCalendarData();
            $(el).fullCalendar('prev');
        });

        $('.fc-next-button').unbind('click');
        $('.fc-next-button').click(function() {
            state = 'default';
            currentDate.setMonth(currentDate.getMonth() + 1 );
            getCalendarData();
            $(el).fullCalendar('next');
        });

        $('.fc-prevYear-button').unbind('click');
        $('.fc-prevYear-button').click(function() {
            state = 'default';
            currentDate.setYear(currentDate.getFullYear() - 1 );
            getCalendarData();
            $(el).fullCalendar('prevYear');
        });

        $('.fc-nextYear-button').unbind('click');
        $('.fc-nextYear-button').click(function() {
            state = 'default';
            currentDate.setYear(currentDate.getFullYear() + 1 );
            getCalendarData();
            $(el).fullCalendar('nextYear');
        });


        $('#saveCalendarBtn').unbind('click');
        $('#saveCalendarBtn').click(saveCell);

        $('#isWeekend').on('change', function(){
            if($('#isWeekend').prop('checked')){
                $('#fieldSumTo').prop('disabled', false);
            }else{
                $('#fieldSumTo').prop('disabled', true);
            }
        });
    }

    function controller() {
        state = 'default';
        currentDate = new Date();
    }

    function view() {
        switch(state){
            case 'default':
                getCalendarData();
                return m("div", {}, "");
                break;
            case 'loading':
                return m("div", {}, "loading data");
                break;
            case 'loaded':
                var config = function(el){
                    var year = currentDate.getFullYear();
                    var month = currentDate.getMonth()+1;
                    var daysInMonth = new Date(year, month, 0).getDate();
                    $(el).datepicker('remove');

                    $(el).on('changeDate', function(ev){
                        $(this).datepicker('hide');
                    });

                    $(el).datepicker({
                        weekStart: 1,
                        format: 'dd-mm-yyyy',
                        language: Globals.getLangApp(),
                        startDate: "01-"+month+"-"+year,
                        endDate: daysInMonth+"-"+month+"-"+year,
                        beforeShowDay: function(date){
                            var calendarDay = ('0' + date.getDate()).slice(-2) + '-'+ ('0' + (date.getMonth()+1)).slice(-2) + '-'+ date.getFullYear();
                            if(weekendDays.indexOf(calendarDay) != -1){
                                return false;
                            }
                            return true;
                        }
                    });
                };
                return m("div", {class: "calendar-content component-container"},[
                    m("div", {class: "calendar__week-number-container"}, [
                        m("table", {class: "table table-bordered calendar__week-number-table"}, [
                            m("thead", {}, [
                                m("tr",
                                    m("th", 'Нед')
                                )
                            ]),
                            m("tbody", {}, [
                                weekNumbers.map(function(weekObj){
                                    return m("tr", m("td", weekObj['CAL_WEEK']))
                                })
                            ])
                        ])
                    ]),
                    m("div", {class: "calendar-container", config: initCalendar}, []),
                    m("div", {class: "calendar__modals-container"}, [
                        m("div", {class: "modal fade b-calendar-modal", id: "calendarModal", tabindex: "-1", role: "dialog"},
                            m("div", {class: "modal-dialog calendar-modal__dialog", role: "document"},
                                m("div", {class: "modal-content"}, [
                                    m("div", {class: "modal-header"},
                                        m("h4", {class: "modal-title calendar-modal__header", id: "modalCalendarHeader"}, "")
                                    ),
                                    m("div", {class: "modal-body modal-title calendar-modal__body"},[
                                        m("table", {class: "table calendar-modal__table"}, [
                                            m("tbody",
                                                m("tr", {}, [
                                                    m("td", {class: "calendar-modal__table-column_header"}, t('weekendDayColumnLabel', 'CalendarModule')),
                                                    m("td", {},
                                                        m("input", {type: "checkbox", class: "calendar-modal__table-checkbox", id: "isWeekend"})
                                                    )
                                                ]),
                                                m("tr", {}, [
                                                    m("td", {class: "calendar-modal__table-column_header"}, t('sumWithColumnLabel', 'CalendarModule')),
                                                    m("td", {},
                                                        m("input", {type: "text", class: "form-control", id: "fieldSumTo", config: config})
                                                    )
                                                ])
                                            )
                                        ])
                                    ]),
                                    m("div", {class: "calendar-modal__footer"}, [
                                        m("button", {type: "button", class: "btn btn-system btn-system-cancel calendar-modal__cancel-btn", "data-dismiss": "modal"}, t('cancelBtn', 'App')),
                                        m("button", {type: "button", class: "btn btn-system btn-system-primary calendar-modal__save-btn", id: "saveCalendarBtn"}, t('saveBtn', 'App'))
                                    ])
                                ])
                            )
                        ),
                        m("div", {class: "modal fade b-calendar-modal", id: "errorModal", tabindex: "-1", role: "dialog"},
                            m("div", {class: "modal-dialog calendar-modal__dialog", role: "document"},
                                m("div", {class: "modal-content"}, [
                                    m("div", {class: "modal-header"},
                                        m("h4", {class: "modal-title calendar-modal__header"}, t('errorModalHeader', 'CalendarModule'))
                                    ),
                                    m("div", {class: "modal-body modal-title calendar-modal__body"},[
                                        m("p", {class: "calendar-modal__message"}, t('errorModalMessage1', 'CalendarModule')),
                                        m("p", {class: "calendar-modal__message"}, t('errorModalMessage2', 'CalendarModule'))
                                    ]),
                                    m("div", {class: "calendar-modal__footer"}, [
                                        m("button", {type: "button", class: "btn btn-system btn-system-cancel calendar-modal__cancel-btn", "data-dismiss": "modal"}, t('okBtn', 'App')),
                                    ])
                                ])
                            )
                        )
                    ]),
                    _InfoModal
                ]);
                break;
            default:
                getCalendarData();
                return m("div", {}, "");
                break;
        }
    }

    return{
        controller: controller,
        view: view
    }
};