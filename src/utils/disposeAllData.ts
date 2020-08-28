import { UtilClassInterface } from '../interfaces/utilsClassInterface'
import { IwaitCalculateFile, IwaitUploadFile, IuploadingFile, chunkListsFile, IuploadedFile } from '../interfaces/interfaces'
import getFileChunkList from './getFileChunkHash'
import { calculatehash } from './createHash'
import uploadFile from './uploadFile'
import request from './request'
import servicePath from './Apiurl'
import getExtendName from './getExtendName'
import getUploadingFileIndexById from './getUploadingFileIndexById'
import calculateUploadProcess from './calculateUploadProcess'

export interface Iprops {
    chunkSize?: number
    updateWaitCalculateFile: (files: Array<IwaitCalculateFile>) => void
    updateWaitUploadFile: (files: Array<IwaitUploadFile>) => void
    updateUploadedFiles: (files: Array<IuploadedFile>) => void
}

export default class DisposeAllData implements UtilClassInterface {
    waitCalculateFiles = [] as Array<IwaitCalculateFile>
    waitUploadFiles = [] as Array<IwaitUploadFile>
    uploadingFiles = [] as Array<IuploadingFile>
    uploadedFiles = [] as Array<IuploadedFile>
    updateWaitCalculateFile: (files: Array<IwaitCalculateFile>) => void
    updateWaitUploadFile: (files: Array<IwaitUploadFile>) => void
    updateUploadedFiles: (files: Array<IuploadedFile>) => void
    isCalculating: boolean
    chunkSize: number
    chunksConcurrenceUploadNum: number

    constructor(props: Iprops) {
        this.isCalculating = false
        // 切片大小默认4M
        this.chunkSize = props.chunkSize ? props.chunkSize : 4 * 1024 * 1024
        this.updateWaitCalculateFile = props.updateWaitCalculateFile
        this.updateWaitUploadFile = props.updateWaitUploadFile
        this.updateUploadedFiles = props.updateUploadedFiles
        this.chunksConcurrenceUploadNum = parseInt(String(10 / this.waitUploadFiles.length))
    }

    /**
     * @function 对外暴露的添加文件方法
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
     * @function 获取文件切片以及hash
     */
    private async calculateFilesMessage() {
        while (this.waitCalculateFiles.length > 0) {
            let file: any = this.waitCalculateFiles[0].file
            let waituploadFile: IwaitUploadFile = {
                id: `${file.name as File}_${new Date().getTime()}`,
                file: file,
                chunkList: getFileChunkList(file, this.chunkSize),
                uploadProcess: 50,
                uploadPercentArr: []
            }
            let hash: any = await calculatehash(waituploadFile.chunkList)
            this.waitCalculateFiles.shift()
            waituploadFile.chunkList.forEach((item: chunkListsFile, index: number) => {
                item.hash = `${hash}_${index}`
                item.index = index
            })

            // 初始化上传进度数组
            waituploadFile.uploadPercentArr = new Array(waituploadFile.chunkList.length).fill(0)
            waituploadFile.hash = hash
            console.log(`完成文件${file.name}hash计算`)
            // 更新计算完成文件数组
            console.log(`开始上传${file.name}文件`)
            this.addCalculatedFile(waituploadFile)
            // 上报新的待计算文件数组
            this.updateWaitCalculateFile(this.waitCalculateFiles)
        }
    }

    /**
     * 
     * @function 添加已上传文件并上报
     * @param fileName 上传成功的文件名
     * @param url 返回的url
     * 
     */
    private addUploadedFiles(fileName: string, url: string): void {
        this.uploadedFiles.push({
            fileName: fileName,
            url: url
        })
        this.updateUploadedFiles(this.uploadedFiles)
    }

    /**
     * @function 增加计算完成文件并上报 开启上传
     * @param newWaitUploadFile 计算hash完成的文件
     */
    private async addCalculatedFile(newWaitUploadFile: IwaitUploadFile): Promise<any> {
        this.waitUploadFiles.push(newWaitUploadFile)
        this.updateWaitUploadFile(this.waitUploadFiles)
        uploadFile(newWaitUploadFile, 3, this.updateUploadFilePercent.bind(this)).then(async res => {
            let uploadedMessage: any = await this.mergeRequest(newWaitUploadFile)
            let index: number = getUploadingFileIndexById(newWaitUploadFile.id as string, this.waitUploadFiles)
            this.waitUploadFiles.splice(index, index + 1)
            this.updateWaitUploadFile(this.waitUploadFiles)
            let url: string = JSON.parse(uploadedMessage.data).url
            this.addUploadedFiles(newWaitUploadFile.file.name, url)
        })
    }

    /**
     * 
     * @param id 待更改的文件id
     * @param e onprogress返回值
     * @param index 切片的下标
     * @function 更新上传进度
     */
    private updateUploadFilePercent(id: string, e: any, index: number): void {
        console.log(id, e.loaded, index)

        let fileIndex: number = getUploadingFileIndexById(id, this.waitUploadFiles)
        console.log(this.waitUploadFiles[fileIndex])
        if (fileIndex === -1) { return }
        this.waitUploadFiles[fileIndex].uploadPercentArr[index] = e.loaded
        console.log(this.waitUploadFiles[fileIndex])
        this.waitUploadFiles[fileIndex].uploadProcess = calculateUploadProcess(this.waitUploadFiles[fileIndex])
        this.updateWaitUploadFile(this.waitUploadFiles)
    }

    /**
     * 
     * @param uploadFile 计算完成的文件
     * @function 发送文件合并请求
     */
    private mergeRequest(uploadFile: IwaitUploadFile) {
        return request({
            method: 'post',
            url: servicePath.mergeRequest,
            index: 0,
            headers: {
                "content-type": "application/json"
            },
            data: JSON.stringify({
                filename: uploadFile.file.name,
                newname: `${uploadFile.hash}.${getExtendName(uploadFile.file.name)}`,
                size: uploadFile.file.size,
                chunkSize: this.chunkSize
            })
        })
    }
}