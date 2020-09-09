"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Apiurl_1 = require("./Apiurl");
/**
 * @param file 待上传文件
 * @param concurrency 并发上传最大数
 * @param callback 回调函数，上报修改上传进度
 * @function 上传文件
 */
function UploadFile(file, concurrency, updatePercent) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (reslove, reject) {
                    var chunkList = file.chunkList;
                    var len = chunkList.length;
                    var counter = 0;
                    var isStop = false;
                    var start = function () { return __awaiter(_this, void 0, void 0, function () {
                        var item, formdata, xhr_1, index_1;
                        return __generator(this, function (_a) {
                            if (isStop) {
                                return [2 /*return*/];
                            }
                            item = chunkList.shift();
                            if (item) {
                                formdata = new FormData();
                                formdata.append('fileData', item.file);
                                formdata.append('fileName', item.fileName);
                                formdata.append('hash', item.hash);
                                xhr_1 = new XMLHttpRequest();
                                index_1 = item.index;
                                xhr_1.onerror = function error(e) {
                                    isStop = true;
                                    reject(e);
                                };
                                // 分片上传完后的回调
                                xhr_1.onload = function () {
                                    if (xhr_1.status < 200 || xhr_1.status >= 300) {
                                        isStop = true;
                                        reject('服务端返回状态码错误');
                                    }
                                    // 最后一个切片已经上传完成
                                    if (counter === len - 1) {
                                        reslove();
                                    }
                                    else {
                                        counter++;
                                        // 递归调用
                                        start();
                                    }
                                };
                                // 上报分片上传进度
                                if (xhr_1.upload) {
                                    xhr_1.upload.onprogress = function (e) {
                                        if (e.total > 0) {
                                            e.percent = e.loaded / e.total * 100;
                                        }
                                        updatePercent(file.id, e, index_1);
                                    };
                                }
                                xhr_1.open('post', Apiurl_1["default"].sendChunkRequest, true);
                                xhr_1.send(formdata);
                            }
                            return [2 /*return*/];
                        });
                    }); };
                    while (concurrency > 0) {
                        setTimeout(function () {
                            start();
                        }, Math.random() * 100);
                        concurrency--;
                    }
                })];
        });
    });
}
exports["default"] = UploadFile;
