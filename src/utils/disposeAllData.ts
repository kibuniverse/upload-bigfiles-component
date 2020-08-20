

import { UtilClassInterface } from '../interfaces/utilsClassInterface'
import { IwaitCalculateFiles, IwaitUploadFiles, IuploadingFile } from '../interfaces/interfaces'
export default class DisposeAllData implements UtilClassInterface {

    waitCalculateFiles = [] as Array<IwaitCalculateFiles>
    waitUploadFiles = [] as Array<IwaitUploadFiles>
    uploadingFiles = [] as Array<IuploadingFile>
    isCalculating: boolean
    constructor () {
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
        if(!this.isCalculating) {
            this.calculateFilesMessage()
        }
    }
    /**
     * calculateFilesMessage
     */
    private calculateFilesMessage() {
        this.isCalculating = true
        for(let i = 0; i < this.waitCalculateFiles.length; i ++) {
            
        }
        this.isCalculating = false
    }

}