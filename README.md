
# V2.0

> 分支v2.0

- 多文件添加
- 多文件并行上传
- 断点上传
- 极速秒传

使用方法

```
npm install
```
开启后台
```
npm run server
```

启动服务
```
npm run start
```





## 2.0版本介绍

基于react+ts开发


此版本将具体的文件处理上传逻辑从组建中抽离了出来做成了一个上传工具类`disposeAllData.ts`， 所有的组件只负责渲染处理完成后的数据



### 接口

[link to](https://github.com/kibuniverse/upload-bigfiles-component/blob/v2.0/src/interfaces/interfaces.ts )

- fileBasicMessage:  文件基本信息接口
- IwaitUploadFile  继承fileBasicMessage:  待上传文件接口
- IwaitCalculateFile： 待计算文件接口
- IuploadedFile: 计算完成文件接口



### 工具类`disposeAllData.ts`描述



#### 参数描述

|         参数名          | 是否必须 |   类型   |                        描述                        |
| :---------------------: | :------: | :------: | :------------------------------------------------: |
|        chunkSize        |    ❌     |  number  |             每个文件上传时的切片的大小             |
|       concurrency       |    ❌     |  number  |               每个文件的并发上传数量               |
| updateWaitCalculateFile |    ✔     | function |   更新待计算hash数组，将待计算的数组作为参数传入   |
|  updateWaitUploadFile   |    ✔     | function |     更新待上传数组，将待上传的数组作为参数传入     |
|   updateUploadedFiles   |    ✔     | function | 更新已上传文件数组，将上传完成的的数组作为参数传入 |



------









#### 对外暴露的可调用方法

|    名称     |          接受参数          |                描述                |
| :---------: | :------------------------: | :--------------------------------: |
| addNewFiles | 新添加的文件数组<FileList> | 添加新文件，自动开始计算上传等流程 |





#### 方法实现思路

##### 文件切片

利用文件的Blob类型原生方法slice，更具切片大小进行循环切片





##### 并发上传

利用递归的思想，开启并发数个上传**当前**切片数组中最前面切片的函数，可以理解为开启了三个线程（但是js是单线程语言），当当前线程完成其上传的切片后就去待上传切片数组中取其队列头部的切片再进行上传。

```js
while (concurrency > 0) {
    setTimeout(() => {
        // 取当前待上传切片数组顶端的切片进行上传, 具体的上传完成逻辑判断也在该函数中
        start()
    }, Math.random() * 100)
    // 并发上传数
    concurrency--
}
```



##### 计算文件上传进度



