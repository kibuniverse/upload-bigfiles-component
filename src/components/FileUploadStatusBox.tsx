import React from 'react'
import { IwaitUploadFile } from '../interfaces/interfaces'
import UploadProcess from './UploadProcessBar'

interface Iprops {
    waitUploadFile: IwaitUploadFile
}

function FileUploadBox(props: Iprops) {
    return (
        <>
            <div style={{
                float: 'left',
                fontSize: '15px',
                color: '#719dec'
            }}>
                {props.waitUploadFile.file.name}
            </div>
            <div style={{ content: '', display: 'block', clear: 'both'}}></div>
            <div style={{
                marginBottom: '5px'
            }}>
                <UploadProcess 
                    uploadProcess={props.waitUploadFile.uploadProcess as number}
                />
            </div>
        </>
    )
}

export default FileUploadBox