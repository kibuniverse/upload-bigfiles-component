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
var getFileChunkHash_1 = require("./utils/getFileChunkHash");
var createHash_1 = require("./utils/createHash");
var uploadFile_1 = require("./utils/uploadFile");
var request_1 = require("./utils/request");
var Apiurl_1 = require("./utils/Apiurl");
var getExtendName_1 = require("./utils/getExtendName");
var getUploadingFileIndexById_1 = require("./utils/getUploadingFileIndexById");
var calculateUploadProcess_1 = require("./utils/calculateUploadProcess");
var DisposeAllData = /** @class */ (function () {
    function DisposeAllData(props) {
        this.waitCalculateFiles = [];
        this.waitUploadFiles = [];
        this.uploadedFiles = [];
        this.isCalculating = false;
        // 切片大小默认4M
        this.chunkSize = props.chunkSize ? props.chunkSize : 4 * 1024 * 1024;
        this.concurrency = props.concurrency ? props.concurrency : 3;
        this.updateWaitCalculateFile = props.updateWaitCalculateFile;
        this.updateWaitUploadFile = props.updateWaitUploadFile;
        this.updateUploadedFiles = props.updateUploadedFiles;
        this.chunksConcurrenceUploadNum = parseInt(String(10 / this.waitUploadFiles.length));
    }
    /**
     * @function 对外暴露的添加文件方法
     * @param newFiles 新添加的文件数组
     */
    DisposeAllData.prototype.addNewFiles = function (newFiles) {
        for (var i = 0, len = newFiles.length; i < len; i++) {
            this.waitCalculateFiles.push({
                id: newFiles[i].name + "_" + new Date().getTime(),
                file: newFiles[i]
            });
        }
        this.updateWaitCalculateFile(this.waitCalculateFiles);
        this.calculateFilesMessage();
    };
    /**
     * @function 计算获取文件切片以及hash
     */
    DisposeAllData.prototype.calculateFilesMessage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_1 = function () {
                            var file, waituploadFile, hash;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        file = this_1.waitCalculateFiles[0].file;
                                        waituploadFile = {
                                            id: file.name + "_" + new Date().getTime(),
                                            file: file,
                                            chunkList: getFileChunkHash_1["default"](file, this_1.chunkSize),
                                            uploadProcess: 0,
                                            uploadPercentArr: [],
                                            uploadedSize: 0
                                        };
                                        return [4 /*yield*/, createHash_1.calculatehash(waituploadFile.chunkList)
                                            // hash计算完成，更新待计算文件数组
                                        ];
                                    case 1:
                                        hash = _a.sent();
                                        // hash计算完成，更新待计算文件数组
                                        this_1.waitCalculateFiles.shift();
                                        waituploadFile.chunkList.forEach(function (item, index) {
                                            item.hash = hash + "_" + index;
                                            item.index = index;
                                            item.fileName = hash;
                                        });
                                        // 初始化上传进度数组
                                        waituploadFile.uploadPercentArr = new Array(waituploadFile.chunkList.length).fill(0);
                                        waituploadFile.hash = hash;
                                        // 更新计算完成文件数组
                                        this_1.addCalculatedFile(waituploadFile);
                                        // 上报新的待计算文件数组
                                        this_1.updateWaitCalculateFile(this_1.waitCalculateFiles);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 1;
                    case 1:
                        if (!(this.waitCalculateFiles.length > 0)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @function 添加已上传文件并上报
     * @param fileName 上传成功的文件名
     * @param url 返回的url
     *
     */
    DisposeAllData.prototype.addUploadedFiles = function (fileName, url) {
        this.uploadedFiles.push({
            fileName: fileName,
            url: url
        });
        this.updateUploadedFiles(this.uploadedFiles);
    };
    /**
     * @function 增加计算完成文件并上报 调用上传方法
     * @param newWaitUploadFile 计算hash完成的文件
     */
    DisposeAllData.prototype.addCalculatedFile = function (newWaitUploadFile) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.waitUploadFiles.push(newWaitUploadFile);
                this.updateWaitUploadFile(this.waitUploadFiles);
                // 上传文件
                this.upload(newWaitUploadFile);
                return [2 /*return*/];
            });
        });
    };
    /**
     * @function 执行验证以及上传逻辑
     * @param waitUploadFile 待上传文件
     */
    DisposeAllData.prototype.upload = function (waitUploadFile) {
        return __awaiter(this, void 0, void 0, function () {
            var verifyData, loaded, index;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.verifyRequest(waitUploadFile.file.name, waitUploadFile.hash)];
                    case 1:
                        verifyData = _a.sent();
                        verifyData = JSON.parse(verifyData.data);
                        // 文件已经上传完成
                        if (verifyData.status === 1) {
                            this.completeFileUpload(waitUploadFile.id, waitUploadFile.file.name, verifyData.url);
                            return [2 /*return*/];
                        }
                        // 处理断点续传逻辑
                        if (verifyData.AlreadyUploadList) {
                            loaded = this.calculeateAlreadyUploadSize(verifyData.AlreadyUploadList, waitUploadFile);
                            index = getUploadingFileIndexById_1["default"](waitUploadFile.id, this.waitUploadFiles);
                            if (index === -1) {
                                return [2 /*return*/];
                            }
                            this.waitUploadFiles[index].uploadedSize = loaded;
                            // 过滤已上传切片
                            this.waitUploadFiles[index].chunkList = this.waitUploadFiles[index].chunkList.filter(function (item) { return (verifyData.AlreadyUploadList.indexOf(item.hash) === -1); });
                        }
                        uploadFile_1["default"](waitUploadFile, this.concurrency, this.updateUploadFilePercent.bind(this)).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                            var uploadedMessage;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.mergeRequest(waitUploadFile)];
                                    case 1:
                                        uploadedMessage = _a.sent();
                                        uploadedMessage = JSON.parse(uploadedMessage.data);
                                        this.completeFileUpload(waitUploadFile.id, waitUploadFile.file.name, uploadedMessage.url);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @function 计算已上传的size
     * @param AlreadyUploadList 服务端返回的已上传hash列表
     * @param waitUploadFile 待上传文件
     */
    DisposeAllData.prototype.calculeateAlreadyUploadSize = function (AlreadyUploadList, waitUploadFile) {
        var loaded = 0;
        for (var i = 0, len = AlreadyUploadList.length; i < len; i++) {
            var index = AlreadyUploadList[i].slice(-1);
            loaded += waitUploadFile.chunkList[index].file.size;
        }
        return loaded;
    };
    /**
     * @function 处理上传完成后的逻辑，上报更新UI
     * @param id 文件的id
     * @param fileName 文件名
     * @param url 得到的url
     */
    DisposeAllData.prototype.completeFileUpload = function (id, fileName, url) {
        var index = getUploadingFileIndexById_1["default"](id, this.waitUploadFiles);
        this.waitUploadFiles.splice(index, index + 1);
        this.updateWaitUploadFile(this.waitUploadFiles);
        this.addUploadedFiles(fileName, url);
    };
    DisposeAllData.prototype.verifyRequest = function (fileName, filehash) {
        return request_1["default"]({
            method: 'post',
            url: Apiurl_1["default"].verify,
            headers: {
                'content-type': 'application/json'
            },
            data: JSON.stringify({
                fileName: fileName,
                fileHash: filehash
            })
        });
    };
    /**
     *
     * @param id 待更改的文件id
     * @param e onprogress返回值
     * @param index 切片的下标
     * @function 更新上传进度
     */
    DisposeAllData.prototype.updateUploadFilePercent = function (id, e, index) {
        var fileIndex = getUploadingFileIndexById_1["default"](id, this.waitUploadFiles);
        if (fileIndex === -1) {
            return;
        }
        this.waitUploadFiles[fileIndex].uploadPercentArr[index] = e.loaded;
        this.waitUploadFiles[fileIndex].uploadProcess = calculateUploadProcess_1["default"](this.waitUploadFiles[fileIndex].uploadedSize, this.waitUploadFiles[fileIndex]);
        this.updateWaitUploadFile(this.waitUploadFiles);
    };
    /**
     *
     * @param uploadFile 计算完成的文件
     * @function 发送文件合并请求
     */
    DisposeAllData.prototype.mergeRequest = function (uploadFile) {
        return request_1["default"]({
            method: 'post',
            url: Apiurl_1["default"].mergeRequest,
            headers: {
                "content-type": "application/json"
            },
            data: JSON.stringify({
                fileName: uploadFile.hash,
                newname: uploadFile.hash + "." + getExtendName_1["default"](uploadFile.file.name),
                size: uploadFile.file.size,
                chunkSize: this.chunkSize
            })
        });
    };
    return DisposeAllData;
}());
exports["default"] = DisposeAllData;
