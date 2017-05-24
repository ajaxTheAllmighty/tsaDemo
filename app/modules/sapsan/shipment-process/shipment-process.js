'use strict';
var m = require('mithril');
module.exports = function () {
    var state = 'default';
    var isFileLoaded = false;
    var errorMessage = '';
    var uploadFile = false;
    var isFileChoosen = false;

    function fileChanged(){
        isFileChoosen = false;
        uploadFile = false;
        if(this.files.length == 1){
            isFileChoosen = true;
            uploadFile = this.files[0];
            startUpload();
        }
    }

    function startUpload(){
        var formData = new FormData();
        formData.append("file", uploadFile);
        $.ajax({
            cache: false,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        document.getElementById('shipmentUploadProgress').style.width = percentComplete+"%";
                        document.getElementById('shipmentUploadProgress').innerHTML = percentComplete+"%";
                    }
                }, false);
                xhr.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        document.getElementById('shipmentUploadProgress').style.width = percentComplete+"%";
                        document.getElementById('shipmentUploadProgress').innerHTML = percentComplete+"%";
                    }
                }, false);
                return xhr;
            },
            url: "/FileImporter/fileUploaderShipment",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                var result = JSON.parse(res);
                if(result.status == 'OK'){
                    isFileLoaded = true;
                }else{
                    isFileLoaded = false;
                    errorMessage = result.status;
                }
                state = "loaded";
                m.redraw();
            }
        });
        state = "loading";
        m.redraw();
    }

    ///////////////////////////////////////////////////
    //      MODULE CONTROLLER AND VIEW METHODS       //
    ///////////////////////////////////////////////////

    function controller() {

    }

    function view() {
        switch(state){
            case 'default':
                return m("div", {class: "b-shipment-module component-container"},
                    m("form", {class: "b-shipment__upload-form"},
                        m("div", {class: "b-shipment__file-input-wrapper"}, [
                            m("span", {class: "b-shipment__file-input-label"}, t('fileInputLabel', 'ShipmentProcessModule')),
                            m("input", {class: "b-shipment__file-input", type: "file", accept: ".xls,.xlsx", onchange: fileChanged}, "")
                        ])
                    )
                )
            break;
            case 'loading':
                return m("div", {class: "b-shipment-module component-container"},
                    m("div", {class: "b-shipment-module__progress-wrapper"},
                        m("div", {class: "b-shipment-module__progress-container"}, [
                            t('loadingHeader', 'ShipmentProcessModule'),
                            m("div", {class: "progress b-shipment-module__progress-bar"},
                                m("div", {class: "progress-bar progress-bar-info progress-bar-striped", id: "shipmentUploadProgress", role: "progressbar", "aria-valuenow": "0", "aria-valuemin": "0", "aria-valuemax": "100", style: "width: 0%"}, "")
                            )
                        ])
                    )
                )
            break;
            case 'loaded':
                if(isFileLoaded){
                    return m("div", {class: "b-shipment-module component-container"},
                        m("div", {class: "b-shipment__status-message_success"}, t('loadedFileSuccessUploadedMsg', 'ShipmentProcessModule'))
                    )
                }else{
                    return m("div", {class: "b-shipment-module component-container"},
                        m("div", {class: "b-shipment__status-message_error"}, [
                            t('loadedFileErrorUploadedMsg', 'ShipmentProcessModule'),
                            m("p", errorMessage)
                        ])
                    )
                }
                break;
            default:
                return m("div", {class: "b-shipment-module component-container"},
                    m("form", {class: "b-shipment__upload-form"},
                        m("div", {class: "b-shipment__file-input-wrapper"}, [
                            m("span", {class: "b-shipment__file-input-label"}, t('fileInputLabel', 'ShipmentProcessModule')),
                            m("input", {class: "b-shipment__file-input", type: "file", accept: ".xls,.xlsx", onchange: fileChanged}, "")
                        ])
                    )
                )
            break;
        }
    }

    return{
        controller: controller,
        view: view
    }
};