import { IwaitUploadFile } from "../interfaces/interfaces";


export default function getUploadingFileById(id: string, arr: Array<IwaitUploadFile>): number {
    for (let i = 0, len = arr.length; i < len; i++) {
        if(arr[i].id === id) {
            return i
        }
    }
    return -1
}