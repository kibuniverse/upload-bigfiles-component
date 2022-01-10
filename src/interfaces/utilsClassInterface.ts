import { IwaitCalculateFile, IwaitUploadFile } from "./interfaces";
// 工具类接口
export interface UtilClassInterface {
  // 待计算文件数组
  waitCalculateFiles: Array<IwaitCalculateFile> | [];
  // 待上传文件数组
  waitUploadFiles: Array<IwaitUploadFile> | [];
  updateWaitCalculateFile: (files: Array<IwaitCalculateFile>) => void;
  updateWaitUploadFile: (files: Array<IwaitUploadFile>) => void;
  isCalculating: boolean;
  chunkSize: number;
  // 添加待计算文件
  addNewFiles: (newFiles: FileList) => void;

  //
}
