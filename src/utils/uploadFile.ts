import { IwaitUploadFile, chunkListsFile } from "../interfaces/interfaces";
import request from './request'
import servicePath from './Apiurl'
import { count } from "console";

/**
 * @param file 待上传文件
 * @param concurrency 并发上传最大数
 * @param callback 回调函数，上报修改上传进度
 * @function 上传文件
 */



export default async function UploadFile(file: IwaitUploadFile, concurrency: number, updatePercent: (e: any) => void) {
    return new Promise((reslove, reject) => {
        let chunkList: Array<chunkListsFile> = file.chunkList
        let len = chunkList.length
        let counter = 0
        let isStop = false
        const start = async () => {
            if (isStop) {
                return
            }
            const item: chunkListsFile = chunkList.shift() as chunkListsFile
            if (item) {
                const formdata = new FormData()
                formdata.append(item.hash, item.file)
                const xhr = new XMLHttpRequest()
                const index = item.index

                xhr.onerror = function error(e) {
                    isStop = true
                    reject(e)
                }

                // 分片上传完后的回调
                xhr.onload = () => {
                    if (xhr.status < 200 || xhr.status >= 300) {
                        isStop = false
                        reject('服务端返回状态码错误')
                    }
                    // 最后一个切片已经上传完成
                    if (counter === len - 1) {
                        reslove()
                    } else {
                        counter++
                        // 递归调用
                        start()
                    }
                }

                // 上报分片上传进度
                if (xhr.upload) {
                    xhr.upload.onprogress = (e: any) => {
                        if (e.total > 0) {
                            e.percent = e.loaded / e.total * 100
                        }
                        console.log(e.loaded)
                    }
                }

                xhr.open('post', servicePath.sendChunkRequest, true)
                xhr.send(formdata)
            }
        }
        while (concurrency > 0) {
            setTimeout(() => {
                start()
            }, Math.random() * 1000)
        }
    })
}
