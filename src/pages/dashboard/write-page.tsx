import React, {useState, useRef, DragEvent} from "react"
import {
    Bot,
    ChevronDown,
    MessageSquare,
    Send,
    Check,
    Undo,
    ChevronLeft,
    FolderOpen,
    File,
    Paperclip,
    Plus,
    Folder,
    ChevronRight
} from 'lucide-react'
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"
import {Card, CardContent} from "@/components/ui/card"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible"
import {Input} from "@/components/ui/input"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {FloatingActions} from "@/components/write/floating-actions"
import {CodeEditor} from "@/components/write/code-editor"

interface FileStructure {
    id: string
    name: string
    type: 'file' | 'folder'
    children?: FileStructure[]
}

export function WritePage() {
    const [editorContent, setEditorContent] = useState<string>("在当今快速发展的世界中，人工智能技术的应用越来越广泛。很多公司都在使用AI来提高效率。这不仅让工作更简单，还能省很多时间。")
    const [messages] = useState([
        {
            role: "assistant",
            content: "你好！我是你的AI写作助手。请在右侧编辑区域输入你想要优化的文字，我会帮你改进它。",
        },
        {
            role: "user",
            content: "请帮我修改这段文字：\n\n在当今快速发展的世界中，人工智能技术的应用越来越广泛。很多公司都在使用AI来提高效率。这不仅让工作更简单，还能省很多时间。",
        },
        {
            role: "assistant",
            content: [
                {
                    type: "text",
                    content: "我已经分析了你的文字，下面是修改建议：",
                },
                {
                    type: "modification",
                    original: "在当今快速发展的世界中，人工智能技术的应用越来越广泛。",
                    modified: "在这个日新月异的时代，人工智能技术正在各个领域蓬勃发展。",
                    explanation: "使用更生动的描述，突出发展的迅速性和广泛性。",
                },
                {
                    type: "modification",
                    original: "很多公司都在使用AI来提高效率。",
                    modified: "众多企业纷纷导入AI技术以提升运营效能。",
                    explanation: "使用更专业的措辞，强调企业的主动性。",
                },
                {
                    type: "modification",
                    original: "这不仅让工作更简单，还能省很多时间。",
                    modified: "这不仅简化了工作流程，还显著提高了时间效益。",
                    explanation: "更准确地描述AI带来的具体好处。",
                },
                {
                    type: "text",
                    content: "修改后的完整文段：\n\n在这个日新月异的时代，人工智能技术正在各个领域蓬勃发展。众多企业纷纷导入AI技术以提升运营效能。这不仅简化了工作流程，还显著提高了时间效益。",
                }
            ],
        },
    ])

    const [fileStructure, setFileStructure] = useState<FileStructure[]>([
        {
            id: '1',
            name: '项目文件夹',
            type: 'folder',
            children: [
                {id: '2', name: '主文档.txt', type: 'file'},
                {id: '3', name: '参考资料.txt', type: 'file'},
                {
                    id: '4',
                    name: '草稿',
                    type: 'folder',
                    children: [
                        {id: '5', name: '草稿1.txt', type: 'file'},
                        {id: '6', name: '草稿2.txt', type: 'file'},
                    ]
                }
            ]
        }
    ])

    const [currentFile, setCurrentFile] = useState<string>('主文档.txt')
    const [newItemName, setNewItemName] = useState<string>('')
    const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState<boolean>(false)
    const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState<boolean>(false)

    const applyModification = (original: string, modified: string) => {
        setEditorContent(prev => prev.replace(original, modified))
    }

    const undoModification = (original: string, modified: string) => {
        setEditorContent(prev => prev.replace(modified, original))
    }

    const chatRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        handleFiles(files)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : []
        handleFiles(files)
    }

    const handleFiles = (files: File[]) => {
        // Handle the files here
        console.log('Files received:', files)
        // You can process the files or upload them as needed
    }

    const createNewItem = (type: 'file' | 'folder') => {
        if (newItemName) {
            const newItem: FileStructure = {
                id: Date.now().toString(),
                name: newItemName + (type === 'file' ? '.txt' : ''),
                type: type,
                children: type === 'folder' ? [] : undefined
            }
            setFileStructure(prev => [...prev, newItem])
            setNewItemName('')
            type === 'file' ? setIsNewFileDialogOpen(false) : setIsNewFolderDialogOpen(false)
        }
    }

    const renderFileTree = (items: FileStructure[]) => {
        return items.map((item) => (
            <div key={item.id} className="ml-4">
                {item.type === 'folder' ? (
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-1 hover:bg-muted/50 w-full p-1 rounded transition-colors">
                            <ChevronRight className="h-4 w-4 transition-transform duration-200"/>
                            <FolderOpen className="h-4 w-4"/>
                            <span>{item.name}</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            {item.children && renderFileTree(item.children)}
                        </CollapsibleContent>
                    </Collapsible>
                ) : (
                    <button
                        className={`flex items-center gap-1 hover:bg-muted/50 w-full p-1 rounded transition-colors ${currentFile === item.name ? 'bg-muted text-primary' : ''}`}
                        onClick={() => setCurrentFile(item.name)}
                    >
                        <File className="h-4 w-4"/>
                        <span>{item.name}</span>
                    </button>
                )}
            </div>
        ))
    }

    const handleSave = () => {
        // Handle save functionality
        console.log('Saving changes...')
    }

    return (
        <div className="flex flex-col h-screen">
            <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#">主页</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>写作助手</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            <div className="flex-1 grid" style={{gridTemplateColumns: '1fr 3fr'}}>
                {/* Chat Section */}
                <div className="flex flex-col border-r h-full overflow-hidden bg-muted/30">
                    <header className="h-14 border-b flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5"/>
                            <span className="font-medium">AI写作助手</span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    写作模式
                                    <ChevronDown className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>学术论文</DropdownMenuItem>
                                <DropdownMenuItem>商务文案</DropdownMenuItem>
                                <DropdownMenuItem>创意写作</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </header>

                    <div ref={chatRef} className="flex-1 overflow-y-auto p-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-6 flex ${
                                    message.role === "assistant" ? "justify-start" : "justify-end"
                                }`}
                            >
                                <div className={`max-w-[90%] space-y-4`}>
                                    {Array.isArray(message.content) ? (
                                        message.content.map((item, i) => {
                                            if (item.type === "text") {
                                                return (
                                                    <div key={i} className="bg-muted rounded-lg px-4 py-2">
                                                        <pre className="whitespace-pre-wrap font-sans">{item.content}</pre>
                                                    </div>
                                                )
                                            }
                                            if (item.type === "modification") {
                                                return (
                                                    <Accordion type="single" collapsible className="w-full" key={i}>
                                                        <AccordionItem value={`item-${i}`}>
                                                            <AccordionTrigger className="text-sm">
                                                                修改建议 {i + 1}
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <Card className="bg-muted/50">
                                                                    <CardContent className="p-4 space-y-2">
                                                                        <div className="space-y-1">
                                                                            <div className="text-sm text-muted-foreground">原文：</div>
                                                                            <div
                                                                                className="bg-background rounded p-2 text-sm">{item.original}</div>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <div className="text-sm text-muted-foreground">修改建议：</div>
                                                                            <div
                                                                                className="bg-background rounded p-2 text-sm text-primary">{item.modified}</div>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <div className="text-sm text-muted-foreground">说明：</div>
                                                                            <div
                                                                                className="bg-background rounded p-2 text-xs">{item.explanation}</div>
                                                                        </div>
                                                                        <div className="flex gap-2 mt-2">
                                                                            <Button
                                                                                className="flex-1"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => applyModification(item.original, item.modified)}
                                                                            >
                                                                                <Check className="w-4 h-4 mr-2"/>
                                                                                应用
                                                                            </Button>
                                                                            <Button
                                                                                className="flex-1"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => undoModification(item.original, item.modified)}
                                                                            >
                                                                                <Undo className="w-4 h-4 mr-2"/>
                                                                                撤销
                                                                            </Button>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                )
                                            }
                                        })
                                    ) : (
                                        <div
                                            className={`rounded-lg px-4 py-2 ${
                                                message.role === "assistant"
                                                    ? "bg-muted"
                                                    : "bg-primary text-primary-foreground"
                                            }`}
                                        >
                                            <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t p-4">
                        <div
                            className={`relative ${isDragging ? 'bg-muted/50' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
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
                                placeholder="输入消息或拖拽文件到此处..."
                                className="min-h-[80px] pr-24 resize-none"
                            />
                            <div className="absolute bottom-3 right-3 flex gap-2">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip className="h-4 w-4"/>
                                </Button>
                                <Button size="icon">
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

                {/* Editor Section */}
                <div className="flex h-full overflow-hidden bg-background">
                    <Collapsible className="relative">
                        <CollapsibleTrigger
                            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-md transition-transform hover:bg-muted focus:outline-none focus:ring-2 focus:ring-muted focus:ring-offset-2 data-[state=open]:rotate-180">
                            <ChevronLeft className="h-4 w-4"/>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="w-64 border-r h-full flex flex-col bg-muted/10">
                                <header className="h-14 border-b flex items-center justify-between px-4">
                                    <span className="font-medium">文件列表</span>
                                    <div className="flex gap-2">
                                        <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <Folder className="h-4 w-4"/>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>新建文件夹</DialogTitle>
                                                </DialogHeader>
                                                <Input
                                                    value={newItemName}
                                                    onChange={(e) => setNewItemName(e.target.value)}
                                                    placeholder="输入文件夹名称"
                                                />
                                                <Button onClick={() => createNewItem('folder')}>创建</Button>
                                            </DialogContent>
                                        </Dialog>
                                        <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <Plus className="h-4 w-4"/>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>新建文件</DialogTitle>
                                                </DialogHeader>
                                                <Input
                                                    value={newItemName}
                                                    onChange={(e) => setNewItemName(e.target.value)}
                                                    placeholder="输入文件名称"
                                                />
                                                <Button onClick={() => createNewItem('file')}>创建</Button>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </header>
                                <div className="flex-1 overflow-auto p-2">
                                    {renderFileTree(fileStructure)}
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                    <div className="flex-1 flex flex-col">
                        <header className="h-14 border-b flex items-center px-4">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5"/>
                                <span className="font-medium">写作编辑区 - {currentFile}</span>
                            </div>
                        </header>

                        <div ref={editorRef} className="flex-1 p-4 overflow-auto">
                            <CodeEditor
                                value={editorContent}
                                onChange={setEditorContent}
                                placeholder="在这里输入或粘贴你想要修改的文字..."
                                className="min-h-full w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <FloatingActions onSave={handleSave}/>
        </div>
    )
}

