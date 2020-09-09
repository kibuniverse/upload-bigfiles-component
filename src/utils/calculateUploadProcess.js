"use strict";
exports.__esModule = true;
function calculateUploadProcess(uploadedSize, waitUploadFile) {
    var loaded = uploadedSize;
    waitUploadFile.uploadPercentArr.forEach(function (item) {
        loaded += item;
    });
    return loaded / waitUploadFile.file.size;
}
exports["default"] = calculateUploadProcess;
