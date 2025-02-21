import React, {useState, useRef, useCallback} from "react"
import {Globe, Paperclip, Send} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"
import {FileUploadIndicator} from "./file-upload-indicator"
import {projectStore} from "@/utils/self-state.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {MultiSelect} from "@/components/write/knowledge-select-form.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

interface ChatInputProps {
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    input: string;
    setInput: (input: string) => void;
    files: File[];
    setFiles: (files: File[]) => void;
    useWeb: boolean
    setUseWeb: (flag: boolean) => void
    selectedKbList: string[]
    setSelectedKbList: (kbList: string[]) => void
}

export function ChatInput(
    {
        handleSubmit,
        input,
        setInput,
        files,
        setFiles,
        useWeb,
        setUseWeb,
        selectedKbList,
        setSelectedKbList,
    }: ChatInputProps) {
    const prChatUID = projectStore((state) => state.prChatUID)
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
                        className="min-h-[80px] pr-16 pb-6 resize-none border-gray-400"
                        disabled={!prChatUID}
                    />
                    <div className="absolute bottom-1 left-2 flex items-center">
                        <Globe className="h-3.5 w-3.5 text-gray-800"/>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className='flex items-center'>
                                        <Switch checked={useWeb} onCheckedChange={setUseWeb} className='scale-60'/>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>联网查询</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className='flex items-center'>
                                        <MultiSelect
                                            onChange={setSelectedKbList}
                                            selected={selectedKbList}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>知识库调用选择，可以同时选择多个。<br/>注意：若不选择，则默认会使用<b>全部</b>知识库进行回答</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                    </div>
                    <div className="absolute bottom-3 right-3 flex gap-1.2">
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
                        <div
                            className="absolute inset-0 border-2 border-dashed border-primary rounded-lg flex items-center justify-center bg-background/80">
                            <p className="text-primary">释放以上传文件</p>
                        </div>
                    )}
                </div>
            </div>
        </form>
    )
}

