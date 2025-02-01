import React, {useState, useRef, useCallback} from "react"
import {Paperclip, Send} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"
import {FileUploadIndicator} from "./file-upload-indicator"

interface ChatInputProps {
    onSendMessage: (message: string) => void
    onFileUpload: (files: File[]) => void
}

interface UploadingFile {
    id: string
    file: File
    status: "uploading" | "complete" | "error"
    progress: number
}

export function ChatInput({onSendMessage, onFileUpload}: ChatInputProps) {
    const [message, setMessage] = useState("")
    const [isDragging, setIsDragging] = useState(false)
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dragCounterRef = useRef(0)
    const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        dragCounterRef.current++

        if (dragTimeoutRef.current) {
            clearTimeout(dragTimeoutRef.current)
        }

        dragTimeoutRef.current = setTimeout(() => {
            if (dragCounterRef.current > 0) {
                setIsDragging(true)
            }
        }, 100)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        dragCounterRef.current--

        if (dragTimeoutRef.current) {
            clearTimeout(dragTimeoutRef.current)
        }

        dragTimeoutRef.current = setTimeout(() => {
            if (dragCounterRef.current === 0) {
                setIsDragging(false)
            }
        }, 100)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : []
        handleFiles(files)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleFiles = (files: File[]) => {
        const newUploadingFiles = files.map((file) => ({
            id: Math.random().toString(36).substring(7),
            file,
            status: "uploading" as const,
            progress: 0,
        }))

        setUploadingFiles((prev) => [...prev, ...newUploadingFiles])
        onFileUpload(files)

        // Simulate upload progress
        newUploadingFiles.forEach((file) => {
            const intervalId = setInterval(() => {
                setUploadingFiles((prev) =>
                    prev.map((f) => {
                        if (f.id === file.id) {
                            const newProgress = Math.min(f.progress + 10, 100)
                            if (newProgress === 100) {
                                clearInterval(intervalId)
                                return {...f, status: "complete" as const, progress: newProgress}
                            }
                            return {...f, progress: newProgress}
                        }
                        return f
                    }),
                )
            }, 500)
        })
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        dragCounterRef.current = 0
        const files = Array.from(e.dataTransfer.files)
        handleFiles(files)
    }, [handleFiles])

    const handleDeleteFile = (fileId: string) => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId))
    }

    const handleSend = () => {
        if (message.trim() || uploadingFiles.length > 0) {
            onSendMessage(message)
            setMessage("")
            setUploadingFiles([])
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="border-t p-4">
            <div className="space-y-4">
                {uploadingFiles.length > 0 && (
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2">
                        {uploadingFiles.map((file) => (
                            <FileUploadIndicator
                                key={file.id}
                                fileName={file.file.name}
                                fileSize={file.file.size}
                                status={file.status}
                                progress={file.progress}
                                onDelete={() => handleDeleteFile(file.id)}
                            />
                        ))}
                    </div>
                )}
                <div
                    className="relative"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple/>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入消息或拖拽文件到此处..."
                        className="min-h-[80px] pr-24 resize-none"
                    />
                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                            <Paperclip className="h-4 w-4"/>
                        </Button>
                        <Button size="icon" onClick={handleSend} disabled={!message.trim() && uploadingFiles.length === 0}>
                            <Send className="h-4 w-4"/>
                        </Button>
                    </div>
                    {isDragging && (
                        <div
                            className="absolute inset-0 border-2 border-dashed border-primary rounded-lg flex items-center justify-center bg-background/80">
                            <p className="text-primary">释放以上传文件</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

