import React, { useState, useEffect } from 'react'
import unionArr from '../utils/UnionArr'
import { getFileChunkList } from '../utils/createFilesChunksLists'
import { calculatehash } from '../utils/createHash'
import request from '../utils/request'
import servicePath from '../utils/Apiurl'

const Upload: React.FC = () => {
    const [filesStatusList, setFilesStatusList] = useState<any>([])
    const [waitUploadFiles, setWaitUploadFiles] = useState<Array<any>>([])
    const [uploadedFile, setUploadedFile] = useState<any>([])
    // 待上传文件修改后执行的操作
    useEffect(() => {
        setFilesStatusList(waitUploadFiles.map(item => ({
                id: `${item.name}_${new Date().getTime()}`,
                fileStaticMessage: {
                    fileName: item.name,
                    fileSize: item.size,
                    type: item.type
                },
                fileUploadMessage: {
                    showMessage: '正在处理文件',
                    status: 'waitCalHash',
                    isHashCalculateComplete: false,
                    uploadProcess: 0,
                    chunkLists: getFileChunkList(item, chunkSize),
                }
            }
        )))
        // 计算文件hash并添加
        changeFilesHash(waitUploadFiles.map(item => (
            {
                id: `${item.name}_${new Date().getTime()}`,
                fileStaticMessage: {
                    fileName: item.name,
                    fileSize: item.size,
                    type: item.type
                },
                fileUploadMessage: {
                    showMessage: '正在处理文件',
                    status: 'waitCalHash',
                    isHashCalculateComplete: item.isHashCalculateComplete || false,
                    uploadProcess: 0,
                    chunkLists: getFileChunkList(item, chunkSize),
                    isUploading: false
                }
            }
        )))
    }, [waitUploadFiles])
    const changeFilesHash = async (filesList: any) => {
        for (let i = 0, len = filesList.length; i < len; i++) {
            if (filesList[i].fileUploadMessage.isHashCalculateComplete === false) {
                let res = await calculatehash(filesList[i].fileUploadMessage.chunkLists)
                filesList[i].fileUploadMessage.chunkLists.forEach((item: any, index: number) => {
                    item.hash = `${res}_${index}`
                })
                filesList[i].fileUploadMessage.hash = res
                filesList[i].fileUploadMessage.totalChunksNumber = filesList[i].fileUploadMessage.chunkLists.length
                filesList[i].fileUploadMessage.status = 'waitUpload'
                filesList[i].fileUploadMessage.showMessage = '等待上传'
                filesList[i].fileUploadMessage.isHashCalculateComplete = true
            }
        }
        setFilesStatusList(filesList)
    }
    // 切片的文件大小
    const chunkSize = 5 * 1024 * 1024

    // 更新待上传文件数组信息
    const updateWaitUploadFiles = (files: Array<File>) => {
        setWaitUploadFiles(unionArr(waitUploadFiles.concat([...files])))
    }

    // 文件改变触发的函数
    const handleFilechange = async (e: any) => {
        updateWaitUploadFiles(e.target.files)
    }
    const verifyProcess = (index: number) => {
        console.log(`收到文件${filesStatusList[index].fileStaticMessage.fileName}的验证返回信息`)
    }

    // 验证文件是否存在
    const verify = (index: number) => (
        request({
            url: servicePath.verify,
            method: 'post',
            headers: {
                "content-type": "application/json"
            },
            data: JSON.stringify({
                fileName: filesStatusList[index].fileStaticMessage.fileName,
                fileHash: filesStatusList[index].fileUploadMessage.hash
            }),
            updateUploadProcess: verifyProcess,
            index: index
        })
    )

    // 文件上传主逻辑
    const uploadFile = async (id: string, index: number) => {
        let verifyRes: any = await verify(index)
        verifyRes = JSON.parse(verifyRes.data)
        console.log(verifyRes)
        if (verifyRes.status === 1) {
            console.log(`文件hash存在, 终止上传切片, 跳转至文件上传完成处理函数`)
            completeFile(verifyRes, index)
            return
        }
        // updateFileAlreadyUploadChunk(index, verifyRes.AlreadyUploadList.length)
        let filesStatusListTemp = filesStatusList.slice()
        filesStatusListTemp[index].fileUploadMessage.chunkLists = filesStatusListTemp[index].fileUploadMessage.chunkLists.filter((item: any) => (
            verifyRes.AlreadyUploadList.indexOf(item.hash) === -1
        ))
        filesStatusListTemp[index].fileUploadMessage.requestList = []
        let requestArr = filesStatusListTemp[index].fileUploadMessage.chunkLists.map((item: { file: Blob }, _index: number) => {
            const data = new FormData()
            data.append('fileData', item.file)
            data.append('hash', `${filesStatusList[index].fileUploadMessage.hash}_${_index}`)
            data.append('fileName', filesStatusList[index].fileUploadMessage.hash)
            return request({
                method: 'post',
                url: servicePath.sendChunkRequest,
                data: data,
                requestList: filesStatusListTemp[index].fileUploadMessage.requestList,
                index: index,
                updateUploadProcess: updateFileProcess,
            })
        })
        filesStatusListTemp[index].fileUploadMessage.isUploading = true
        filesStatusListTemp[index].fileUploadMessage.uploadProcess = verifyRes.AlreadyUploadList.length

        setFilesStatusList(filesStatusListTemp)
        await Promise.all(requestArr)
        console.log(`ID为${id}的文件上传完成，准备合并`)
        let res: any = await mergeRequest(id, index)
        let data = JSON.parse(res.data)
        completeFile(data, index)
    }

    // 修改已上传文件信息
    const completeFile = (data: any, index: number) => {
        let tempUploadedFile: any = uploadedFile.slice()
        tempUploadedFile.push({
            fileName: filesStatusList[index].fileStaticMessage.fileName,
            linkUrl: data.url
        })
        setUploadedFile(tempUploadedFile)
        let tempFilesList = filesStatusList.slice()
        tempFilesList.splice(index, index + 1)
        setFilesStatusList(tempFilesList)
        let waitUploadFilesTemp = waitUploadFiles
        waitUploadFiles.splice(index, index + 1)
        setWaitUploadFiles(waitUploadFilesTemp)
    }
    const mergeProcess = (index: number): void => {
        console.log(`${filesStatusList[index].fileStaticMessage.fileName}上传完成`)
    }

    /**
     * 
     * @param nameStr 文件名
     * 得到文件后缀
     */
    const getExtendName = (nameStr: string) => (
        nameStr.split('.')[nameStr.split('.').length - 1]
    )
    /**
     * 
     * @param id 文件对应的id
     * @param index 文件在文件数组中的下标
     */
    const mergeRequest = (id: string, index: number) => (
        request({
            method: 'post',
            url: servicePath.mergeRequest,
            index: index,
            updateUploadProcess: mergeProcess,
            data: JSON.stringify({
                filename: filesStatusList[index].fileUploadMessage.hash,
                newname: `${filesStatusList[index].fileUploadMessage.hash}.${getExtendName(filesStatusList[index].fileStaticMessage.fileName)}`,
                size: filesStatusList[index].fileStaticMessage.fileSize,
                chunkSize: chunkSize
            }),
            headers: {
                "content-type": "application/json"
            }
        })
    )

    /**
     *  更新文件上传的切片数，不负责计算具体的进度
     * @param index 文件在文件数组中的下标
     */
    const updateFileProcess = (index: number): void => {
        let filesStatusListTemp = filesStatusList.slice()
        filesStatusListTemp[index].fileUploadMessage.uploadProcess += 1
        setFilesStatusList(filesStatusListTemp)
    }
    // 暂停上传
    const pauseUpload = (index: number) => {
        console.log(`准备暂停上传${filesStatusList[index].fileStaticMessage.fileName}文件`)
        let filesStatusListTemp = filesStatusList.slice()
        console.log(filesStatusListTemp[index].fileUploadMessage.requestList)
        filesStatusListTemp[index].fileUploadMessage.requestList.forEach((item: XMLHttpRequest) => {
            item.abort()
        })
        console.log(`已暂停上传${filesStatusList[index].fileStaticMessage.fileName}文件`)
    }
    const UploadProcess = (props: any) => {
        return (
            <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#c9c9c9',
                borderRadius: '2px',
            }}>
                <div style={{
                    width: `${props.uploadProcess * 100}%`,
                    height: '4px',
                    backgroundImage: 'linear-gradient(to right, #8ebeb9, #3bc9d7, #37b9e9)',
                    transition: 'all .5s'
                }}>
                </div>
            </div>
        )
    }
    const WaitUploadlist = () => {
        const listItems = filesStatusList.map((item: any, index: number) =>
            <li key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '10px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '20%',
                    overflow: 'inherit'
                }}>{item.fileStaticMessage.fileName}</div>
                <div style={{
                    width: '20%',
                }}>{item.fileUploadMessage.showMessage}</div>
                <div style={{
                    width: '40%',
                    lineHeight: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <UploadProcess uploadProcess={item.fileUploadMessage.uploadProcess > 0 ? item.fileUploadMessage.uploadProcess / item.fileUploadMessage.totalChunksNumber : 0} />
                </div>
                <div style={{
                    width: '20%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <button style={{
                        backgroundColor: `${item.fileUploadMessage.isHashCalculateComplete ? '#42b2ec' : 'gray'}`,
                        border: 'none',
                        height: '100%',
                        color: '#fff',
                        outline: 'none',
                        display: `${item.fileUploadMessage.isUploading ? 'none' : 'block'}`,
                        opacity: `${item.fileUploadMessage.isHashCalculateComplete ? 1 : 0}`
                    }} onClick={() => uploadFile(item.id, index)}>
                        上传
                    </button>
                    <button style={{
                        backgroundColor: `${item.fileUploadMessage.isHashCalculateComplete ? '#42b2ec' : 'gray'}`,
                        border: 'none',
                        height: '100%',
                        color: '#fff',
                        outline: 'none',
                        display: `${item.fileUploadMessage.isUploading ? 'block' : 'none'}`
                    }} onClick={() => pauseUpload(index)}>暂停</button>
                </div>
            </li>
        )
        return (
            <ul style={{
                margin: 0,
                padding: 0,
                listStyle: 'none'
            }}>
                <li style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '20%',
                    }}>文件名</div>
                    <div style={{
                        width: '20%'
                    }}>状态</div>
                    <div style={{
                        width: '40%',
                    }}>上传进度</div>
                    <div style={{
                        width: '20%',
                    }}>操作</div>
                </li>
                {listItems}
            </ul >
        )
    }
    const UploadBox = () => (
        <div style={{
            width: '400px',
            height: '200px',
            border: '2px solid gray',
            borderStyle: 'dashed',
            borderRadius: '2%',
            position: 'relative',
            marginBottom: '10px',
            backgroundColor: '#f9f9f9'
        }}>
            <input style={{
                width: '400px',
                height: '200px',
                opacity: '0',
                zIndex: 10
            }} type='file' onChange={handleFilechange} multiple />
            <img style={{
                position: 'absolute',
                width: '251px',
                height: '100px',
                top: '35px',
                left: '71px',
            }} src="http://49.234.79.241:8001/66f3aeb62843866ac5f4f957e99b57c4.png" alt="" />
            <div style={{
                position: 'absolute',
                top: '149px',
                left: '109px',
                color: 'gray'
            }}>点击上传或者拖拽上传</div>
        </div>
    )

    const UploadedList = () => (
        <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none'
        }}>
            <li style={{
                display: 'flex',
                justifyContent: 'space-around'
            }}>
                <div style={{
                    width: '20%',
                    textAlign: 'center'
                }}>文件名</div>
                <div style={{
                    width: '80%',
                    textAlign: 'center'
                }}>url</div>
            </li>
            {uploadedFile.map((item: any, index: number) => (
                <li key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '20%',
                        textAlign: 'center'
                    }}>{item.fileName}</div>
                    <div style={{
                        width: '80%',
                        textAlign: 'center'
                    }}>
                        <a>{item.linkUrl}</a>
                    </div>
                </li>
            ))}
        </ul>
    )

    const FileStatusBoxHoc = (props: any) => {
        return (
            <div style={{
                width: '700px',
                border: '1px dashed gray',
                paddingBottom: '20px',
                marginBottom: '10px',
                opacity: `${filesStatusList.length || uploadedFile.length ? 1: 0}`
            }}>
                <props.child />
            </div >
        )

    }
    const Box = () => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '100px'
        }}>
            <UploadBox />
            <FileStatusBoxHoc child={WaitUploadlist} />
            <div style={{
                opacity: `${filesStatusList.length ? 1: 0}`
            }}>已上传文件列表</div>
            <FileStatusBoxHoc child={UploadedList} />
        </div >
    )


    return (
        <Box />
    )
}

export default Upload