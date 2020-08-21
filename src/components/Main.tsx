import * as React from 'react'
import { IfilesStatus, IwaitUploadFile, IwaitCalculateFile } from '../interfaces/interfaces'
import UploadClass from '../utils/disposeAllData'
import WaitCalculateFiles from './WaitCalculate'
import AddFileBox from './AddFileBox'
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
        addNewWaitCalculateFile: this.addNewWaitCalculateFile.bind(this),
        addNewWaitUploadFile: this.addNewWaitUploadFile.bind(this)
    })

    public addNewWaitCalculateFile(files: Array<IwaitCalculateFile>): void {
        let temp: Array<IwaitCalculateFile> = this.state.waitCalculateFiles
        for (let i = 0, len = files.length; i < len; i++) {
            temp.push(files[i])
        }
        this.setState({
            waitCalculateFiles: temp
        }, () => {
            console.log(this.state.waitCalculateFiles)
        })
    }
    public addNewWaitUploadFile(file: IwaitUploadFile): void {

    }
    public handleFilechange = (e: any): void => {
        this.uploadClass.addNewFiles(e.target.files)
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
            </>
        )
    }
}
