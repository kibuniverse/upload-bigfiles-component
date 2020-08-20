import SparkMD5 from 'spark-md5'

const createChunkList = async (files: File, chunkSize: number) => {
    let fileChunkList:any[] = []
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
const calculatehash = (fileChunkList: any) => (
    new Promise(reslove => {
        const spark = new SparkMD5.ArrayBuffer()
        let count = 0
        const loadNext = (index: number) => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(fileChunkList[index].file)
            reader.onload = (e: any) => {
                count++
                spark.append(e.target.result)
                // 如果文件处理完成则发送发送请求
                if (count === fileChunkList.length) {
                    reslove(spark.end())
                    return
                }
                loadNext(count)
            }
        }
        loadNext(0)
    })
)

export { createChunkList, calculatehash }