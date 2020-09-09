"use strict";
exports.__esModule = true;
function getFileChunkHash(file, chunkSize) {
    var fileChunkList = [];
    var cur = 0;
    var index = 1;
    while (cur < file.size) {
        fileChunkList.push({
            file: file.slice(cur, cur + chunkSize),
            hash: file.name + "_" + index,
            fileName: file.name
        });
        index++;
        cur += chunkSize;
    }
    return fileChunkList;
}
exports["default"] = getFileChunkHash;
