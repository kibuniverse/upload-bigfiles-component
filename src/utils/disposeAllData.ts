

import { UtilClassInterface } from '../interfaces/utilsClassInterface'
import { IwaitCalculateFiles, IwaitUploadFiles, IuploadingFile, chunkListsFile } from '../interfaces/interfaces'
import getFileChunkList from './getFileChunkHash'
import { calculatehash } from './createHash'
import getFileChunkHash from './getFileChunkHash'
export interface Iprops {
    chunkSize?: number
}

export default class DisposeAllData implements UtilClassInterface {

    waitCalculateFiles = [] as Array<IwaitCalculateFiles>
    waitUploadFiles = [] as Array<IwaitUploadFiles>
    uploadingFiles = [] as Array<IuploadingFile>
    isCalculating: boolean
    chunkSize: number
    constructor(props: Iprops) {
        this.isCalculating = false
        // 切片大小默认4M
        this.chunkSize = props.chunkSize ? props.chunkSize : 4 * 1024 * 1024
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
        while (this.waitCalculateFiles.length > 0) {
            let file: any = this.waitCalculateFiles.shift()?.file
            let waituploadFile: IwaitUploadFiles = {
                file: file,
                chunkList: getFileChunkList(file, this.chunkSize)
            }
            let hash:any = await calculatehash(waituploadFile.chunkList)
            waituploadFile.chunkList.forEach((item:chunkListsFile, index: number) => {
                item.hash = `${hash}_${index}`
            })
            console.log(`完成文件${<File>file.name}hash计算`)
            this.addCalculatedFile(waituploadFile)
        }
        this.isCalculating = false
    }

    private addCalculatedFile(newWaitUploadFile: IwaitUploadFiles) {
        this.waitUploadFiles.push(newWaitUploadFile)
        console.log(this.waitUploadFiles)
    }

}