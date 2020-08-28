import { IwaitUploadFile } from "../interfaces/interfaces"

export default function calculateUploadProcess(waitUploadFile: IwaitUploadFile): number {
    let loaded = 0
    waitUploadFile.uploadPercentArr.forEach((item: number) => {
        loaded += item
    })
    return loaded / waitUploadFile.file.size
}