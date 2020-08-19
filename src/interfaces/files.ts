export interface files {
    readonly waitUploadFiles: Array<IwaitUploadFiles> | []
    readonly addFiles: FileList | []
    readonly waitCalculateFiles: Array<IwaitCalculateFiles> | []
}

export interface IwaitUploadFiles {
    readonly file: File
    readonly hash: string
}

export interface IwaitCalculateFiles {
    id: string
    file: File
    isCalculate: boolean
}