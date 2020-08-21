

import { IwaitCalculateFile, IwaitUploadFile, IuploadingFile } from './interfaces'
// 工具类接口
export interface UtilClassInterface {
    // 待计算文件数组
    waitCalculateFiles: Array<IwaitCalculateFile> | []
    // 待上传文件数组
    waitUploadFiles: Array<IwaitUploadFile> | []
    // 正在上传文件数组
    uploadingFiles: Array<IuploadingFile> | []

    // 添加待计算文件
    addNewFiles: (newFiles: FileList) => void

    // 
}