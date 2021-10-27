
import {chunkListsFile} from '../interfaces/interfaces'


export default function getFileChunkHash(file: File, chunkSize: number):Array<chunkListsFile> {
    let fileChunkList: Array<chunkListsFile> = []
    let cur = 0
    let index = 1
    while (cur < file.size) {
        fileChunkList.push({
            file: file.slice(cur, cur + chunkSize),
            hash: `${file.name}_${index}`,
            fileName: file.name,
        })
        index++;
        cur += chunkSize;
    }
    return fileChunkList
}