import { IwaitUploadFile } from "../interfaces/interfaces"

export default function calculateUploadProcess(uploadedSize: number, waitUploadFile: IwaitUploadFile): number {
    let loaded = uploadedSize
    waitUploadFile.uploadPercentArr.forEach((item: number) => {
        loaded += item
    })
    return loaded / waitUploadFile.file.size
}