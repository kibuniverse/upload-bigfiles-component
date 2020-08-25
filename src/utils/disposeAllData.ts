import { UtilClassInterface } from '../interfaces/utilsClassInterface'
import { IwaitCalculateFile, IwaitUploadFile, IuploadingFile, chunkListsFile } from '../interfaces/interfaces'
import getFileChunkList from './getFileChunkHash'
import { calculatehash } from './createHash'

export interface Iprops {
    chunkSize?: number
    updateWaitCalculateFile: (files: Array<IwaitCalculateFile>) => void
    updateWaitUploadFile: (files: Array<IwaitUploadFile>) => void
}

export default class DisposeAllData implements UtilClassInterface {
    waitCalculateFiles = [] as Array<IwaitCalculateFile>
    waitUploadFiles = [] as Array<IwaitUploadFile>
    uploadingFiles = [] as Array<IuploadingFile>
    updateWaitCalculateFile: (files: Array<IwaitCalculateFile>) => void
    updateWaitUploadFile: (files: Array<IwaitUploadFile>) => void
    isCalculating: boolean
    chunkSize: number
    chunksConcurUploadNum: number
    constructor(props: Iprops) {
        this.isCalculating = false
        // 切片大小默认4M
        this.chunkSize = props.chunkSize ? props.chunkSize : 4 * 1024 * 1024
        this.updateWaitCalculateFile = props.updateWaitCalculateFile
        this.updateWaitUploadFile = props.updateWaitUploadFile
        this.chunksConcurUploadNum = parseInt(String(10 / this.waitUploadFiles.length))
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
        this.updateWaitCalculateFile(this.waitCalculateFiles)
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
                id: `${<File>file.name}_${new Date().getTime()}`,
                file: file,
                chunkList: getFileChunkList(file, this.chunkSize),
                uploadProcess: 50
            }
            let hash: any = await calculatehash(waituploadFile.chunkList)
            waituploadFile.chunkList.forEach((item: chunkListsFile, index: number) => {
                item.hash = `${hash}_${index}`
            })
            waituploadFile.hash = hash
            console.log(`完成文件${file.name}hash计算`)
            this.addCalculatedFile(waituploadFile)
            this.updateWaitCalculateFile(this.waitCalculateFiles)
            this.updateChunksConcurUploadNum()
            this.uploadFile(this.waitUploadFiles.length - 1)
        }
        this.isCalculating = false
        this.updateChunksConcurUploadNum()
        this.UploadMultipleFiles()
    }

    private updateChunksConcurUploadNum () {
        this.chunksConcurUploadNum = parseInt(String(10 / this.waitUploadFiles.length))
    }

    private addCalculatedFile(newWaitUploadFile: IwaitUploadFile) {
        this.waitUploadFiles.push(newWaitUploadFile)
        this.updateWaitUploadFile(this.waitUploadFiles)
    }


    public uploadFile(index: number) {

    }

    public UploadMultipleFiles() {
        console.log(this.chunksConcurUploadNum)
    }

}