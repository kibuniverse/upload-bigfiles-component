import { UtilClassInterface } from "./interfaces/utilsClassInterface";
import {
  IwaitCalculateFile,
  IwaitUploadFile,
  chunkListsFile,
  IuploadedFile,
} from "./interfaces/interfaces";
import getFileChunkList from "./utils/getFileChunkHash";
import { calculatehash } from "./utils/createHash";
import uploadFile from "./utils/uploadFile";
import request from "./utils/request";
import servicePath from "./utils/Apiurl";
import getExtendName from "./utils/getExtendName";
import getUploadingFileIndexById from "./utils/getUploadingFileIndexById";
import calculateUploadProcess from "./utils/calculateUploadProcess";

export interface Iprops {
  chunkSize?: number;
  concurrency: number;
  updateWaitCalculateFile: (files: Array<IwaitCalculateFile>) => void;
  updateWaitUploadFile: (files: Array<IwaitUploadFile>) => void;
  updateUploadedFiles: (files: Array<IuploadedFile>) => void;
}

export default class DisposeAllData implements UtilClassInterface {
  waitCalculateFiles = [] as Array<IwaitCalculateFile>;
  waitUploadFiles = [] as Array<IwaitUploadFile>;
  uploadedFiles = [] as Array<IuploadedFile>;
  updateWaitCalculateFile: (files: Array<IwaitCalculateFile>) => void;
  updateWaitUploadFile: (files: Array<IwaitUploadFile>) => void;
  updateUploadedFiles: (files: Array<IuploadedFile>) => void;
  isCalculating: boolean;
  chunkSize: number;
  chunksConcurrenceUploadNum: number;
  concurrency: number;
  constructor(props: Iprops) {
    this.isCalculating = false;
    // 切片大小默认4M
    this.chunkSize = props.chunkSize ? props.chunkSize : 4 * 1024 * 1024;
    this.concurrency = props.concurrency ? props.concurrency : 3;
    this.updateWaitCalculateFile = props.updateWaitCalculateFile;
    this.updateWaitUploadFile = props.updateWaitUploadFile;
    this.updateUploadedFiles = props.updateUploadedFiles;
    this.chunksConcurrenceUploadNum = parseInt(
      String(10 / this.waitUploadFiles.length)
    );
  }

  /**
   * @function 对外暴露的添加文件方法
   * @param newFiles 新添加的文件数组
   */
  public addNewFiles(newFiles: FileList) {
    for (let i = 0, len = newFiles.length; i < len; i++) {
      this.waitCalculateFiles.push({
        id: `${newFiles[i].name}_${new Date().getTime()}`,
        file: newFiles[i],
      });
    }

    this.updateWaitCalculateFile(this.waitCalculateFiles);
    // 开始计算已添加的文件的hash
    this.calculateFilesMessage();
  }

  /**
   * @function 获取文件切片以及hash
   */
  private async calculateFilesMessage() {
    while (this.waitCalculateFiles.length > 0) {
      let file: any = this.waitCalculateFiles[0].file;
      let waituploadFile: IwaitUploadFile = {
        id: `${file.name as String}_${new Date().getTime()}`,
        file: file,
        chunkList: getFileChunkList(file, this.chunkSize),
        uploadProcess: 0,
        uploadPercentArr: [],
        uploadedSize: 0,
      };
      let hash: string = (await calculatehash(
        waituploadFile.chunkList
      )) as string;
      waituploadFile.hash = hash;
      console.info(hash);
      // hash计算完成，更新待计算文件数组
      this.waitCalculateFiles.shift();
      waituploadFile.chunkList.forEach(
        (item: chunkListsFile, index: number) => {
          item.hash = `${hash}_${index}`;
          item.index = index;
          item.fileName = hash;
        }
      );

      // 初始化上传进度数组
      waituploadFile.uploadPercentArr = new Array(
        waituploadFile.chunkList.length
      ).fill(0);

      // 更新计算完成文件数组
      this.addCalculatedFile(waituploadFile);
      // 上报新的待计算文件数组
      this.updateWaitCalculateFile(this.waitCalculateFiles);
    }
  }

  /**
   *
   * @function 添加已上传文件并上报
   * @param fileName 上传成功的文件名
   * @param url 返回的url
   *
   */
  private addUploadedFiles(fileName: string, url: string): void {
    this.uploadedFiles.push({
      fileName: fileName,
      url: url,
    });
    this.updateUploadedFiles(this.uploadedFiles);
  }

