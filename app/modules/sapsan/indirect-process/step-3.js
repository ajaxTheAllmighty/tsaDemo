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

    function addListeners(){
        /*//add listeners to buttons
        $('#startProcess', $('#systemButtonsContainer')).unbind();
		$('#startProcess').unbind();
        $('#systemButtonsContainer').on('click', '#startProcess', function () {
            console.log('start process');
            //$('#startProcess').prop('disabled', true);
            $('#stopProcess').removeClass('hidden');
            startUpload();
        })

        $('#systemButtonsContainer').on('click', '#stopProcess', function () {
            console.log('stop process');
            stopUpload();
        })*/
    }

    function stopUpload (){
        var time = new Date().getTime();
        $('#stopProcess').hide();
        $.ajax({
            type: "GET",
            url: "/FileImporter/fileUploaderIndirect",
            data: {time: time,operation:"stop"},
            success: function (response)
            {
                try {
					
                    var responseData = JSON.parse(response);
                    if(responseData.operation == 'stop'&& responseData.status == 'ok'){
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
        $.ajax({
            type: "GET",
            url: "/FileImporter/fileUploaderIndirect",
            data: {time: time,operation:"register"},
            success: function (res){},
            error: function (request, error) {
                console.log(error);
            }
        });
        startProgressbar(time);
    }

    function startProgressbar (startTime){
        // start timer
        console.log('start progess bar');
        $('#logContainer').empty();
        $('#startProcess').hide();
        $('#stopProcess').show();
        var progressTimer = setInterval(function () {
            $.ajax({
                type: "GET",
                url: "/FileImporter/fileUploaderIndirect",
                data: {time: startTime,operation:"log_request"},
                error: function (request, error) {
                    addLogMessage({text: "Error: " + error, type: 'ERROR'}),
                    clearInterval(progressTimer);
                },
                success: function (data, textStatus,jqXHR ){
                    console.log(data);
					try{
                        var responseData = JSON.parse(data);
                        var currentdate = new Date();
                        var time = currentdate.getHours() + ":"+ currentdate.getMinutes() + ":"+ currentdate.getSeconds();

                        console.log(time, responseData);
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
                                //$('#fileRegion'+responseData["fileLog"][i]['filePos']).html(responseData["fileLog"][i]['fileRegion']);
                                //$('#fileSum'+responseData["fileLog"][i]['filePos']).html(responseData["fileLog"][i]['fileSum']);
                                //$('#fileFd'+responseData["fileLog"][i]['filePos']).html(responseData["fileLog"][i]['fileFd']);
                                //$('#fileLd'+responseData["fileLog"][i]['filePos']).html(responseData["fileLog"][i]['fileLd']);
                                //$('#fileProg'+responseData["fileLog"][i]['filePos']).html(responseData["fileLog"][i]['fileProg']);
                                //$('#fileStatus'+responseData["fileLog"][i]['filePos']).html(responseData["fileLog"][i]['fileStatus']);
                            }else{
                                $('#processFileListTable tbody').append('<tr id="fileRow-'+pos+'" class="process-file-list-table__file-row">'+
                                '<td id="columnFile'+pos+'">'+responseData["fileLog"][i]['fileName']+'</td>'+
                                '<td id="columnRegion'+pos+'">'+responseData["fileLog"][i]['fileRegion']+'</td>'+
                                '<td id="columnCount'+pos+'" class="center-column">'+responseData["fileLog"][i]['fileProdCount']+'</td>'+
                                '<td id="columnFileFD'+pos+'">'+responseData["fileLog"][i]['fileFd']+'</td>'+
                                '<td id="columnFileLD'+pos+'">'+responseData["fileLog"][i]['fileLd']+'</td>'+
                                '<td id="columnFileProg'+pos+'">'+responseData["fileLog"][i]['fileProg']+'</td>'+
                                '<td id="columnFileStatus'+pos+'" class="center-column">'+responseData["fileLog"][i]['fileStatus']+'</td></tr>');
                                //$('#file-list').append('<li class="list-group-item" id = "filePosId'+responseData["fileLog"][i]['filePos']+'">'+responseData["fileLog"][i]['fileName']+"</li>");
                                //$('#file-region').append('<li class="list-group-item" id = "fileRegion'+responseData["fileLog"][i]['filePos']+'">'+responseData["fileLog"][i]['fileRegion']+"</li>");
                                //$('#file-sum').append('<li class="list-group-item" id = "fileSum'+responseData["fileLog"][i]['filePos']+'">'+responseData["fileLog"][i]['fileSum']+"</li>");
                                //$('#file-fd').append('<li class="list-group-item" id = "fileFd'+responseData["fileLog"][i]['filePos']+'">'+responseData["fileLog"][i]['fileFd']+"</li>");
                                //$('#file-ld').append('<li class="list-group-item" id = "fileLd'+responseData["fileLog"][i]['filePos']+'">'+responseData["fileLog"][i]['fileLd']+"</li>");
                                //$('#file-progress').append('<li class="list-group-item" id = "fileProg'+responseData["fileLog"][i]['filePos']+'">'+responseData["fileLog"][i]['fileProg']+"</li>");
                                //$('#file-status').append('<li class="list-group-item" id = "fileStatus'+responseData["fileLog"][i]['filePos']+'">'+responseData["fileLog"][i]['fileStatus']+"</li>");
                            }

                        }

                        for (var j=0; j < responseData["progress"][startTime]["log"].length; j++){
                            addLogMessage(responseData["progress"][startTime]["log"][j]);
                        }

                        if ((responseData["progress"][startTime]["status"]) == "FILE_UPLOAD"){
                            //$('#progress-status').html('Загрузка данных из файла.');
                        }

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
        var startBtn = $('<button type="button" id="startProcess" class="btn btn-sm btn-primary system-button_blue">'+t('step3StartProcess', 'FileProcess')+'</button>');
		startBtn.appendTo($('#systemButtonsContainer'));
		startBtn.on('click', function () {
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

