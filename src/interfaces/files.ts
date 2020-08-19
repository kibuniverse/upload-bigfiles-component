export interface files {
    readonly filesList: FileList | []
    readonly waitUploadFiles: Array<IwaitUploadFiles> | []
}

export interface IwaitUploadFiles {
    readonly file: File
    readonly hash: string
}
