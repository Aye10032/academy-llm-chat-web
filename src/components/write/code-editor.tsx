import * as React from 'react'
import {Copy, Check} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'

// @ts-expect-error no need any more
interface CodeEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string
    onChange: (value: string) => void
}

export function CodeEditor({value, onChange, className, ...props}: CodeEditorProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const [lines, setLines] = React.useState<number[]>([])
    const [currentLine, setCurrentLine] = React.useState<number>(1)
    const [selection, setSelection] = React.useState<{ start: number, end: number }>({start: 1, end: 1})
    const [copied, setCopied] = React.useState(false)

    // Update line numbers when content changes
    React.useEffect(() => {
        const lineCount = (value.match(/\n/g) || []).length + 1
        setLines(Array.from({length: lineCount}, (_, i) => i + 1))
    }, [value])

    // Handle cursor and selection changes
    const handleSelect = () => {
        if (!textareaRef.current) return

        const {selectionStart, selectionEnd, value} = textareaRef.current
        const startLine = (value.slice(0, selectionStart).match(/\n/g) || []).length + 1
        const endLine = (value.slice(0, selectionEnd).match(/\n/g) || []).length + 1

        setCurrentLine(startLine)
        setSelection({start: startLine, end: endLine})
    }

    // Copy functionality
    const copyToClipboard = async () => {
        if (!textareaRef.current) return

        await navigator.clipboard.writeText(textareaRef.current.value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative">
            <div className="absolute right-4 top-4 z-10">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-background"
                    onClick={copyToClipboard}
                >
                    {copied ? (
                        <Check className="h-4 w-4"/>
                    ) : (
                        <Copy className="h-4 w-4"/>
                    )}
                </Button>
            </div>
            <div className="flex">
                <div className="flex-none w-12 pt-4 pb-4 bg-muted/30 text-muted-foreground text-sm select-none">
                    {lines.map((num) => (
                        <div
                            key={num}
                            className={cn(
                                'text-right pr-3 transition-colors',
                                (num >= selection.start && num <= selection.end) && 'text-primary font-medium',
                                num === currentLine && selection.start === selection.end && 'text-primary font-medium'
                            )}
                        >
                            {num}
                        </div>
                    ))}
                </div>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onSelect={handleSelect}
                    onClick={handleSelect}
                    className={cn(
                        "flex-1 p-4 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border-none font-mono text-sm",
                        className
                    )}
                    style={{
                        minHeight: '100%',
                        lineHeight: '1.5',
                        tabSize: 2,
                    }}
                    {...props}
                />
            </div>
        </div>
    )
}

