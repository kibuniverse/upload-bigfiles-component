import React, { useState, useEffect } from 'react'
import unionArr from '../utils/UnionArr'
import { getFileChunkList } from '../utils/createFilesChunksLists'
import { calculatehash } from '../utils/createHash'
import request from '../utils/request'
import servicePath from '../utils/Apiurl'

const Upload: React.FC = () => {
    const [filesStatusList, setFilesStatusList] = useState<any>([])
    const [waitUploadFiles, setWaitUploadFiles] = useState<Array<File>>([])
    const [uploadedFile, setUploadedFile] = useState<any>([])
    // 待上传文件修改后执行的操作
    useEffect(() => {
        setFilesStatusList(waitUploadFiles.map(item => (
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
                    isHashCalculateComplete: false,
                    uploadProcess: 0,
                    chunkLists: getFileChunkList(item, chunkSize),
                }
            }
        )))
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
                    isHashCalculateComplete: false,
                    uploadProcess: 0,
                    chunkLists: getFileChunkList(item, chunkSize),
                }
            }
        )))
    }, [waitUploadFiles])
    useEffect(() => {
        console.log(filesStatusList)
    }, [filesStatusList])
    const changeFilesHash = async (filesList: any) => {
        for (let i = 0, len = filesList.length; i < len; i++) {
            if (filesList[i].fileUploadMessage.isHashCalculateComplete === false) {
                let res = await calculatehash(filesList[i].fileUploadMessage.chunkLists)
                filesList[i].fileUploadMessage.hash = res
                filesList[i].fileUploadMessage.status = 'waitUpload'
                filesList[i].fileUploadMessage.showMessage = '等待上传'
                filesList[i].fileUploadMessage.isHashCalculateComplete = true
            }
        }
        setFilesStatusList(filesList)
    }
    // 切片的文件大小
    const chunkSize = 10 * 1024 * 1024

    // 更新待上传文件数组信息
    const updateWaitUploadFiles = (files: Array<File>) => {
        setWaitUploadFiles(unionArr(waitUploadFiles.concat([...files])))
    }

    // 文件改变触发的函数
    const handleFilechange = async (e: any) => {
        updateWaitUploadFiles(e.target.files)
    }

    const uploadFile = async (id: string, index: number) => {
        let filesStatusListTemp = filesStatusList.slice()
        let requestList: any[] = []
        let requestArr = filesStatusListTemp[index].fileUploadMessage.chunkLists.map((item: { file: Blob }, _index: number) => {
            const data = new FormData()
            data.append('fileData', item.file)
            data.append('hash', `${filesStatusList[index].fileUploadMessage.hash}_${_index}`)
            data.append('fileName', filesStatusList[index].fileUploadMessage.hash)
            return request({
                method: 'post',
                url: servicePath.sendChunkRequest,
                data: data,
                requestList: requestList,
                index: index,
                updateUploadProcess: updateFileProcess,
            })
        })
        await Promise.all(requestArr)
        console.log(`ID为${id}的文件上传完成，准备合并`)
        let res: any = await mergeRequest(id, index)
        let data = JSON.parse(res.data)
        completeFile(data, index)
    }
    const completeFile = (data: any, index: number) => {
        let tempUploadedFile: any = uploadedFile.slice()
        tempUploadedFile.push({
            fileName: filesStatusList[index].fileStaticMessage.fileName,
            linkUrl: data.url
        })
        setUploadedFile(tempUploadedFile)
        let tempFilesList = filesStatusList
        tempFilesList.splice(index, index + 1)
        setFilesStatusList(tempFilesList)
        let waitUploadFilesTemp = waitUploadFiles
        waitUploadFiles.splice(index, index + 1)
        setWaitUploadFiles(waitUploadFilesTemp)
    }

    const mergeProcess = (index: number): void => {
        console.log(`${filesStatusList[index].fileStaticMessage.fileName}上传完成`)
    }
    const getExtendName = (nameStr: string) => (
        nameStr.split('.')[nameStr.split('.').length - 1]
    )
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
    const updateFileProcess = (index: number): void => {
        let filesStatusListTemp = filesStatusList.slice()
        filesStatusListTemp[index].fileUploadMessage.uploadProcess += 1
        setFilesStatusList(filesStatusListTemp)
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
                    <UploadProcess uploadProcess={item.fileUploadMessage.uploadProcess > 0 ? item.fileUploadMessage.uploadProcess / item.fileUploadMessage.chunkLists.length : 0} />
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
                        opacity: `${item.fileUploadMessage.isHashCalculateComplete ? 1 : 0}`
                    }} onClick={() => uploadFile(item.id, index)}>
                        上传
                    </button>
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
            }} type='file' onChange={handleFilechange} multiple />
            <div style={{
                position: 'absolute',
                left: '43px',
                top: '17px',
                color: 'gray',
                fontSize: '24px'
            }}>+</div>
            <div style={{
                position: 'absolute',
                top: '63px',
                left: '18px',
                color: 'gray'
            }}>点击上传</div>
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
                border: '1px solid gray',
                borderStyle: 'dotted',
                paddingBottom: '20px',
                marginBottom: '10px'
            }}>
                <props.child />
            </div>
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
            <div>已上传文件列表</div>
            <FileStatusBoxHoc child={UploadedList} />
        </div >
    )


    return (
        <Box />
    )
}

export default Upload
