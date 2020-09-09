"use strict";
exports.__esModule = true;
function requset(paramsObj) {
    var url = paramsObj.url;
    var data = paramsObj.data || null;
    var method = paramsObj.method || 'post';
    var headers = paramsObj.headers || {};
    return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        Object.keys(headers).forEach(function (key) {
            xhr.setRequestHeader(key, headers[key]);
        });
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status <= 300) || xhr.status === 304) {
                    resolve({
                        data: xhr.responseText
                    });
                }
            }
        };
        xhr.send(data);
    });
}
exports["default"] = requset;
