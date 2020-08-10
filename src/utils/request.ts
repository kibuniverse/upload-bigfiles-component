
interface para {
    url: string
    updateUploadProcess: (index: number) => void
    index: number
    method?: string | undefined
    data?: any
    headers?: any
    requestList?: Array<XMLHttpRequest> | undefined
}


export default function requset(paramsObj: para) {
    console.log(paramsObj)
    const url = paramsObj.url
    const data = paramsObj.data || null
    const method = paramsObj.method || 'post'
    const headers = paramsObj.headers || {}
    const requestList = paramsObj.requestList || []
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.open(method, url)
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key])
        })
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.status <= 300) || xhr.status == 304) {
                    if (requestList) {
                        const completeXhrIndex = requestList.indexOf(xhr)
                        requestList.splice(completeXhrIndex, 1)
                        paramsObj.updateUploadProcess(paramsObj.index)
                    }
                    resolve({
                        data: xhr.responseText
                    })
                }
            }
        }
        xhr.send(data)
        requestList.push(xhr)
    })
}