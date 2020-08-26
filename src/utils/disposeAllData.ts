import { UtilClassInterface } from '../interfaces/utilsClassInterface'
import { IwaitCalculateFile, IwaitUploadFile, IuploadingFile, chunkListsFile } from '../interfaces/interfaces'
import getFileChunkList from './getFileChunkHash'
import { calculatehash } from './createHash'
import uploadFile from './uploadFile'
import request from './request'
import { send } from 'process'
import { wait } from '@testing-library/react'


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
    chunksConcurrenceUploadNum: number
    constructor(props: Iprops) {
        this.isCalculating = false
        // 切片大小默认4M
        this.chunkSize = props.chunkSize ? props.chunkSize : 4 * 1024 * 1024
        this.updateWaitCalculateFile = props.updateWaitCalculateFile
        this.updateWaitUploadFile = props.updateWaitUploadFile
        this.chunksConcurrenceUploadNum = parseInt(String(10 / this.waitUploadFiles.length))
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
        this.calculateFilesMessage()
    }
    /**
     * calculateFilesMessage 获取文件切片以及hash
     */
    private async calculateFilesMessage() {
        while (this.waitCalculateFiles.length > 0) {
            let file: any = this.waitCalculateFiles.shift()?.file
            let waituploadFile: IwaitUploadFile = {
                id: `${file.name as File}_${new Date().getTime()}`,
                file: file,
                chunkList: getFileChunkList(file, this.chunkSize),
                uploadProcess: 50
            }
            let hash: any = await calculatehash(waituploadFile.chunkList)
            waituploadFile.chunkList.forEach((item: chunkListsFile, index: number) => {
                item.hash = `${hash}_${index}`
                item.index = index
            })
            waituploadFile.hash = hash
            console.log(`完成文件${file.name}hash计算`)
            // 更新计算完成文件数组
            this.addCalculatedFile(waituploadFile)
            // 上报新的待计算文件数组
            this.updateWaitCalculateFile(this.waitCalculateFiles)
            this.updateChunksConcurrenceUploadNum()
            this.uploadFile(this.waitUploadFiles.length - 1)
        }
        this.updateChunksConcurrenceUploadNum()
    }

    private updateChunksConcurrenceUploadNum() {
        this.chunksConcurrenceUploadNum = parseInt(String(10 / this.waitUploadFiles.length))
    }

    private async addCalculatedFile(newWaitUploadFile: IwaitUploadFile) {
        this.waitUploadFiles.push(newWaitUploadFile)
        this.updateWaitUploadFile(this.waitUploadFiles)
        let p = await uploadFile(newWaitUploadFile, 3, (e: any): void => { })
        await this.mergeRequest()
    }

    private mergeRequest() {

    }
    public uploadFile(index: number) {

    }

    public UploadMultipleFiles() {
        console.log(this.chunksConcurrenceUploadNum)
    }

}