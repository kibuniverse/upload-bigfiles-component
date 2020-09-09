"use strict";
exports.__esModule = true;
function getUploadingFileById(id, arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i].id === id) {
            return i;
        }
    }
    return -1;
}
exports["default"] = getUploadingFileById;
