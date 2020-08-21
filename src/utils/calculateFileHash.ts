
import { IwaitUploadFile } from '../interfaces/interfaces'
import { getFileChunkList } from './createFilesChunksLists'
import { calculatehash } from './createHash'

export interface IProps {
    fileList: FileList | []
    updateWaitUploadFile: (waitFileUploadFile: IwaitUploadFile) => void
    chunkSize: number
}

async function calculateFileHash(props: IProps) {
    let fileList = props.fileList
    for (let i: number = 0, len: number = fileList.length; i < len; i++) {
        let chunkList = getFileChunkList(fileList[i], props.chunkSize)
        let hash: any = await calculatehash(chunkList)
        let obj = {
            file: fileList[i],
            chunkList: chunkList,
            hash: hash
        }
        props.updateWaitUploadFile(obj)
    }
}

export default calculateFileHash