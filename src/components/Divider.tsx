import React from 'react'

export interface Iprops {
    text?: string
    color?: string
    lineColor?: string
    margin?: string 
}

const Divider: React.FC<Iprops> = props => {
    const {
        text = '',
        color = '#e7cfcf',
        lineColor = '#e7cfcf',
        margin = '10px'
    } = props
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
        }}>
            <div style={{
                flexGrow: 1,
                borderBottom: `1px solid ${lineColor}`,
                
            }}></div>
            <div style={{
                margin: `0 ${margin}`,
                color: color,
            }}>{props.text}</div>
            <div style={{
                flexGrow: 1,
                borderBottom: `1px solid ${lineColor}`,
                
            }}></div>
            
        </div>
    )
}

export default Divider
