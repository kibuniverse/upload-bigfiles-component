export interface IfilesStatus {
    waitUploadFiles: Array<IwaitUploadFile> | []
    waitCalculateFiles: Array<IwaitCalculateFile> | []
    uploadingFiles: Array<IuploadingFile> | []
    uploadedFiles: Array<IuploadedFile> | []
}

export interface chunkListsFile {
    file: Blob
    hash: string
    fileName: string
}

export interface IcalculatedBasic {
    chunkList: Array<chunkListsFile> | []
}

export interface IwaitUploadFile extends IcalculatedBasic {
    file: File
    hash?: string
}

export interface IwaitCalculateFile {
    id: string
    file: File
}

export interface IuploadingFile extends IwaitCalculateFile, IcalculatedBasic {
    uploadProcess: number
}

export interface IuploadedFile {
    url: string
    fileName: string
}