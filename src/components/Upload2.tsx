import * as React from 'react'
import { files, IwaitUploadFiles } from '../interfaces/interfaces'
import ShowUploadProcess from './ShowUploadProcess'
import UploadClass from '../utils/disposeAllData'
export default class Upload extends React.Component {

    readonly state: files = {
        waitUploadFiles: [],
        addFiles: [],
        waitCalculateFiles: [],
        uploadingFiles: [],
        uploadedFiles: []
    }
    public uploadClass = new UploadClass({})
    public handleFilechange = (e: any): void => {
        console.log(e.target.files)
        this.uploadClass.addNewFiles(e.target.files)
    }
    /**
     * updateWaitCalculateFiles  更新带上传文件数组
     */

    /**
     * updateFileList 修改已添加文件数组
     */
    public updateWaitUploadFiles = (waitUploadFile: IwaitUploadFiles): void => {
        let temp = this.state.waitUploadFiles.slice()
    }

    public completeCalculateChunkHashFiles = (id: string): void => {

    }

    public UploadBox = () => (
        <div style={{
            width: '400px',
            border: '2px solid gray',
            borderStyle: 'dashed',
            borderRadius: '2%',
            position: 'relative',
            backgroundColor: '#f9f9f9',
            margin: '100px auto 20px auto',
            backgroundImage: 'url("http://49.234.79.241:8001/ddad1a4c0164ed53590ffeb51d0a1a72.png")',
            backgroundSize: 'cover'
        }}>
            <input style={{
                width: '400px',
                height: '200px',
                opacity: '0'
            }} type='file' onChange={this.handleFilechange} multiple />
        </div>
    )
    render() {
        return (
            <>
                <this.UploadBox />
                <ShowUploadProcess
                    fileList={this.state.waitUploadFiles}
                />
            </>
        )
    }
}