  /**
   * @function 增加计算完成文件并上报 调用上传方法
   * @param newWaitUploadFile 计算hash完成的文件
   */
  private async addCalculatedFile(
    newWaitUploadFile: IwaitUploadFile
  ): Promise<any> {
    this.waitUploadFiles.push(newWaitUploadFile);
    this.updateWaitUploadFile(this.waitUploadFiles);
    // 上传文件
    this.upload(newWaitUploadFile);
  }

  /**
   * @function 执行验证以及上传逻辑
   * @param waitUploadFile 待上传文件
   */
  private async upload(waitUploadFile: IwaitUploadFile) {
    // 获取验证信息, 判断文件是否上传，以及已上传文件的信息，处理断点续传
    let verifyData: any = await this.verifyRequest(
      waitUploadFile.file.name,
      waitUploadFile.hash as string
    );
    verifyData = JSON.parse(verifyData.data);

    // 文件已经上传完成
    if (verifyData.status === 1) {
      this.completeFileUpload(
        waitUploadFile.id as string,
        waitUploadFile.file.name,
        verifyData.url as string
      );
      return;
    }
    // 处理断点续传逻辑
    if (verifyData.AlreadyUploadList) {
      let loaded = this.calculeateAlreadyUploadSize(
        verifyData.AlreadyUploadList,
        waitUploadFile
      );
      let index = getUploadingFileIndexById(
        waitUploadFile.id as string,
        this.waitUploadFiles
      );
      if (index === -1) {
        return;
      }
      this.waitUploadFiles[index].uploadedSize = loaded;
      // 过滤已上传切片
      this.waitUploadFiles[index].chunkList = this.waitUploadFiles[
        index
      ].chunkList.filter(
        (item: chunkListsFile) =>
          verifyData.AlreadyUploadList.indexOf(item.hash) === -1
      );
    }
    uploadFile(
      waitUploadFile,
      this.concurrency,
      this.updateUploadFilePercent.bind(this)
    ).then(async (res) => {
      let uploadedMessage: any = await this.mergeRequest(waitUploadFile);
      uploadedMessage = JSON.parse(uploadedMessage.data);
      this.completeFileUpload(
        waitUploadFile.id as string,
        waitUploadFile.file.name,
        uploadedMessage.url as string
      );
    });
  }

  /**
   * @function 计算已上传的size
   * @param AlreadyUploadList 服务端返回的已上传hash列表
   * @param waitUploadFile 待上传文件
   * @returns 以上传的切片大小
   */
  private calculeateAlreadyUploadSize(
    AlreadyUploadList: Array<any>,
    waitUploadFile: IwaitUploadFile
  ) {
    let loaded: number = 0;
    for (let i = 0, len = AlreadyUploadList.length; i < len; i++) {
      let index = AlreadyUploadList[i].slice(-1);
      loaded += waitUploadFile.chunkList[index].file.size;
    }
    return loaded;
  }

  /**
   * @function 处理上传完成后的逻辑，上报更新UI
   * @param id 文件的id
   * @param fileName 文件名
   * @param url 得到的url
   */
  private completeFileUpload(id: string, fileName: string, url: string) {
    let index: number = getUploadingFileIndexById(id, this.waitUploadFiles);
    this.waitUploadFiles.splice(index, index + 1);
    this.updateWaitUploadFile(this.waitUploadFiles);
    this.addUploadedFiles(fileName, url);
  }

  private verifyRequest(fileName: string, filehash: string) {
    return request({
      method: "post",
      url: servicePath.verify,
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({
        fileName: fileName,
        fileHash: filehash,
      }),
    });
  }

  /**
   *
   * @param id 待更改的文件id
   * @param e onprogress返回值
   * @param index 切片的下标
   * @function 更新上传进度
   */
  private updateUploadFilePercent(id: string, e: any, index: number): void {
    let fileIndex: number = getUploadingFileIndexById(id, this.waitUploadFiles);
    if (fileIndex === -1) {
      return;
    }
    this.waitUploadFiles[fileIndex].uploadPercentArr[index] = e.loaded;
    this.waitUploadFiles[fileIndex].uploadProcess = calculateUploadProcess(
      this.waitUploadFiles[fileIndex].uploadedSize,
      this.waitUploadFiles[fileIndex]
    );
    this.updateWaitUploadFile(this.waitUploadFiles);
  }

  /**
   *
   * @param uploadFile 计算完成的文件
   * @function 发送文件合并请求
   */
  private mergeRequest(uploadFile: IwaitUploadFile) {
    return request({
      method: "post",
      url: servicePath.mergeRequest,
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({
        fileName: uploadFile.hash,
        newname: `${uploadFile.hash}.${getExtendName(uploadFile.file.name)}`,
        size: uploadFile.file.size,
        chunkSize: this.chunkSize,
      }),
    });
  }
}
