import React from 'react'

import { IwaitCalculateFile } from '../interfaces/interfaces'

export interface Iprops {
    files: Array<IwaitCalculateFile>
}

const WaitCalculateFiles = (props: Iprops) => {
    return (
        <div>
            <div style={{
                width: '400px',
                margin: 'auto',
                borderRadius: '10px',
                textAlign: 'center',
                color: 'blue',
                padding: '10px',
                border: '1px solid #5099ed',
                backgroundColor: '#b8d7fb',
            }}>正在计算以下文件哈希，请稍等</div>
        </div >
    )
}
export default WaitCalculateFiles