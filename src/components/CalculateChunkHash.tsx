import * as React from 'react'
import { IwaitCalculateFiles } from '../interfaces/files'
export interface Iprops {
    updateWait: (addFiles: FileList | []) => void
    waitCalculateFiles: Array<IwaitCalculateFiles> | []
}

export interface IupdateWaitFileUploadFiles {
    waitCalculateFiles: Array<File> | []
}

class CalculateChunkHash extends React.Component<Iprops> {

    constructor(props: Iprops) {
        super(props)
    }

    render() {
        return (
            <div>
                <div style={{
                    width: '400px',
                    margin: 'auto',
                    borderRadius: '10px',
                    textAlign: 'center',
                    color: 'blue',
                    padding: '10px',
                    border: '1px solid #5099ed',
                    backgroundColor: '#b8d7fb',
                }}>正在计算以下文件哈希，请稍等</div>
                <div>
                    {this.props.waitCalculateFiles.length}
                </div>

            </div >
        )
    }
}

export default CalculateChunkHash