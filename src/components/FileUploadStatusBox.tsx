import React from 'react'
import { IwaitUploadFile } from '../interfaces/interfaces'

interface Iprops {
    waitUploadFile: IwaitUploadFile
}

function FileUploadBox(props: Iprops) {
    return (
        <div>
            {props.waitUploadFile.file.name}
        </div>
    )
}   

export default FileUploadBox