import React, { useState } from 'react'
import styled from '@emotion/styled'
import SparkMD5 from 'spark-md5'
import request from '../utils/request'

const Button = styled.button`
    width: 70px;
    height: 30px;
    line-height: 30px;
    border: none;
    border-radius: 7px;
    font-size: 15px;
    color: #fff;
    outline: none;
    background-color: #4a9dfb;
`
const UploadBigFile: React.FC<RouteComponentProps> = () => {
    const [fileData, setFileData] = useState<any>()
    const [fileChunkList, setFileChunkList] = useState<Array<any>>([])
    const MaxSize: number = 10 * 1024 * 1024
    const [isUpload, setIsUpload] = useState<boolean>(false)
    const [LinkUrl, setLinkUrl] = useState<string>('')
    let requestList: any[] = []
    let alreadyUploadNum: number = 0
    const [requestListall, setRequestListAll] = useState<Array<any>>([])
    const [uploadProcess, setUploadProcess] = useState<number>(0)
    const [calculateHash, setCalculateHash] = useState<boolean>(false)
    const [isPause, setIsPause] = useState<boolean>(false)
    const [calculateHashProcess, setCalculateHashProcess] = useState<number>(0)
    const updateUploadProcess = () => {
        alreadyUploadNum++
        console.log(`上传进度${alreadyUploadNum}/${fileChunkList.length}`)
        setUploadProcess(parseInt(String(((alreadyUploadNum - 1) / fileChunkList.length) * 100)))
    }
    const handleFilechange = (e: any) => {
        const [files] = e.target.files
        if (files) {
            createChunkList(files)
            setFileData(files)
        }
    }
    const createChunkList = async (files: { size: number; slice: (arg0: number, arg1: number) => any; name: any }) => {
        let fileChunkList = [];
        let cur = 0;
        let index = 1;
        while (cur < files.size) {
            fileChunkList.push({
                file: files.slice(cur, cur + MaxSize),
                hash: `${files.name}_${index}`,
                fileName: files.name,
            })
            index++;
            cur += MaxSize;
        }
        setFileChunkList(fileChunkList)
        console.log('正在计算hash, 请稍等')
        setCalculateHash(true)
        const hash = await calculatehash(fileChunkList)
        console.log('hash计算完成')
        setCalculateHash(false)
        fileChunkList.forEach((item, index) => {
            item.fileName = hash
            item.hash = `${hash}_${index}`
        })
    }
    const verifyIsUpload = (fileName: string, fileHash: string) => (
        request({
            url: 'http://127.0.0.1:8001/verify',
            method: 'post',
            headers: {
                "content-type": "application/json"
            },
            data: JSON.stringify({
                fileName: fileName,
                fileHash: fileHash,
            }),
            requestList: requestList,
            updateUploadProcess: updateUploadProcess
        })
    )
    const handleUpload = async () => {
        if (fileData && !calculateHash) {
            setIsUpload(true)
            const verifyDataJson: any = await verifyIsUpload(
                fileData.name,
                fileChunkList[0].fileName
            )
            const verifyData = JSON.parse(verifyDataJson.data)
            console.log(verifyData)
            console.log(fileChunkList)
            if (verifyData.AlreadyUploadList) {
                setFileChunkList(fileChunkList.filter(({ hash }) => (verifyData.AlreadyUploadList.indexOf(hash) === -1)))
            }

            console.log(fileChunkList)
            if (verifyData.url) {
                setLinkUrl(verifyData.url)
            }
            if (verifyData.isUpload) {
                setIsUpload(false)
                alert('上传成功')
                return
            }
            const requestArr = fileChunkList.map((item, index) => {
                const data = new FormData();
                data.append('fileData', item.file);
                data.append('fileName', item.fileName);
                data.append('hash', item.hash);
                return request({
                    url: 'http://127.0.0.1:8001/file_upload',
                    method: 'post',
                    data: data,
                    requestList: requestList,
                    updateUploadProcess: updateUploadProcess
                })
            })
            requestList = [...requestList]
            setRequestListAll([...requestList])
            await Promise.all(requestArr)
            let returnData: any = await mergeRequest()
            setLinkUrl(JSON.parse(returnData.data).url)
            setIsUpload(false)
            console.log(returnData)
            alert('上传成功')
        }
    }
    const getExtendName = (nameStr: string) => (
        nameStr.split('.')[nameStr.split('.').length - 1]
    )
    const mergeRequest = () => {
        return request({
            method: 'post',
            url: 'http://127.0.0.1:8001/mergeReq',
            headers: {
                "content-type": "application/json"
            },
            data: JSON.stringify({
                filename: fileChunkList[0].fileName,
                newname: `${fileChunkList[0].fileName}.${getExtendName(fileData.name)}`,
                size: fileData.size,
                chunkSize: MaxSize
            }),
            updateUploadProcess: updateUploadProcess
        })
    }
    /**
     * 
     * @param {Object} fileChunkList 
     * 计算切片数组对应的唯一哈希值
     */
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
                    setCalculateHashProcess(count)
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
    let handlePause = () => {
        console.log(requestListall)
        setIsPause(true)
        requestListall.forEach(xhr => xhr.abort())
        setRequestListAll([])
    }
    const handleRecoverUpLoad = async () => {
        setIsPause(false)
        const verifyDataJson: any = await verifyIsUpload(
            fileData.name,
            fileChunkList[0].fileName
        )
        const { isUpload, AlreadyUploadList } = JSON.parse(verifyDataJson.data)
        if (isUpload) {
            alert('上传完成')
            return
        }
        fileChunkList.filter(({ hash }) => (AlreadyUploadList.indexOf(hash) === -1))
        handleUpload()
    }
    const AddBtn = () => {
        if (isUpload) {
            return (
                <div style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: '#c9c9c9',
                        borderRadius: '2px',
                        margin: '0 0 10px 0',
                    }}>
                        <div style={{
                            width: `${uploadProcess}%`,
                            height: '4px',
                            backgroundImage: 'linear-gradient(to right, #8ebeb9, #3bc9d7, #37b9e9)',
                            transition: 'all .5s'
                        }}>

                        </div>
                    </div>
                    <Button style={{
                        marginBottom: '20px'
                    }} onClick={handlePause}>暂停</Button>
                    <Button style={{
                        opacity: `${isPause ? 1 : 0}`
                    }} onClick={handleRecoverUpLoad}>恢复</Button>
                </div>
            )
        }
        return (
            <></>
        )
    }

    const CalculHash = () => {
        if (calculateHash) {
            return (
                <div>
                    <div>正在处理文件中, 请稍等</div>
                    <div style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: '#c9c9c9',
                        borderRadius: '2px',
                        margin: '0 0 10px 0',
                    }}>
                        <div style={{
                            width: `${(calculateHashProcess / fileChunkList.length) * 100}%`,
                            height: '4px',
                            backgroundImage: 'linear-gradient(to right, #8ebeb9, #3bc9d7, #37b9e9)',
                            transition: 'all .5s'
                        }}>

                        </div>
                    </div>
                </div>
            )
        }
        return <></>
    }

    const Process = () => {
        if (fileData) {
            return (
                <>
                    <div style={{
                        marginTop: '10px',
                    }}>{fileData.name}</div>
                </>
            )
        }
        return null
    }
    return (
        <div style={{
            width: '400px',
            margin: 'auto',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{
                width: '100px',
                height: '100px',
                border: '1px solid gray',
                borderStyle: 'dotted',
                position: 'relative',
                marginBottom: '10px',
                overflow: 'hidden'
            }}>
                <input style={{
                    width: '100px',
                    height: '100px',
                    opacity: '0'
                }} type='file' onChange={handleFilechange} />
                <div style={{
                    position: 'absolute',
                    left: '43px',
                    top: '17px',
                    color: 'gray'
                }}>+</div>
                <div style={{
                    position: 'absolute',
                    top: '63px',
                    left: '18px',
                    color: 'gray'
                }}>点击上传</div>
            </div>
            <div>{
                LinkUrl.length ? LinkUrl : ''
            }</div>
            <Button type='submit' style={{
                backgroundColor: `${calculateHash ? 'gray' : 'skyblue'}`
            }} onClick={handleUpload}>上传</Button>
            <CalculHash />
            <Process />
            <AddBtn />
        </div>
    )
}

export default UploadBigFile