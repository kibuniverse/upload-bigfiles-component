export interface IfilesStatus {
  waitUploadFiles: Array<IwaitUploadFile> | [];
  waitCalculateFiles: Array<IwaitCalculateFile> | [];
  uploadedFiles: Array<IuploadedFile> | [];
}

interface fileBasicMessage {
  file: File;
  id?: string;
}

export interface chunkListsFile {
  file: Blob;
  hash: string;
  fileName: string;
  index?: number;
}

export interface IwaitUploadFile extends fileBasicMessage {
  hash?: string;
  uploadProcess?: number;
  uploadPercentArr: Array<number> | [];
  chunkList: Array<chunkListsFile> | [];
  uploadedSize: number;
}

export interface IwaitCalculateFile {
  id: string;
  file: File;
}

export interface IuploadedFile {
  url: string;
  fileName: string;
}
