import * as React from 'react'
import { files, IwaitUploadFiles } from '../interfaces/files'
import CalculateFileHash from './calculateFileHash'
class Upload extends React.Component {

    readonly state: files = {
        filesList: [],
        waitUploadFiles: []
    }

    public handleFilechange = (e: any) => {
        console.log(e.target.files)
        this.setState({
            filesList: e.target.files
        }, () => {
            console.log(this.state.filesList)
            CalculateFileHash({
                fileList: this.state.filesList,
                updateWaitFileUploadFiles: this.updateWaitFileUploadFiles,
                chunkSize: 4*1024*1024
            })
        })
    }
    public updateWaitFileUploadFiles = (waitUploadFile: IwaitUploadFiles) => {
        let temp = this.state.waitUploadFiles.slice()
        temp.push(waitUploadFile)
        this.setState({
            waitUploadFiles: temp
        }, () => {
            console.log(this.state.waitUploadFiles)
        })
    }
    public UploadBox = () => (
        <div style={{
            width: '400px',
            height: '200px',
            border: '2px solid gray',
            borderStyle: 'dashed',
            borderRadius: '2%',
            position: 'relative',
            marginBottom: '10px',
            backgroundColor: '#f9f9f9'
        }}>
            <input style={{
                width: '400px',
                height: '200px',
                opacity: '0'
            }} type='file' onChange={this.handleFilechange} multiple />
            <img style={{
                position: 'absolute',
                width: '251px',
                height: '100px',
                top: '35px',
                left: '71px',
            }} src="http://49.234.79.241:8001/66f3aeb62843866ac5f4f957e99b57c4.png" alt="" />
            <div style={{
                position: 'absolute',
                top: '149px',
                left: '109px',
                color: 'gray'
            }}>点击上传或者拖拽上传</div>
        </div>
    )
    render() {
        return (
            <>
                <this.UploadBox />
            </>
        )
    }
}

export default Upload