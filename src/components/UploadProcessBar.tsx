import React from 'react'
interface Iprops {
    uploadProcess: number
}


const UploadProcess = (props: Iprops) => {
    let process = props.uploadProcess
    while(process > 1) {
        process = process / 10
    }
    return (
        <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#c9c9c9',
            borderRadius: '2px',
        }}>
            <div style={{
                width: `${process * 100}%`,
                height: '4px',
                backgroundImage: 'linear-gradient(to right, #8ebeb9, #3bc9d7, #37b9e9)',
                transition: 'all .5s'
            }}>
            </div>
        </div>
    )
}

export default UploadProcess