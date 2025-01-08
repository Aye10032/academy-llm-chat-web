'use client'

import {useEffect, useRef} from 'react'

declare global {
    interface Window {
        MathJax: any
    }
}

interface MathJaxProps {
    math: string
    display: boolean
}

const MathJax: React.FC<MathJaxProps> = ({math, display}) => {
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        if (ref.current) {
            window.MathJax.typesetClear([ref.current])
            window.MathJax.typesetPromise([ref.current])
        }
    }, [math])

    return (
        <span ref={ref}>
      {display ? `\\[${math}\\]` : `\$$${math}\$$`}
    </span>
    )
}

export default MathJax

