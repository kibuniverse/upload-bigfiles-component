
export interface chunkListsFile {
    file: Blob
    hash: string
    fileName: string
    ishashCalculateComplete?: boolean
}

export function getFilesChunkLists(files: Array<File>, chunkSize: number) {
    let fileChunkLists: Array<Array<chunkListsFile>> = []
    const createChunkList = (files: File, chunkSize: number) => {
        let fileChunkList: Array<chunkListsFile> = []
        let cur = 0
        let index = 1
        while (cur < files.size) {
            fileChunkList.push({
                file: files.slice(cur, cur + chunkSize),
                hash: `${files.name}_${index}`,
                fileName: files.name,
                ishashCalculateComplete: false
            })
            index++;
            cur += chunkSize;
        }
        return fileChunkList
    }
    for (let i = 0, len = files.length; i < len; i++) {
        fileChunkLists.push(createChunkList(files[i], chunkSize))
    }
    return fileChunkLists
}

export function getFileChunkList(files: File, chunkSize: number) {
    let fileChunkList: Array<chunkListsFile> = []
    let cur = 0
    let index = 1
    while (cur < files.size) {
        fileChunkList.push({
            file: files.slice(cur, cur + chunkSize),
            hash: `${files.name}_${index}`,
            fileName: files.name,
        })
        index++;
        cur += chunkSize;
    }
    return fileChunkList
}