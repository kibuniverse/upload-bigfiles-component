export interface files {
    waitUploadFiles: Array<IwaitUploadFiles> | []
    addFiles: FileList | []
    waitCalculateFiles: Array<IwaitCalculateFiles> | []
    uploadingFiles: Array<IuploadingFile> | []
    uploadedFiles: Array<IuploadedFile> | []
}

export interface IwaitUploadFiles extends IcalculatedBasic {
    file: File
    hash: string
}

export interface IwaitCalculateFiles {
    id: string
    file: File
    isCalculate: boolean
}

export interface IcalculatedBasic {
    chunkList: Array<File> | []
}

export interface IuploadingFile extends IwaitCalculateFiles, IcalculatedBasic {
    uploadProcess: number
}

export interface IuploadedFile {
    url: string
    fileName: string
}