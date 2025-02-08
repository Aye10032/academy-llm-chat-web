"use client"

import {useState, useRef, useEffect} from "react"
import {
    Bot,
    MessageSquare,
    Check,
    Undo,
    ChevronLeft,
    FolderOpen,
    File,
    Plus,
    ChevronRight,
    Copy,
} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {ChatInput} from "@/components/write/chat-input.tsx";
import {MaterialsManager} from "@/components/write/materials-manager.tsx";
import {FloatingActions} from "@/components/write/floating-actions.tsx";
import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {ChatHistory} from "@/components/write/chat-history-form.tsx";
import {FileTreeForm} from "@/components/write/file-tree-form.tsx";
import {projectStore} from "@/utils/self-state.tsx";
import {useApiQuery} from "@/hooks/useApi.ts";
import {Manuscript} from "@/utils/self_type.ts";

interface Material {
    id: string
    title: string
    timestamp: string
    summary: string
    source: string
    type: "pdf" | "web"
    isHidden: boolean
}


export function WritePage() {
    const selectManuscriptUID = projectStore((state) => state.selectManuscriptUID)

    const [currentFile, setCurrentFile] = useState<string>("")
    const [editorContent, setEditorContent] = useState<string>("")

    const [materials, setMaterials] = useState<Material[]>([
        {
            id: "1",
            title: "AI在企业中的应用",
            timestamp: "2023-05-15 14:30",
            summary: "本文探讨了人工智能在现代企业中的广泛应用，以及它如何提高效率和生产力。",
            source: "https://example.com/ai-in-business",
            type: "web",
            isHidden: false,
        },
        {
            id: "2",
            title: "人工智能的未来展望",
            timestamp: "2023-05-16 10:15",
            summary: "这份报告详细分析了人工智能技术的发展趋势，并预测了未来可能的突破。",
            source: "AI_Future_Report.pdf",
            type: "pdf",
            isHidden: false,
        },
        {
            id: "3",
            title: "AI伦理问题探讨",
            timestamp: "2023-05-17 09:45",
            summary: "本文讨论了人工智能发展中面临的各种伦理问题，包括隐私、就业和决策偏见等。",
            source: "https://example.com/ai-ethics",
            type: "web",
            isHidden: true,
        },
    ])
    const [messages] = useState([
        {
            role: "assistant",
            content: "你好！我是你的AI写作助手。请在右侧编辑区域输入你想要优化的文字，我会帮你改进它。",
        },
        {
            role: "user",
            content:
                "请帮我修改这段文字：\n\n在当今快速发展的世界中，人工智能技术的应用越来越广泛。很多公司都在使用AI来提高效率。这不仅让工作更简单，还能省很多时间。",
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
                    content:
                        "修改后的完整文段：\n\n在这个日新月异的时代，人工智能技术正在各个领域蓬勃发展。众多企业纷纷导入AI技术以提升运营效能。这不仅简化了工作流程，还显著提高了时间效益。",
                },
            ],
        },
    ])

    const {data: manuscript, isLoading} = useApiQuery<Manuscript>(
        ['manuscript', selectManuscriptUID],
        `/write/manuscript?uid=${selectManuscriptUID}`,
        {
            enabled: !!selectManuscriptUID,
            refetchOnWindowFocus: false,
            retry: false,
        }
    );

    useEffect(() => {
        if (!manuscript) {
            setCurrentFile("未命名文件")
            setEditorContent("")
        } else {
            setCurrentFile(manuscript.title)
            if (manuscript.content) {
                setEditorContent(manuscript.content)
            }
        }

    }, [manuscript]);

    const applyModification = (original: string, modified: string) => {
        setEditorContent((prev) => prev.replace(original, modified))
    }

    const undoModification = (original: string, modified: string) => {
        setEditorContent((prev) => prev.replace(modified, original))
    }

    const handleDeleteMaterial = (id: string) => {
        setMaterials((prevMaterials) => prevMaterials.filter((material) => material.id !== id))
    }

    const handleToggleMaterialVisibility = (id: string) => {
        setMaterials((prevMaterials) =>
            prevMaterials.map((material) => (material.id === id ? {...material, isHidden: !material.isHidden} : material)),
        )
    }

    const handlePreviewMaterial = (id: string) => {
        const material = materials.find((m) => m.id === id)
        if (material && material.type === "web") {
            window.open(material.source, "_blank")
        }
    }

    const chatRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<HTMLDivElement>(null)


    const handleSave = () => {
        // Handle save functionality
        console.log("Saving changes...")
    }

    const handleSendMessage = (message: string) => {
        // Handle sending message
        console.log("Sending message:", message)
    }

    const handleFileUpload = (files: File[]) => {
        // Handle file upload
        console.log("Uploading files:", files)
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <header className="sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b bg-background p-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
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
                </div>
                <MaterialsManager
                    materials={materials}
                    onDeleteMaterial={handleDeleteMaterial}
                    onToggleMaterialVisibility={handleToggleMaterialVisibility}
                    onPreviewMaterial={handlePreviewMaterial}
                />
            </header>

            <div className="flex-1 grid overflow-hidden" style={{gridTemplateColumns: "1fr 3fr"}}>
                {/* Chat Section */}
                <div className="flex flex-col border-r h-full overflow-hidden bg-muted/30">
                    <header className="h-14 border-b flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5"/>
                            <span className="font-medium">AI写作助手</span>
                        </div>
                        <div>
                            <Button variant="ghost" size="icon">
                                <Plus className="h-5 w-5"/>
                            </Button>
                            <ChatHistory/>
                        </div>
                    </header>

                    <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-6 flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
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
                                                            <AccordionTrigger className="text-sm">修改建议 {i + 1}</AccordionTrigger>
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
                                                                            <div className="bg-background rounded p-2 text-sm text-primary">
                                                                                {item.modified}
                                                                            </div>
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
                                                message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                                            }`}
                                        >
                                            <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <ChatInput onSendMessage={handleSendMessage} onFileUpload={handleFileUpload}/>
                </div>

                {/* Editor Section */}
                <div className="flex h-full overflow-hidden bg-background">
                    <FileTreeForm/>
                    <div className="flex-1 flex flex-col">
                        <header className="h-14 border-b flex items-center justify-between px-4">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5"/>
                                <span className="font-medium">写作编辑区 - {currentFile}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={async () => {
                                        await navigator.clipboard.writeText(editorContent)
                                        // Could add a toast notification here
                                    }}
                                >
                                    <Copy className="h-4 w-4"/>
                                </Button>
                            </div>
                        </header>

                        <div ref={editorRef} className="relative flex-1">
                            <textarea
                                value={editorContent}
                                onChange={(e) => setEditorContent(e.target.value)}
                                placeholder="在这里输入或粘贴你想要修改的文字..."
                                className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm"
                                style={{
                                    lineHeight: "1.5",
                                    tabSize: 2,
                                }}
                                disabled={!selectManuscriptUID || isLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <FloatingActions onSave={handleSave}/>
        </div>
    )
}

