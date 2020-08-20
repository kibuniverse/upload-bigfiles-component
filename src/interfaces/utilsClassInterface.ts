

import { IwaitCalculateFiles, IwaitUploadFiles, IuploadingFile } from './interfaces'
// 工具类接口
export interface UtilClassInterface {
    // 待计算文件数组
    waitCalculateFiles: Array<IwaitCalculateFiles> | []
    // 待上传文件数组
    waitUploadFiles: Array<IwaitUploadFiles> | []
    // 正在上传文件数组
    uploadingFiles: Array<IuploadingFile> | []

    // 添加待计算文件
    addNewFiles: (newFiles: FileList) => void

    // 
}