'use strict';
var m = require('mithril');
module.exports = function(){
    function addLogMessage(obj){
        if(obj.text == 'NEW_FILE'){
            $('#logContainer').append('<div class="log-divider"></div>');
        }else{
            switch(obj.type){
                case 'ERROR':
                    $('#logContainer').append('<p class="status-danger">'+obj.text+'</p>');
                    break;
                case 'STATUS':
                    $('#logContainer').append('<p>'+obj.text+'</p>');
                    break;
                case 'SUCCESS':
                    $('#logContainer').append('<p class="status-success">'+obj.text+'</p>');
                    break;
                default:
                    $('#logContainer').append('<p>'+obj.text+'</p>');
                    break;
            }
        }
        $('#logContainer').scrollTop($('#logContainer')[0].scrollHeight);
    }

    function stopUpload (){
        var time = new Date().getTime();
        $('#stopProcess').hide();
        $.ajax({
            cache: false,
            type: "GET",
            url: "/FileImporter/fileUploader",
            data: {time: time, operation : "stop"},
            success: function (response)
            {
                try {
                    var responseData = JSON.parse(response);
                    if(responseData.operation == 'stop' && responseData.status == 'ok'){
						console.log('process stopped');
                        $('#startProcess').show();
                    }
                }catch(e){
                    console.log(e);
                }
            }
        });
    }

    function startUpload (){
        var time = new Date().getTime();
        console.log('!-- START PROCESS --!');
        console.log('!-- time: '+time+'  --!');
        $.ajax({
            cache: false,
            type: "GET",
            url: "/FileImporter/fileUploader",
            data: {time: time,operation:"register"},
            success: function (res){
                console.log('!-- GOT ANSWER FROM SERVICE --!');
            },
            error: function (request, error) {
                console.log(error);
            }
        });
        startProgressbar(time);
    }

    function startProgressbar (startTime){
        // start timer
        console.log('start progress bar');
        $('#logContainer').empty();
        $('#startProcess').hide();
        $('#stopProcess').show();
        var progressTimer = setInterval(function () {
            $.ajax({
                cache: false,
                type: "GET",
                url: "/FileImporter/fileUploader",
                data: {time: startTime,operation:"log_request"},
                error: function (request, error) {
                    addLogMessage({text: "Error: " + error, type: 'ERROR'}),
                    clearInterval(progressTimer);
                },
                success: function (data, textStatus,jqXHR ){
					try{
                        var responseData = JSON.parse(data);
                        var currentdate = new Date();
                        //var time = currentdate.getHours() + ":"+ currentdate.getMinutes() + ":"+ currentdate.getSeconds();

                        for (var i = 0; i <  responseData["fileLog"].length; i++)
                        {
                            var pos = responseData["fileLog"][i]['filePos'];
                            if ($('#fileRow-'+pos).length > 0){

                                if(responseData["fileLog"][i]['fileStatus'] == "ERROR"){
                                    $('#fileRow-'+pos).addClass('status-danger');
                                }

                                if(responseData["fileLog"][i]['fileStatus'] == "Ошибка в файле"){
                                    $('#fileRow-'+pos).addClass('status-danger');
                                }

                                if(responseData["fileLog"][i]['fileStatus'] == "OK"){
                                    $('#fileRow-'+pos).addClass('status-success');
                                }

                                var fileStatus = responseData["fileLog"][i]['fileStatus'];
                                if(fileStatus == 'Анализ'){
                                    fileStatus+= '<img src="dist/assets/images/loading.gif" style="height: 20px; margin-left: 10px;">';
                                }

                                $('#columnFile'+pos).html(responseData["fileLog"][i]['fileName']);
                                $('#columnRegion'+pos).html(responseData["fileLog"][i]['fileRegion']);
                                $('#columnCount'+pos).html(responseData["fileLog"][i]['fileProdCount']);
                                $('#columnFileFD'+pos).html(responseData["fileLog"][i]['fileFd']);
                                $('#columnFileLD'+pos).html(responseData["fileLog"][i]['fileLd']);
                                $('#columnFileProg'+pos).html(responseData["fileLog"][i]['fileProg']);
                                $('#columnFileStatus'+pos).html(fileStatus);

                            }else{
                                $('#processFileListTable tbody').append('<tr id="fileRow-'+pos+'" class="process-file-list-table__file-row">'+
                                '<td id="columnFile'+pos+'">'+responseData["fileLog"][i]['fileName']+'</td>'+
                                '<td id="columnRegion'+pos+'">'+responseData["fileLog"][i]['fileRegion']+'</td>'+
                                '<td id="columnCount'+pos+'" class="center-column">'+responseData["fileLog"][i]['fileProdCount']+'</td>'+
                                '<td id="columnFileFD'+pos+'">'+responseData["fileLog"][i]['fileFd']+'</td>'+
                                '<td id="columnFileLD'+pos+'">'+responseData["fileLog"][i]['fileLd']+'</td>'+
                                '<td id="columnFileProg'+pos+'">'+responseData["fileLog"][i]['fileProg']+'</td>'+
                                '<td id="columnFileStatus'+pos+'" class="center-column">'+responseData["fileLog"][i]['fileStatus']+'</td></tr>');
                            }

                        }
                        for (var j=0; j < responseData["progress"][startTime]["log"].length; j++){
                            addLogMessage(responseData["progress"][startTime]["log"][j]);
                        }

                        //if ((responseData["progress"][startTime]["status"]) == "FILE_UPLOAD"){
                            //$('#progress-status').html('Загрузка данных из файла.');
                        //}

                        if ((responseData["progress"][startTime]["status"]) == "PROCESSEND" ){
                            //$('#progress-status').html('Данные успешно загружены.');
                            clearInterval(progressTimer);
                            showProcessResults();
                        }
                        if ((responseData["progress"][startTime]["status"]) == "PROCESSERROR"){
                            //$('#progress-status').html('Ошибка загрузки, проверьте последний файл из списка.');
                            clearInterval(progressTimer);
                            showProcessResults();
                        }

                        if ((responseData["progress"][startTime]["status"]) == "PROCESSSTOPED"){
                            //$('#progress-status').html('Ошибка загрузки, загрузка прервана');
                            clearInterval(progressTimer);
                            //show modal
                            $('#infoModalHeader').html(t('step3ProcessInterruptedMsg', 'FileProcess'));
                            $('#infoModalBody').html('<p>'+t('step3ModalToContinueMsg', 'FileProcess')+'</p>');
                            $('#infoModal').modal('show');
                        }
                    }catch(e){
                        console.log(e);
                        clearInterval(progressTimer);
                    }
                }
            })
        }, 1000);
    }

    function showProcessResults(){
        //remove system buttons
        $('#systemButtonsContainer').empty();

        //show modal
        $('#infoModalHeader').html(t('step3ModalHeader', 'FileProcess'));
        $('#infoModalBody').html('<p>'+t('step3ProcessedFiles', 'FileProcess')+$('tr.process-file-list-table__file-row.status-success').length+'</p><p>'+t('step3UnprocessedFiles', 'FileProcess')+$('tr.process-file-list-table__file-row.status-danger').length+'</p>');
        $('#infoModal').modal('show');
    }

    function init(){
        //add cancel and upload buttons
        $('#systemButtonsContainer').empty();
        //var startBtn = $('<button type="buttton" id="startProcess" class="btn btn-sm btn-primary system-button_blue">'+t('step3StartProcess', 'FileProcess')+'</button>');
        var startBtn = $('<button id="startProcess" class="btn btn-sm btn-primary system-button_blue">'+t('step3StartProcess', 'FileProcess')+'</button>');
		startBtn.appendTo($('#systemButtonsContainer'));
		startBtn.on('click', function (e) {
            e.preventDefault();
            console.log('start process');
            $('#stopProcess').removeClass('hidden');
            startUpload();
        });
		
        var stopBtn = $('<button type="button" id="stopProcess" class="btn btn-sm btn-primary system-button_blue hidden">'+t('step3StopProcess', 'FileProcess')+'</button>');
		stopBtn.appendTo($('#systemButtonsContainer'));
		stopBtn.on('click', function () {
			console.log('stop process');
            stopUpload();
        });
    }

    return{
        init: init
    }
};

