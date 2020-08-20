import * as React from 'react'

import { IwaitUploadFiles } from '../interfaces/interfaces'

export interface IShowUploadProcess {
    fileList: Array<IwaitUploadFiles>
}
class ShowUploadProcess extends React.Component<IShowUploadProcess> {
    constructor(props: IShowUploadProcess) {
        super(props)
    }
    render() {
        const listFiles = this.props.fileList.map((item: IwaitUploadFiles, index: number) => (
            <div key={`${item.hash}_${index}`}>
                {item.file.name}
            </div>
        ))
        return (
            <div></div>
        )
    }
}

export default ShowUploadProcess    