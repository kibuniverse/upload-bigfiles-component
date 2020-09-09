"use strict";
exports.__esModule = true;
var ipUrl = 'http://49.234.79.241:8001/';
var servicePath = {
    sendChunkRequest: ipUrl + 'file_upload',
    mergeRequest: ipUrl + 'mergeReq',
    verify: ipUrl + 'verify'
};
exports["default"] = servicePath;
