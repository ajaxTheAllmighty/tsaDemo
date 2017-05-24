'use strict';
var m = require('mithril');
module.exports = function(){
    var validFilesCount = 0;
    var filesUploaded = 0;
    var fileInput = $('#loadFileInput')[0];
    var finishUploadCallback;
    var isExistErrorFiles = false;

    function formatBytes(bytes, decimals) {
        if (bytes === 0) {
            return '0 Byte';
        }
        var k = 1000;
        var dm = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function addListeners(){
        $('#loadFileInput').unbind();
        $('#loadFileInput').on('change', function() {
            if(fileInput.files.length > 0){
                showFileList();
            }else{
                showFileInput();
            }
        });
        //confirm button
        $('#secondStepModal').unbind();
        $('#secondStepModal').on('click', '#secondStepModalConfirmBtn', function () {
            $('#secondStepModal').modal('hide');
            clearFolderAndUpload();
        });
        //upload button
        $('#systemButtonsContainer').unbind();
        $('#systemButtonsContainer').on('click', '#uploadFilesToServer', function () {
            tryUpload();
        });
        //cancel button
        $('#systemButtonsContainer').on('click', '#cancelUpload', function () {
            m.route('/обработка_файлов');
        });
    }

    function showFileList(){
        $('#uploadFilesToServer').prop('disabled', false);
        $('#uploadFormContainer').hide();
        $('#fileListContainer').show();
        $('#fileListTable tbody').empty();

        var allowedExtensions = ['xls', 'xlsx'];
        for (var i = 0 ; i < fileInput.files.length; i++ ) {
            var isValid = true;
            var file = fileInput.files[i];
            var fileId = 'file-'+i;

            //check file extension
            if(allowedExtensions.indexOf(file.name.split('.').pop()) == -1){
                isValid = false;
            }
            file.isValid = isValid;
            if(isValid){
                validFilesCount++;
            }else{
                isExistErrorFiles = true;
            }
            $('#fileListTable tbody').append('<tr>' +
                    '<td class="file-list-table__column_number">'+(i+1)+'</td>' +
                    '<td class="file-list-table__column_file '+(!isValid?'status-danger':'')+'">'+file.name+'</td>' +
                    '<td class="file-list-table__column_file-size">'+formatBytes(file.size, 1)+'</td>' +
                    '<td class="file-list-table__column_status"><div class="file-status '+(!isValid?'status-danger':'status-warning')+'" id="'+fileId+'">'+(!isValid?'не будет загружен':'ожидает загрузки')+'</div><div class="file-upload-progress progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;" id="loading-status-'+fileId+'">0%</div></div></td>' +
                '</tr>');
        }
        $('.file-upload-progress').hide();
    }

    function showFileInput(){
        $('#uploadFilesToServer').prop('disabled', true);
        $('#uploadFormContainer').show();
        $('#fileListContainer').hide();
    }

    function tryUpload(){
        if(isExistErrorFiles){
            $('#secondStepModal').modal('show');
        }else{
            clearFolderAndUpload();
        }
    }

    function clearFolderAndUpload(){
        $.ajax({
            cache: false,
            type: "GET",
            url: "/FileImporter/fileUploader",
            data: {operation:"clear"},
            success: function (response){
                try {
                    var responseData = JSON.parse(response);
                    if(responseData.status == 'ok'){
                        uploadFiles();
                    }else{
                        console.log('probably locked files');
                        alert(responseData.status);
                    }
                }catch(e){
                    console.log(e);
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    }

    function loadFile(id, file, formData){
        var fileId = 'file-'+id;
        $.ajax({
            cache: false,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        $('#loading-status-'+fileId, $('#fileListTable')).width(percentComplete+'%').html(percentComplete+'%');
                        if(percentComplete == 100){
                            $('#loading-status-'+fileId, $('#fileListTable')).parent().hide();
                        }
                    }
                }, false);

                xhr.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        $('#loading-status-'+fileId, $('#fileListTable')).width(percentComplete+'%').html(percentComplete+'%');
                        if(percentComplete == 100){
                            $('#loading-status-'+fileId, $('#fileListTable')).parent().hide();
                        }
                    }
                }, false);

                return xhr;
            },
            url: "/FileImporter/fileUploader?file_name="+file.name+"&file_id="+fileId,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                var response = JSON.parse(res);
                if(response.status == "true"){
                    $('#'+response.id).removeClass('status-warning').addClass('status-success').html(t('step2LoadedStatus', 'FileProcess'));
                    $('#loading-status-'+response.id).removeClass('active');
                }else{
                    $('#'+response.id).removeClass('status-warning').addClass('status-danger').html(t('step2ErrorLoadStatus', 'FileProcess'));
                }

                filesUploaded++;
                if(validFilesCount == filesUploaded){
                    finishUploadCallback();
                    uploadComplete();
                }
            }
        });
    }

    function uploadFiles(){
        $('#uploadFilesToServer').prop('disabled', true);
        $('file-upload-progress').show();
        $('.file-upload-progress').show();
        for (var i = 0 ; i < fileInput.files.length; i++ ) {
            var file = fileInput.files[i];
            var fileId = 'file-'+i;
            var formData = new FormData();
            formData.append("images", file);
            formData.append("file_name", file.name);
            formData.append("file_id", fileId);
            $('#'+fileId).html(t('step2LoadingStatus', 'FileProcess'));
            loadFile(i,file, formData);
        }
    }

    function uploadComplete(){
        //show modal
        $('#infoModalHeader').html(t('step2UploadingResults', 'FileProcess'));
        $('#infoModalBody').html('<p>'+t('step2TotalUploaded', 'FileProcess')+filesUploaded+'</p>');
        $('#infoModal').modal('show');
    }

    function init($o){
        validFilesCount = 0;
        filesUploaded = 0;
        //add cancel and upload buttons
        $('#systemButtonsContainer').empty();
        $('#systemButtonsContainer').append('<button type="button" class="btn btn-sm btn-primary system-button_blue" id="cancelUpload">'+t('cancelBtn', 'App')+'</button>');
        $('#systemButtonsContainer').append('<button type="button" class="btn btn-sm btn-primary system-button_blue" id="uploadFilesToServer" disabled>'+t('step2UploadBtn', 'FileProcess')+'</button>');
        fileInput = $('#loadFileInput')[0];
        addListeners();
        $('#uploadFormContainer').show();
        $('#fileListContainer').hide();
        finishUploadCallback = $o.finishUploadCallback;
    }

    return{
        init: init
    }
};

