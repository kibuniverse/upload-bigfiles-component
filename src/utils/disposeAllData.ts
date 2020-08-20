

import { UtilClassInterface } from '../interfaces/utilsClassInterface'
import { IwaitCalculateFiles, IwaitUploadFiles, IuploadingFile } from '../interfaces/interfaces'
import calculateFileHash from './calculateFileHash'
export default class DisposeAllData implements UtilClassInterface {

    waitCalculateFiles = [] as Array<IwaitCalculateFiles>
    waitUploadFiles = [] as Array<IwaitUploadFiles>
    uploadingFiles = [] as Array<IuploadingFile>
    isCalculating: boolean
    constructor() {
        this.isCalculating = false
    }
    /**
     * 
     * @param newFiles 新添加的文件数组
     */
    public addNewFiles(newFiles: FileList) {
        for (let i = 0, len = newFiles.length; i < len; i++) {
            this.waitCalculateFiles.push({
                id: `${newFiles[i].name}_${new Date().getTime()}`,
                file: newFiles[i],
                isCalculate: false
            })
        }
        if (!this.isCalculating) {
            this.calculateFilesMessage()
        }
    }
    /**
     * calculateFilesMessage 获取文件切片以及hash
     */
    private async calculateFilesMessage() {
        this.isCalculating = true
        console.log(this)
        while(this.waitCalculateFiles.length) {
            let file = this.waitCalculateFiles.pop()
            calculateFileHash(file)
        }
        this.isCalculating = false
    }

}