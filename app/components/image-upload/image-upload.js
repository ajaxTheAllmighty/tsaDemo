'use strict';
var m = require('mithril');
module.exports = function () {
    var state;
    var isFileChoosen = false;
    var uploadFile;
    var folder;
    var id;
    var imgUrl;
    var imgName = 'default';
    var allowsExtensions;
    var isEditable;
    var afterUpload;

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
        formData.append('file', uploadFile);
        $.ajax({
            url: Config.frontServices.uploadPhoto+"?operation=photo_upload&folder_name="+folder+"&file_name="+uploadFile.name,
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            //xhr: function() {
                //var xhr = new window.XMLHttpRequest();
                //xhr.upload.addEventListener("progress", function(evt) {
                //    if (evt.lengthComputable) {
                //        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                //        document.getElementById(id).style.width = percentComplete+"%";
                //        document.getElementById(id).innerHTML = percentComplete+"%";
                //    }
                //}, false);
                //xhr.addEventListener("progress", function(evt) {
                //    if (evt.lengthComputable) {
                //        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                //        document.getElementById(id).style.width = percentComplete+"%";
                //        document.getElementById(id).innerHTML = percentComplete+"%";
                //    }
                //}, false);
                //return xhr;
            //},
            success: function (result) {
                isFileChoosen = false;
                state = "default";
                imgUrl = Config.serverAddress + Config.rootFolder+'/photo/'+folder+'/'+uploadFile.name;
                imgName = uploadFile.name;
                afterUpload(uploadFile.name);
                m.redraw();
            },
            error: function (error) {
                console.log(error);
            }
        });


        state = "loading";
    }

    function controller(config){
        allowsExtensions = config.allowsExtensions || 'image/*';
        state = config.state || 'default';
        folder = config.folder || 'ST_SALEPOINT';
        isEditable = config.isEditable;
        id = config.id || false;
        afterUpload = config.afterUpload || function(){console.log(uploadFile.name)};
        imgUrl = config.imgUrl;
        imgName = config.imgName;
    }

    function view(){
        switch(state){
            case 'default':
                if(!imgUrl || imgUrl === null || imgUrl == ''){
                    imgUrl = false;
                }
                return m("div", {class: "image-upload-component"},
                    m("div", {class: "image-upload-component__image-container"},
                        (imgUrl ? m("a", {href: imgUrl, "target": "_blank"},
                            m("img", {src: imgUrl, class: "image-upload-component__image"})
                        ) :
                            m("img", {src: "dist/assets/images/no_image-512.png", class: "image-upload-component__image"})
                        )
                    ),
                    (isEditable ?
                        m("div", {class: "image-upload-component__btn-container"}, [
                            (imgUrl ? m("a", {href: imgUrl, class: "file-uploader__download-btn btn btn-system btn-system-primary", download: imgName}, t('downloadImgBtn', 'ImageUploadComponent')) : ""),
                            m("div", {class: (imgUrl ? "file-uploader__choose-btn" : "file-uploader__choose-btn_full")+" btn btn-system btn-system-primary"},[
                                t('uploadImgBtn', 'ImageUploadComponent'),
                                m("input", {type: "file", accept: allowsExtensions, onchange: fileChanged}, [])
                            ])
                        ]) : ""
                    ),
                    m("div", {class: "clearfix"}, "")
                );
                break;
            case 'loading':
                if(!imgUrl || imgUrl === null || imgUrl == ''){
                    imgUrl = false;
                }
                return m("div", {class: "image-upload-component"},
                    m("div", {class: "image-upload-component__image-container"},
                        (imgUrl ? m("a", {href: imgUrl, "target": "_blank"},
                            m("img", {src: imgUrl, class: "image-upload-component__image"})
                        ) :
                            m("img", {src: "app/modules/card/images/no_image-512.png", class: "image-upload-component__image"})
                        )
                    ),
                    m("div", {class: "image-upload-component__btn-container"}, [
                        m("div", {class: "progress image-upload-component__progress-bar"},
                            m("div", {class: "progress-bar progress-bar-info progress-bar-striped", id: id, role: "progressbar", "aria-valuenow": "0", "aria-valuemin": "0", "aria-valuemax": "100", style: "width: 0%"}, "")
                        )
                    ]),
                    m("div", {class: "clearfix"}, "")
                );
                break;
            default:
                return m("div", {class: "image-upload-component"},
                    m("img", {src: imgUrl, class: "image-upload-component__image"}),
                    m("div", {class: "image-upload-component__btn-container"}, [
                        m("div", {class: "file-uploader__choose-btn btn btn-system btn-default"},[
                            t('chooseFileBtn', 'ImageUploadComponent'),
                            m("input", {type: "file", accept: allowsExtensions, onchange: fileChanged}, [])
                        ]),
                        m("button", {class: "btn btn-system btn-system-primary", disabled: !isFileChoosen, onclick: startUpload}, t('downloadImgBtn', 'ImageUploadComponent'))
                    ])
                );
                break;
        }
    }

    return {
        controller: controller,
        view: view
    }
};