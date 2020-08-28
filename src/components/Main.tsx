import * as React from 'react'
import { IfilesStatus, IwaitUploadFile, IwaitCalculateFile, IuploadedFile } from '../interfaces/interfaces'
import UploadClass from '../utils/disposeAllData'
import WaitCalculateFiles from './WaitCalculate'
import AddFileBox from './AddFileBox'
import WaitUploadFiles from './WaitUploadFiles'
import UploadedFiles from './UploadedFiles'
export default class Upload extends React.Component {

    readonly state: IfilesStatus = {
        waitUploadFiles: [],
        waitCalculateFiles: [],
        uploadingFiles: [],
        uploadedFiles: []
    }
    // 上传工具类
    public uploadClass = new UploadClass({
        chunkSize: 4 * 1024 * 1024,
        updateWaitCalculateFile: this.updateWaitCalculateFile.bind(this),
        updateWaitUploadFile: this.updateWaitUploadFile.bind(this),
        updateUploadedFiles: this.updateUploadedFiles.bind(this)
    })

    /**
     * 
     * @param files 待计算文件数组
     * @function 更新待上传计算文件数组
     */
    public updateWaitCalculateFile(files: Array<IwaitCalculateFile>): void {
        this.setState({
            waitCalculateFiles: files
        })
    }
    /**
     * 
     * @param files 上传文件数组
     * @function 更新待上传文件数组
     */
    public updateWaitUploadFile(files: Array<IwaitUploadFile>): void {
        this.setState({
            waitUploadFiles: files
        })
    }
    /**
     * 
     * @param e 文件修改后传入的参数
     */
    public handleFilechange = (e: any): void => {
        this.uploadClass.addNewFiles(e.target.files)
    }

    public updateUploadedFiles(files: Array<IuploadedFile>): void {
        this.setState({
            uploadedFiles: files
        })
    }

    render() {
        return (
            <>
                <AddFileBox
                    handleFilechange={this.handleFilechange}
                />
                <WaitCalculateFiles
                    files={this.state.waitCalculateFiles}
                />
                <WaitUploadFiles 
                    waitUploadFiles={this.state.waitUploadFiles}
                />
                <UploadedFiles 
                    uploadedFiles={this.state.uploadedFiles}
                />
            </>
        )
    }
}
