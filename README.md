## v1.1

> 分支 v1.1

- 多文件添加
- 切片上传
- 断点续传(上传进度展示, 重新上传时从停止上传处开始)

## v2.0

> 分支 v2.0

- 多文件添加
- 多文件上传
- 断点续传
- 文件验证秒传

# V2.0

> 分支 v2.0

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

## 2.0 版本介绍

基于 react+ts 开发

此版本将具体的文件处理上传逻辑从组建中抽离了出来做成了一个上传工具类`disposeAllData.ts`， 所有的组件只负责渲染处理完成后的数据

### 接口

[link to](https://github.com/kibuniverse/upload-bigfiles-component/blob/v2.0/src/interfaces/interfaces.ts)

- fileBasicMessage: 文件基本信息接口
- IwaitUploadFile 继承 fileBasicMessage: 待上传文件接口
- IwaitCalculateFile： 待计算文件接口
- IuploadedFile: 计算完成文件接口

### 工具类`disposeAllData.ts`描述

#### 参数描述

|         参数名          | 是否必须 |   类型   |                        描述                        |
| :---------------------: | :------: | :------: | :------------------------------------------------: |
|        chunkSize        |    ❌    |  number  |             每个文件上传时的切片的大小             |
|       concurrency       |    ❌    |  number  |               每个文件的并发上传数量               |
| updateWaitCalculateFile |    ✔     | function |  更新待计算 hash 数组，将待计算的数组作为参数传入  |
|  updateWaitUploadFile   |    ✔     | function |     更新待上传数组，将待上传的数组作为参数传入     |
|   updateUploadedFiles   |    ✔     | function | 更新已上传文件数组，将上传完成的的数组作为参数传入 |

---

#### 对外暴露的可调用方法

|    名称     |          接受参数          |                描述                |
| :---------: | :------------------------: | :--------------------------------: |
| addNewFiles | 新添加的文件数组<FileList> | 添加新文件，自动开始计算上传等流程 |

#### 方法实现思路

##### 文件切片

利用文件的 Blob 类型原生方法 slice，根据切片大小进行循环切片

##### 并发上传

利用递归的思想，开启并发数个上传**当前**切片数组中最前面切片的函数，可以理解为开启了三个线程（但是 js 是单线程语言），当当前线程完成其上传的切片后就去待上传切片数组中取其队列头部的切片再进行上传。

```js
while (concurrency > 0) {
  setTimeout(() => {
    // 取当前待上传切片数组顶端的切片进行上传, 具体的上传完成逻辑判断也在该函数中
    start();
  }, Math.random() * 100);
  // 并发上传数
  concurrency--;
}
```

##### 计算文件上传进度

> 大体思路为利用上传 xhr 对象的 onload 属性计算出每一个分片的进度从而算出整体的进度

###### 待上传文件接口

```tsx
interface fileBasicMessage {
  file: File;
  id?: string;
}
export interface IwaitUploadFile extends fileBasicMessage {
  hash?: string; //文件hash
  uploadProcess?: number; //上传文件的进度 计算后得出
  uploadPercentArr: Array<number>; // 用于记录上传列表返回的已上传文件大小
  chunkList: Array<chunkListsFile> | []; // 上传文件列表
  uploadedSize: number; // 记录服务端返回的已上传文件大小
}
```

1. 首先利用服务端返回的已上传文件列表名计算出已上传的文件大小并作为当前待上传对象的`uploadedSize`属性
2. 在上传单个切片的时候注入回调函数上报当前切片的进度，修改对应的上传列表的值后累加上传列表和`uploadSize`值后计算出已上传的进度
3. 调用更新函数，上报后更新 UI
