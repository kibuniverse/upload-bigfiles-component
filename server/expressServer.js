var express = require('express');
const path = require('path')
var app = express();
var fs = require('fs');
app.use('*', function (req, res, next) {
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    next(); // 链式操作
});
//引入中间件
var formidable = require('formidable');
app.use(express.static('bigfiles'))
//监听路由
app.post('/file_upload', (req, res) => {
    console.log('接收到请求')
    //创建实例
    var form = new formidable.IncomingForm();
    //设置上传文件存放的目录
    form.uploadDir = "./uploads";
    //保持原来的文件的扩展名
    form.keepExtensions = true;
    //解析表单（异步）
    form.parse(req, function (err, fields, files) {
        //打印普通参数
        if (err) {
            console.log(`解析失败 ${err}`)
            return
        }
        console.log(fields);
        fs.mkdir(`${__dirname}/uploads/${fields.fileName}`, { recursive: true }, err => {
            if (err) {
                console.log('创建文件夹出错:' + err)
            } else {
                console.log(files);
                let oldPath = __dirname + '/' + files.fileData.path;
                let newPath = `${__dirname}/uploads/${fields.fileName}/${fields.hash}`;
                fs.rename(oldPath, newPath, err => {
                    if (err) { console.log(err) }
                })
            }
            res.send('ok');
            res.end();
        })
        //打印当前文件信息
    });
})
/**
 * 
 * @param {Object} req 请求携带的信息
 * @returns {Object} 返回JSON处理过的对象 
 */
const reslovePost = req => {
    return new Promise(reslove => {
        let chunk = '';
        req.on('data', data => {
            chunk += data
        })
        req.on('end', () => {
            reslove(JSON.parse(chunk));
        })
    })
}
const compareFun = (value1, value2) => {
    let v1 = parseInt(value1.split('_')[value1.split('_').length - 1])
    let v2 = parseInt(value2.split('_')[value2.split('_').length - 1])
    return v1 - v2;
}
const pipeStream = (item, wirteStream) => {
    return new Promise(reslove => {
        const readStream = fs.createReadStream(item)
        readStream.on('end', () => {
            fs.unlinkSync(item, err => console.log(err))
            reslove()
        })
        readStream.pipe(wirteStream)
    })
}
const mergeFileChunks = async data => {
    const chunksDir = __dirname + `/uploads/${data.filename}`
    fs.readdir(chunksDir, async (err, files) => {
        if (err) {
            console.log(err)
            return
        }
        const chunkFilesPath = files.map(item => `${chunksDir}/${item}`)
        chunkFilesPath.sort(compareFun)
        await Promise.all(
            /**
             * 异步的将每一个文件item写入创建的文件可写流里
             */
            chunkFilesPath.map((item, index) =>
                pipeStream(
                    item,
                    fs.createWriteStream(`${__dirname}/bigfiles/${data.newname}`, {
                        flag: 'a+',
                        start: index * data.chunkSize,
                        end: (index + 1) * data.chunkSize > data.size ? data.size : (index + 1) * data.chunkSize
                    })
                )
            )
        )

        // fs.rmdirSync(chunksDir, { recursive: true }, err => {
        //     console.log(chunksDir)
        //     console.log(err)
        // })
    })
}
/**
 * 
 * @param {string} fileName 
 * 得到文件后缀名 
 */
const getFileExt = fileName => (
    fileName.split('.')[fileName.split('.').length - 1]
)
const getAlreadyUploadList = hashPath => {
    console.log(hashPath)
    return new Promise(reslove => {
        if (fs.existsSync(hashPath)) {
            fs.readdir(hashPath, (err, data) => {
                if (err) {
                    console.log(err)
                    reslove([])
                }
                reslove(data)
            })
        } else {
            reslove([])
        }
    })

}
app.post('/verify', async (req, res) => {
    console.log('=====>  收到验证请求')
    const data = await reslovePost(req)
    const { fileName, fileHash } = data
    const ext = getFileExt(fileName)
    const filePath = `${__dirname}/bigfiles/${fileHash}.${ext}`
    const hashPath = `${__dirname}/uploads/${fileHash}`
    if (fs.existsSync(filePath)) {
        console.log('=====> 该文件存在')
        res.send(JSON.stringify({
            status: 1,
            msg: '文件存在',
            isUpload: true,
            url: `http://127.0.0.1:8001/${fileHash}.${ext}`
        }))
        res.end()
    } else {
        console.log('=====> 文件不存在')
        const AlreadyUploadList = await getAlreadyUploadList(hashPath)
        console.log(AlreadyUploadList)
        res.send(JSON.stringify({
            status: 0,
            msg: '文件不存在',
            isUpload: false,
            AlreadyUploadList: AlreadyUploadList
        }))
        res.end()
    }
})
app.post('/mergeReq', async (req, res) => {
    console.log('====> 收到合并请求');
    const data = await reslovePost(req);
    await mergeFileChunks(data)
    res.send(JSON.stringify({
        ok: 1,
        msg: '合并完成',
        url: `http://127.0.0.1:8001/${data.newname}`
    }))
    res.end()
})

var server = app.listen(8001, function () {
    console.log("访问地址为 http://127.0.0.1:8001")
})