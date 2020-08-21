import { UtilClassInterface } from '../interfaces/utilsClassInterface'
import { IwaitCalculateFile, IwaitUploadFile, IuploadingFile, chunkListsFile } from '../interfaces/interfaces'
import getFileChunkList from './getFileChunkHash'
import { calculatehash } from './createHash'

export interface Iprops {
    chunkSize?: number
    addNewWaitCalculateFile: (files: Array<IwaitCalculateFile>) => void
    addNewWaitUploadFile: (file: IwaitUploadFile) => void
}

export default class DisposeAllData implements UtilClassInterface {
    waitCalculateFiles = [] as Array<IwaitCalculateFile>
    waitUploadFiles = [] as Array<IwaitUploadFile>
    uploadingFiles = [] as Array<IuploadingFile>
    addNewWaitCalculateFile: (files: Array<IwaitCalculateFile>) => void
    addNewWaitUploadFile: (file: IwaitUploadFile) => void
    isCalculating: boolean
    chunkSize: number
    constructor(props: Iprops) {
        this.isCalculating = false
        // 切片大小默认4M
        this.chunkSize = props.chunkSize ? props.chunkSize : 4 * 1024 * 1024
        this.addNewWaitCalculateFile = props.addNewWaitCalculateFile
        this.addNewWaitUploadFile = props.addNewWaitUploadFile
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
        this.addNewWaitCalculateFile(this.waitCalculateFiles)
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
            let waituploadFile: IwaitUploadFile = {
                file: file,
                chunkList: getFileChunkList(file, this.chunkSize)
            }
            let hash: any = await calculatehash(waituploadFile.chunkList)
            waituploadFile.chunkList.forEach((item: chunkListsFile, index: number) => {
                item.hash = `${hash}_${index}`
            })
            console.log(`完成文件${<File>file.name}hash计算`)
            this.addCalculatedFile(waituploadFile)
        }
        this.isCalculating = false
    }

    private addCalculatedFile(newWaitUploadFile: IwaitUploadFile) {
        this.waitUploadFiles.push(newWaitUploadFile)
    }

}