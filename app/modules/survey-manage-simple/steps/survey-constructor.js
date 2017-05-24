'use strict';
var m = require('mithril');
var Helper = require('../../../components/helper.js')();
var Modal = require('../../../components/modal-window/modal-window.js');
var NextQuestionPicker = require('./next-question-picker.js');
module.exports = function (config) {
    var state = config.state;
    var survey = config.survey;
    var _questionSelected = false;
    var _answersToShow = m.prop([]);
    var _nextQuestions = {};
    var _colorSet = ['#013a75', '#FF851B', '#0074D9', '#FF4136', '#7FDBFF', '#85144b', '#39CCCC', '#F012BE', '#3D9970', '#B10DC9', '#2ECC40', '#111111', '#FFDC00', '#DDDDDD', '#01FF70', '#AAAAAA'];
    var _shiftPressed = false;
    var _lastSelectedRow = false;
    var _selectedQuestionArray = [];
    var _redrawCountAfterDrag = 1;
    var _answerRedrawCountAfterDrag = 1;
    var _unsaved = m.prop(false);
    var _detailsCount = 0;
    var _detailsSaved = 0;
    var _QuestionSourceGrid = '';
    var _NextQuestionPicker = '';
    var _InformModal = '';
    var _SavingModal = '';
    var _CheckSurveyModal = '';

    var Model = {
        questionsCodes: m.prop([]),
        questions: m.prop({}),
        answers: m.prop([]),
        addQuestion: function(question){
            question.answers = [];
            this.questions()[question['QUE_CODE']] = question;
        },
        addAnswer: function(questionCode, answer){
            this.questions()[questionCode].answers.push(answer);
        },
        changeNextQuestion: function(question, selectedAnswer, nextQuestion, applyToAll){
            if(applyToAll){
                this.questions()[question].answers.map(function(answer, index){
                    answer['ANS_NEXT_QUE_CODE'] = nextQuestion;
                })
            }else{
                this.questions()[question].answers.map(function(answer, index){
                    if(answer['ANS_CODE'] == selectedAnswer){
                        answer['ANS_NEXT_QUE_CODE'] = nextQuestion;
                    }
                })
            }
        },
        changeMandatory: function(questionCode, answerCode, mandatory){
            this.questions()[questionCode].answers.map(function(answer, index){
                if(answer['ANS_CODE'] == answerCode){
                    answer['SUD_ANS_IS_MANDATORY'] = mandatory;
                }
            })

        },
        removeQuestion: function(index){
            if(typeof this.questionsCodes()[index] !== 'undefined'){
                var questionCode = this.questionsCodes()[index];
                this.questionsCodes().splice(index, 1);
                try{
                    delete this.questions()[questionCode];
                }catch(e){
                    console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
                }
            }
        },
        setAnswers: function(questionCode, answersArray){
            this.questions()[questionCode].answers = answersArray;
        },
        saveSurvey: function(){
            _detailsCount = 0;
            _detailsSaved = 0;
            this.questionsCodes().map(function(questionCode, index){
                Model.questions()[questionCode].answers.map(function(answer, index){
                    _detailsCount++;
                })
            });

            var order = 0;
            this.questionsCodes().map(function(questionCode, index){
                Model.questions()[questionCode].answers.map(function(answer, index){
                    var nextQuestion = answer['ANS_NEXT_QUE_CODE'] ? answer['ANS_NEXT_QUE_CODE'] : 'NULL';
                    var isMandatory = answer['SUD_ANS_IS_MANDATORY'] ? 1 : 0;
                    Helper.insertData(Model.surveyDetailInserted, {"context": this, "module": "Survey Constructor module", "function": "saveSurvey"}, "ST_SURVEY_DETAILS",
                        'SUD_SUR_CODE, SUD_QUE_CODE, SUD_ANS_CODE, SUD_ANS_NEXT_QUE_CODE, SUD_ANS_IS_MANDATORY, SUD_SHOW_ORDER',
                        survey.code+','+questionCode+','+answer['ANS_CODE']+','+nextQuestion+','+isMandatory+','+order);
                    order++;
                })
            });
        },
        surveyDetailInserted: function(){
            _detailsSaved++;
            if(_detailsSaved == _detailsCount){
                _SavingModal = '';
                _unsaved(false);
                _InformModal = new Modal({
                    id: 'surveyInformModal',
                    state: 'show',
                    content: [
                        'Опрос успешно сохранен!'
                    ],
                    isStatic: false,
                    header: 'Сохранение опроса',
                    isFooter: true,
                    isFullScreen: false,
                    modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
                    zIndex: 1005,
                    confirmBtn: 'Ок',
                    cancelBtn: 'none',
                    onConfirm: function(){
                        _InformModal = '';
                    }
                })
            }
            m.redraw();
        }
    };

    function newQuestionsLoaded(data){
        var newQuestionsInSurvey = [];
        data.map(function(question, index){
            Model.questionsCodes().push(question['QUE_CODE']);
            Model.addQuestion(question);
            newQuestionsInSurvey.push(question['QUE_CODE']);
        });
        if(newQuestionsInSurvey.length > 0){
            _unsaved(true);
            Helper.getData(loadNewAnswers, {"context": this, "module": "Survey Constructor Step", "function": "newQuestionsLoaded"}, 'ANS_CODE, ANS_QUE_CODE, ANS_TEXT', 'VIEW_ST_ANSWER', "WHERE ANS_QUE_CODE IN (" + newQuestionsInSurvey.join(",") + ")");
        }else{
            state = 'loaded';
            m.redraw();
        }
    }

    function loadNewAnswers(answers){
        answers.map(function(answer, index){
            answer['SUD_ANS_IS_MANDATORY'] = false;
            answer['ANS_NEXT_QUE_CODE'] = false;
            Model.addAnswer(answer['ANS_QUE_CODE'], answer);
        })
        state = 'loaded';
        m.redraw();
    }

    function questionsLoaded(data){
        var questionsInSurvey = [];
        data.map(function(question, index){
            Model.questionsCodes().push(question['QUE_CODE']);
            Model.addQuestion(question);
            questionsInSurvey.push(question['QUE_CODE']);
        });
        if(questionsInSurvey.length > 0){
            Helper.getData(loadAnswers, {"context": this, "module": "Survey Constructor Step", "function": "controller"}, 'ANS_CODE, ANS_NEXT_QUE_CODE, ANS_QUE_CODE, ANS_TEXT, SUD_ANS_IS_MANDATORY', 'VIEW_ST_SURVEY_DETAILS_SAVE', "WHERE ANS_QUE_CODE IN (" + questionsInSurvey.join(",") + ") AND (SUD_SUR_CODE = " + survey.code + ")", "SUD_SHOW_ORDER");
        }else{
            state = 'loaded';
            m.redraw();
        }
    }

    function loadAnswers(answers){
        answers.map(function(answer, index){
            answer['SUD_ANS_IS_MANDATORY'] = !!parseInt(answer['SUD_ANS_IS_MANDATORY']); //convert to boolean
            Model.addAnswer(answer['ANS_QUE_CODE'], answer);
        })
        state = 'loaded';
        m.redraw();
    }

    function answerMandatoryChanged(){
        _unsaved(true);
        var answerCode = this.getAttribute('data-code');
        Model.changeMandatory(_questionSelected, answerCode, this.checked);
    }

    function selectRowForQuestionAnswers(){
        if(_questionSelected == this.getAttribute("data-key")){
            _questionSelected = false;
        }else{
            _questionSelected = this.getAttribute("data-key");
        }
        showQuestionAnswers();
    }

    function showQuestionAnswers(){
        var uniqQuestions = 0;
        _nextQuestions = {};
        _answersToShow([]);
        if(_questionSelected){
            _answersToShow(Model.questions()[_questionSelected].answers);
            _answersToShow().map(function(answer, index){
                if(!_nextQuestions.hasOwnProperty(answer['ANS_NEXT_QUE_CODE'])){
                    if(uniqQuestions > _colorSet.length){
                        uniqQuestions = 0;
                    }
                    _nextQuestions[answer['ANS_NEXT_QUE_CODE']] = {color: _colorSet[uniqQuestions]};
                    uniqQuestions++;
                }
            });
        }
        m.redraw();
    }

    function showQuestionSource(){
        var gridConfig = {
            moduleId: Globals.registerModule('grid'),
            mode: 'grid',
            allowNew: false,
            gridView: "VIEW_ST_QUESTION",
            perPage: 50,
            state: 'loading',
            staticFilters: {
                1:{
                    isHidden: true,
                    andOrCondition: "AND",
                    condition: "equal",
                    fieldName: 'QUE_SUR_CODE',
                    fieldTitle: "Опрос",
                    filterField: 'QUE_SUR_CODE',
                    id: "1",
                    isGroupCondition: true,
                    type: "INT",
                    value: survey.code
                }
            },
            showSelectColumn: true,
            contextActionsList: ['export'],
            isModal: false
        };

        if(Model.questionsCodes().length > 0){
            gridConfig.staticFilters['2'] = {
                isHidden: true,
                andOrCondition: "AND",
                condition: "notIn",
                fieldName: 'QUE_CODE',
                fieldTitle: "Вопросы",
                filterField: 'QUE_CODE',
                id: "1",
                isGroupCondition: true,
                type: "INT",
                value: Model.questionsCodes().join(',')
            }
        }
        var Grid = new GridModule(gridConfig);
        _QuestionSourceGrid = new Modal({
            id: 'surveyQuestionSource',
            state: 'show',
            content: [
                m.component(Grid)
            ],
            isStatic: false,
            header: t('questionSourceModalHeader', 'SM_SurveyConstructorModule'),
            isFooter: true,
            isFullScreen: true,
            modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
            zIndex: 1005,
            cancelBtn: t('questionSourceModalCancelBtn', 'SM_SurveyConstructorModule'),
            confirmBtn: t('questionSourceModalAddBtn', 'SM_SurveyConstructorModule'),
            onConfirm: function(){
                if(Grid.getSelectedRows().length > 0){
                    Helper.getData(newQuestionsLoaded, {"context": this, "module": "Survey Constructor Step", "function": "showQuestionSource"}, 'QUE_CODE, QUE_TEXT', 'VIEW_ST_QUESTION', "WHERE QUE_CODE IN ("+Grid.getSelectedRows().join(',')+")");
                }
                _QuestionSourceGrid = '';
            }
        })
    }

    //single and multiple select on shift key
    function selectQuestionRow(){
        var rowIndex = parseInt(this.getAttribute('data-index'));

        if(!_shiftPressed){
            _lastSelectedRow = rowIndex;
            if(this.checked){
                _selectedQuestionArray.push(rowIndex);
            }else{
                var index = _selectedQuestionArray.indexOf(rowIndex);
                if(index !== -1){
                    _selectedQuestionArray.splice(index, 1);
                }
            }
        }else{
            if(!_lastSelectedRow){
                _lastSelectedRow = 0;
            }
            var start = rowIndex;
            var end = _lastSelectedRow;
            if(rowIndex > _lastSelectedRow){
                start = _lastSelectedRow;
                end = rowIndex;
            }

            for (var i = start; i < end+1; i++) {
                //check all
                if(this.checked){
                    if(_selectedQuestionArray.indexOf(i) == -1){
                        _selectedQuestionArray.push(i);
                    }
                }else{
                    var index = _selectedQuestionArray.indexOf(i);
                    if(index !== -1){
                        _selectedQuestionArray.splice(index, 1);
                    }
                }
            }
        }
    }

    function removeQuestions(){
        _unsaved(true);
        _selectedQuestionArray.sort(function(a,b){return a - b;});
        for (var i = _selectedQuestionArray.length - 1; i >= 0; i--) {
            Model.removeQuestion(_selectedQuestionArray[i]);
        }
        _selectedQuestionArray = [];
        _questionSelected = false;
        showQuestionAnswers();
    }

    function showQuestionPicker(){
        var answerCode = this.getAttribute('data-code');
        var questionPicker = new NextQuestionPicker({
            questionCodes: Model.questionsCodes(),
            questions: Model.questions()
        });

        _NextQuestionPicker = new Modal({
            id: 'surveyQuestionSource',
            state: 'show',
            content: [
                m.component(questionPicker)
            ],
            isStatic: false,
            header: 'Выбор следующего вопроса',
            isFooter: true,
            isFullScreen: false,
            modalSizeParams: {width: '600px', height: '100%', padding: '3% 0 3% 0'},
            zIndex: 1005,
            confirmBtn: 'Выбрать',
            onConfirm: function(){
                var nextQuestionCode = questionPicker.getQuestion();
                var applyToAll = questionPicker.getType();
                if(nextQuestionCode){
                    Model.changeNextQuestion(_questionSelected,answerCode, nextQuestionCode, applyToAll);
                    showQuestionAnswers();
                }
                _unsaved(true);
                questionPicker = '';
                _NextQuestionPicker = '';
            }
        })
    }

    function questionTableConfig(el, isInit, context){
        $(el).sortable({
            helper: "clone",
            stop: function(event, ui){
                var rows = el.getElementsByTagName('tr');
                var questionCodes = [];
                for (var i = 0; i < rows.length; i++) {
                    questionCodes.push(parseInt(rows[i].getAttribute('data-code')));
                }
                Model.questionsCodes(questionCodes);
                _selectedQuestionArray = [];
                _redrawCountAfterDrag++;
                _unsaved(true);
                m.redraw();
            }
        }).disableSelection();
    }

    function answerTableConfig(el, isInit, context){
        $(el).sortable({
            helper: "clone",
            stop: function(event, ui){
                var rows = el.getElementsByTagName('tr');
                var answerAssocArray = {};
                var newAnswersArray = [];
                _answersToShow().map(function(answer, index){
                    answerAssocArray[answer['ANS_CODE']] = answer;
                });
                for (var i = 0; i < rows.length; i++) {
                    var answerCode = parseInt(rows[i].getAttribute('data-code'));
                    newAnswersArray.push(answerAssocArray[answerCode]);
                }
                Model.setAnswers(_questionSelected, newAnswersArray);
                showQuestionAnswers();
                _answerRedrawCountAfterDrag++;
                _unsaved(true);
                m.redraw();
            }
        }).disableSelection();
    }

    function saveSurvey(){
        _SavingModal = new Modal({
            id: 'savingSurveyModal',
            state: 'show',
            content: [
                m("img", {
                    class: "grid-loading-modal__body--loader",
                    src: "dist/assets/images/loading.gif"
                }),
                m.trust(t('loadingModalBodyMsg', 'GridModule')),
                m("p", {class: "grid-loading-modal__message"}, t('loadingModalBodyWarningMsg', 'GridModule'))
            ],
            isStatic: true,
            header: 'Сохранение опроса',
            isFooter: false,
            isFullScreen: false,
            modalSizeParams: {width: '400px', height: false, padding: '15% 0 0 0'},
            zIndex: 1100
        })
        Helper.execQuery(oldSurveyDeleted,  {"context": this, "module": "Survey constructor module", "function": "saveSurvey"}, "DELETE FROM ST_SURVEY_DETAILS WHERE SUD_SUR_CODE = " + survey.code);
    }

    function oldSurveyDeleted(){
        Model.saveSurvey();
    }

    function checkSurvey(){
        var cycles = [];
        var answersWithoutNextQuestion = [];

        var checkCount = 0;

        var checkedQuestion = [];

        function checkForCycles(question, previousQuestionArray){
            checkCount++;
            if(checkCount > 500){
                return;
            }
            var questionCode = question['QUE_CODE'];
            var uniqueNextQuestionArray = [];
            if(typeof previousQuestionArray === 'undefined'){
                previousQuestionArray = [];
                previousQuestionArray.push(questionCode);
            }
            Model.questions()[questionCode].answers.map(function(answer, index){
                //cancel check to answers with same NEXT_QUE_CODE
                if(uniqueNextQuestionArray.indexOf(answer['ANS_NEXT_QUE_CODE']) === -1){
                    uniqueNextQuestionArray.push(answer['ANS_NEXT_QUE_CODE']);

                    if(previousQuestionArray.indexOf(answer['ANS_NEXT_QUE_CODE']) !== -1){
                        cycles.push(t('cycleError', 'SM_SurveyConstructorModule', {start: (Model.questionsCodes().indexOf(questionCode)+1), end: (Model.questionsCodes().indexOf(answer['ANS_NEXT_QUE_CODE'])+1)}));
                    }else{
                        if(answer['ANS_NEXT_QUE_CODE'] && answer['ANS_NEXT_QUE_CODE'] !== null){
                            previousQuestionArray.push(answer['ANS_NEXT_QUE_CODE']);
                            //if question not checked
                            if(checkedQuestion.indexOf(answer['ANS_NEXT_QUE_CODE']) === -1){
                                checkedQuestion.push(answer['ANS_NEXT_QUE_CODE']);
                                checkForCycles(Model.questions()[answer['ANS_NEXT_QUE_CODE']], previousQuestionArray.slice());
                            }
                        }
                    }
                }
            })
        }
        checkForCycles(Model.questions()[Model.questionsCodes()[0]]);

        function checkAnswerForNextQuestion() {
            Model.questionsCodes().map(function(questionCode) {
                Model.questions()[questionCode].answers.map(function(answer, index) {
                    if(!answer['ANS_NEXT_QUE_CODE'] || answer['ANS_NEXT_QUE_CODE'] === null){
                        answersWithoutNextQuestion.push(t('emptyAnswerError', 'SM_SurveyConstructorModule',{answer: (index+1), question: (Model.questionsCodes().indexOf(questionCode)+1)}));
                    }
                })
            })
        }
        checkAnswerForNextQuestion();

        _CheckSurveyModal = new Modal({
            id: 'surveyQuestionSource',
            state: 'show',
            content: [
                cycles.map(function(message){
                    return m("p", message)
                }),
                answersWithoutNextQuestion.map(function(message){
                    return m("p", message)
                })
            ],
            isStatic: false,
            header: t('checkSurveyModalHeader', 'SM_SurveyConstructorModule'),
            isFooter: true,
            isFullScreen: false,
            modalSizeParams: {width: '60%', height: '80%', padding: '5% 0 5% 0'},
            zIndex: 1005,
            confirmBtn: t('okBtn', 'App'),
            cancelBtn: 'none',
            onConfirm: function(){
                _CheckSurveyModal = '';
            }
        })
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller(){
        Helper.getData(questionsLoaded, {"context": this, "module": "Survey Constructor Step", "function": "controller"}, 'QUE_CODE, QUE_TEXT, MAX(SUD_SHOW_ORDER) AS ORD', 'VIEW_ST_SURVEY_DETAILS', "WHERE SUD_SUR_CODE = " + survey.code + " GROUP BY QUE_CODE, QUE_TEXT", "MAX(SUD_SHOW_ORDER)");
    }

    function view(){
        switch(state){
            case 'loading':
                return m("div", {}, 'loading...');
                break;
            case 'loaded':
                var config = function(el){
                    el.onkeydown = function(e){
                        if(e.keyCode == 16){
                            _shiftPressed = true;
                        }
                    }
                    el.onkeyup = function(e){
                        if(e.keyCode == 16){
                            _shiftPressed = false;
                        }
                    }
                }
                return m("div", {class: "m-survey-constructor", config: config}, [
                    m("div", {class: "m-survey-constructor__question-container component-container"},
                        m("div", {class: "m-survey-constructor__question-tools"}, [
                            m("div", {class: "m-survey-constructor__question-label"}, [
                                m("strong", t('QuestionsHeader', 'SM_SurveyConstructorModule')),
                                t('QuestionsCountLabel', 'SM_SurveyConstructorModule', {count: Model.questionsCodes().length}),
                            ]),
                            m("div", {class: "m-survey-constructor__question-button-container"}, [
                                m("button", {class: "btn btn-system btn-system-primary", onclick: showQuestionSource}, t('questionSourceBtn', 'SM_SurveyConstructorModule')),
                                m("button", {class: "btn btn-system btn-system-primary", onclick: checkSurvey}, t('checkSurveyBtn', 'SM_SurveyConstructorModule')),
                                _selectedQuestionArray.length > 0 ?
                                    m("button", {class: "btn btn-system btn-danger", onclick: removeQuestions}, t('removeQuestionBtn', 'SM_SurveyConstructorModule', {count: _selectedQuestionArray.length})) :
                                    m("button", {class: "btn btn-system btn-success", disabled: !_unsaved(), onclick: saveSurvey}, t('saveBtn', 'SM_SurveyConstructorModule'))
                            ])
                        ]),
                        m("div", {class: "m-survey-constructor__question-table-container"}, [
                            m("table", {class: "table table-bordered table-striped survey-table survey-constructor-table"}, [
                                m("thead",
                                    m("tr", [
                                        m("th", {class: "survey-constructor-table__number-column"}, ''),
                                        m("th", {class: "survey-constructor-table__number-column"}, '#'),
                                        m("th", {class: "survey-constructor-table__number-column"}, t('questionsTableColumnName', 'SM_SurveyConstructorModule')),
                                        m("th", {class: "survey-constructor-table__number-column"}, t('questionsTableColumnCode', 'SM_SurveyConstructorModule')),
                                        m("th", {class: "survey-constructor-table__number-column"}, '')
                                    ])
                                ),
                                m("tbody", {config: questionTableConfig, key: _redrawCountAfterDrag}, [
                                    Model.questionsCodes().map(function(questionCode, index){
                                        var color = false;
                                        var question = Model.questions()[questionCode];
                                        if(_nextQuestions.hasOwnProperty(questionCode)){
                                            color = _nextQuestions[questionCode].color;
                                        }
                                        return m("tr", {class: (_questionSelected == question['QUE_CODE'] ? 'selected-row' : ''), 'data-code': question['QUE_CODE'], style: color ? 'font-weight: 700;' : ''} ,[
                                            m("td", {class: ""},
                                                m("input", {type: "checkbox", "data-index": index, "data-key": question['QUE_CODE'], checked: (_selectedQuestionArray.indexOf(index) != -1 ? "checked" : ""), onchange: selectQuestionRow})
                                            ),
                                            m("td", {class: "survey-table__clickable-column", "data-index": index, "data-key": question['QUE_CODE'], onclick: selectRowForQuestionAnswers}, index+1),
                                            m("td", {class: "survey-table__clickable-column", "data-index": index, "data-key": question['QUE_CODE'], onclick: selectRowForQuestionAnswers}, question['QUE_TEXT']),
                                            m("td", {class: "survey-table__clickable-column", "data-index": index, "data-key": question['QUE_CODE'], onclick: selectRowForQuestionAnswers}, question['QUE_CODE']),
                                            m("td", {class: "survey-table__clickable-column", "data-index": index, "data-key": question['QUE_CODE'], onclick: selectRowForQuestionAnswers, style: (color ? 'background: '+color+';' : '')}, '')
                                        ])
                                    })
                                ])
                            ])
                        ])
                    ),
                    m("div", {class: "m-survey-constructor__answer-container component-container"},
                        m("div", {class: "m-survey-constructor__answer-table-container"}, [
                            m("div", {class: "m-survey-constructor__answer-tools"}, [
                                m("div", {class: "m-survey-constructor__answer-label"}, [
                                    m("strong", t('AnswersHeader', 'SM_SurveyConstructorModule')),
                                    _answersToShow() ? t('AnswersCountLabel', 'SM_SurveyConstructorModule', {count: _answersToShow().length}) : '',
                                ]),
                            ]),
                            m("table", {class: "table table-bordered table-striped survey-table survey-constructor__answer-table"}, [
                                m("thead",
                                    m("tr", [
                                        m("th", {class: "survey-constructor-table__number-column"}, ''),
                                        m("th", {class: "survey-constructor-table__number-column"}, '#'),
                                        m("th", {class: "survey-constructor-table__number-column"}, t('answersTableColumnOptions', 'SM_SurveyConstructorModule')),
                                        m("th", {class: "survey-constructor-table__number-column"}, t('answersTableColumnNextQuestion', 'SM_SurveyConstructorModule')),
                                        m("th", {class: "survey-constructor-table__number-column"}, t('answersTableColumnRequiredAnswer', 'SM_SurveyConstructorModule'))
                                    ])
                                ),
                                m("tbody", {config: answerTableConfig, key: _answerRedrawCountAfterDrag}, [
                                    _answersToShow().map(function(answer, index){
                                        var color = answer['ANS_NEXT_QUE_CODE'] ? _nextQuestions[answer['ANS_NEXT_QUE_CODE']].color : 'none';
                                        return m("tr", {'data-code': answer['ANS_CODE'], style: !answer['ANS_NEXT_QUE_CODE'] ? 'color: #d9534f;' : ''}, [
                                            m("td", {style: 'background: '+color+';'}, ''),
                                            m("td", index+1),
                                            m("td", answer['ANS_TEXT']),
                                            m("td", {class: "survey-table__clickable-column", 'data-code': answer['ANS_CODE'],onclick: showQuestionPicker}, [
                                                answer['ANS_NEXT_QUE_CODE'] ? Model.questionsCodes().indexOf(answer['ANS_NEXT_QUE_CODE'])+1 : '',
                                                m("img", {src: "dist/assets/icons/edit.png", class: "survey-answer-table__edit-img"})
                                            ]),
                                            m("td",
                                                m("input", {type: "checkbox", 'data-code': answer['ANS_CODE'], checked: answer['SUD_ANS_IS_MANDATORY'], onchange: answerMandatoryChanged})
                                            )
                                        ])
                                    })
                                ])
                            ])
                        ])
                    ),
                    _SavingModal,
                    _QuestionSourceGrid,
                    _NextQuestionPicker,
                    _InformModal,
                    _CheckSurveyModal
                ])
                break;
        }
    }

    return {
        controller: controller,
        view: view
    }
}