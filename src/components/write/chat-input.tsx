import React, {useState, useRef, useCallback} from "react"
import {Paperclip, Send} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"
import {FileUploadIndicator} from "./file-upload-indicator"
import {projectStore} from "@/utils/self-state.tsx";

interface ChatInputProps {
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    input: string;
    setInput: (input: string) => void;
    files: File[];
    setFiles: (files: File[]) => void;
}

export function ChatInput({handleSubmit, input, setInput, files, setFiles}: ChatInputProps) {
    const selectedChatUID = projectStore((state)=>state.selectedChatUID)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dragCounterRef = useRef(0)

    const handleFiles = useCallback((newFiles: File[]) => {
        // @ts-expect-error no need
        setFiles(prev => [...prev, ...newFiles])
    }, [setFiles])

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        dragCounterRef.current++
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        dragCounterRef.current--
        if (dragCounterRef.current === 0) {
            setIsDragging(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        dragCounterRef.current = 0
        const newFiles = Array.from(e.dataTransfer.files)
        handleFiles(newFiles)
    }, [handleFiles])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = e.target.files ? Array.from(e.target.files) : []
        handleFiles(newFiles)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleDeleteFile = (fileName: string) => {
        // @ts-expect-error no need
        setFiles(prev => prev.filter(f => f.name !== fileName))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // 普通回车：提交表单
            e.preventDefault();
            const form = e.currentTarget.form;
            if (form && input.trim()) {
                form.requestSubmit();
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="border-none p-4">
            <div className="space-y-4">
                {files.length > 0 && (
                    <div className="space-y-2 max-h-[120px] overflow-y-auto
                            [&::-webkit-scrollbar]:w-2
                            [&::-webkit-scrollbar-track]:bg-transparent
                            [&::-webkit-scrollbar-thumb]:bg-gray-200
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                            transition-all duration-300 px-4"
                    >
                        {files.map((file) => (
                            <FileUploadIndicator
                                key={file.name}
                                fileName={file.name}
                                fileSize={file.size}
                                onDelete={() => handleDeleteFile(file.name)}
                            />
                        ))}
                    </div>
                )}
                <div
                    className="relative"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        multiple
                    />
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入消息或拖拽文件到此处..."
                        className="min-h-[80px] pr-24 resize-none border-gray-400"
                        disabled={!selectedChatUID}
                    />
                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip className="h-4 w-4"/>
                        </Button>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim()}
                        >
                            <Send className="h-4 w-4"/>
                        </Button>
                    </div>
                    {isDragging && (
                        <div className="absolute inset-0 border-2 border-dashed border-primary rounded-lg flex items-center justify-center bg-background/80">
                            <p className="text-primary">释放以上传文件</p>
                        </div>
                    )}
                </div>
            </div>
        </form>
    )
}

