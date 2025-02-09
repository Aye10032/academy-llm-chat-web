"use client"

import React, {useState, useRef, useEffect} from "react"
import {
    Bot,
    MessageSquare,
    Check,
    Undo,
    Plus,
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
import {useApiMutation, useApiQuery, useSseQuery} from "@/hooks/useApi.ts";
import {Manuscript, Message, Modify} from "@/utils/self_type.ts";
import {useNavigate} from "react-router-dom";
import {toast} from "@/hooks/use-toast.ts";


export function WritePage() {
    const selectProjectUID = projectStore((state) => state.selectProjectUID)
    const selectProjectTitle = projectStore((state) => state.selectProjectTitle)
    const selectedChatUID = projectStore((state) => state.selectedChatUID)
    const setSelectedChatUID = projectStore((state) => state.setSelectedChatUID)
    const selectManuscriptUID = projectStore((state) => state.selectManuscriptUID)
    const navigate = useNavigate();

    // const [currentFile, setCurrentFile] = useState<string>("")
    const [input, setInput] = useState('')
    const [files, setFiles] = useState<File[]>([])
    const [editorContent, setEditorContent] = useState<string>("")
    const [editorChanged, setEditorChanged] = useState<boolean>(false)
    const [isGenerate, setIsGenerate] = useState<boolean>(false)

    const [status, setStatus] = useState<string>('')
    const [messages, setMessages] = useState<Message[]>([])

    const saveMutation = useApiMutation<string, void>(
        `/write/save_manuscript?uid=${selectManuscriptUID}&content=${editorContent}`,
        'POST'
    )

    const {data: manuscript, isLoading} = useApiQuery<Manuscript>(
        ['get_manuscript', selectManuscriptUID],
        `/write/manuscript?uid=${selectManuscriptUID}`,
        {
            enabled: !!selectManuscriptUID,
        }
    );

    // 新建对话请求
    const newChatMutation = useApiMutation<string, void>(
        `/write/new_chat?project_uid=${selectProjectUID}`,
        'PATCH'
    )

    // 对话 SSE mutation
    const chatMutation = useSseQuery<FormData>('/write/chat')

    useEffect(() => {
        if (!manuscript) {
            setEditorContent("")
        } else {
            if (manuscript.content) {
                setEditorContent(manuscript.content)
            }
        }
        setEditorChanged(false)
    }, [manuscript]);

    const applyModification = (original: string, modified: string) => {
        setEditorContent((prev) => prev.replace(original, modified))
    }

    const undoModification = (original: string, modified: string) => {
        setEditorContent((prev) => prev.replace(modified, original))
    }

    const chatRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<HTMLDivElement>(null)


    const handleSave = () => {
        saveMutation.mutate()
        toast({
            description: "编辑保存完毕"
        })
    }

    const handleNewChat = () => {
        setSelectedChatUID('');
        navigate(`/dashboard/write`);
    }


    const clearState = () => {
        setInput('');
        setStatus('');
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading || !selectProjectUID) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'human',
            content: input.trim()
        };

        clearState()

        try {
            let newChatUID = selectedChatUID

            // 如果没有选中的对话，先创建新对话
            if (!selectedChatUID) {
                try {
                    newChatUID = await newChatMutation.mutateAsync();
                    setSelectedChatUID(newChatUID)
                } catch (error) {
                    console.error('Failed to create new chat:', error);
                    setStatus('创建新对话失败');
                    return;
                }
            }

            // 设置消息
            setMessages(prev => [...prev, userMessage]);

            const formData = new FormData()
            formData.append('project_uid', selectProjectUID)
            formData.append('chat_uid', selectedChatUID)
            formData.append('message', input)
            formData.append('current_text', editorContent)

            // 文件处理 - 只在有文件时才添加
            if (files.length > 0) {
                files.forEach(file => {
                    formData.append('files', file)
                })
            }

            const response = await chatMutation.mutateAsync(formData)
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            let aiMessageContent = '';
            let aiMessageCreated = false;
            let isGettingAnswer = false
            let buffer = ''; // 添加缓冲区处理不完整的消息

            const processSSEMessage = (message: string) => {
                const [eventLine, dataLine] = message.split('\n')
                const eventType = eventLine.replace('event: ', '')
                const data = JSON.parse(dataLine.replace('data: ', ''))

                if (eventType && data) {
                    switch (eventType) {
                        case 'status':
                            if (data === "chat end") {
                                isGettingAnswer = false
                                aiMessageContent = ''
                            } else {
                                setStatus(data);
                            }
                            break;
                        case 'docs': {
                            // 处理文本
                            break;
                        }
                        case 'answer': {
                            if (!aiMessageCreated) {
                                setMessages(prev => [...prev, {
                                    id: (Date.now() + 1).toString(),
                                    type: 'ai',
                                    content: [{
                                        content: ''
                                    }]
                                }]);
                                aiMessageCreated = true;
                                isGettingAnswer = true
                            }

                            aiMessageContent += data;
                            if (!isGettingAnswer) {
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage.type === 'ai' && Array.isArray(lastMessage.content)) {
                                        const newContent = lastMessage.content
                                        lastMessage.content = [...newContent, {content: aiMessageContent}]
                                    }
                                    return newMessages;
                                });
                                isGettingAnswer = true;
                            } else {
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (Array.isArray(lastMessage.content)) {
                                        const lastContent = lastMessage.content[lastMessage.content.length - 1];
                                        if (lastContent && "content" in lastContent) {
                                            lastContent.content = aiMessageContent
                                        }
                                    }
                                    return newMessages;
                                });
                            }
                            break;
                        }
                        case 'modify': {
                            const modifies = data.modifies.map((modify: Modify) => ({
                                original: modify.original,
                                modified: modify.modified,
                                explanation: modify.explanation
                            }));

                            if (!aiMessageCreated) {
                                setMessages(prev => [...prev, {
                                    id: (Date.now() + 1).toString(),
                                    type: 'ai',
                                    content: modifies
                                }]);
                                aiMessageCreated = true;
                            } else {
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage.type === 'ai' && Array.isArray(lastMessage.content)) {
                                        lastMessage.content = [...lastMessage.content, ...modifies];
                                    }
                                    return newMessages;
                                });
                            }

                            break;
                        }
                    }
                }
            };

            while (reader) {
                const {done, value} = await reader.read();
                if (done) {
                    if (buffer.trim()) {
                        processSSEMessage(buffer);
                    }
                    setIsGenerate(false);
                    setStatus('');
                    break;
                }

                const chunk = decoder.decode(value);
                buffer += chunk;

                // 查找完整的消息
                const messages = buffer.split('\n\n');
                // 保留最后一个可能不完整的消息
                buffer = messages.pop() || '';

                // 处理完整的消息
                for (const message of messages) {
                    if (message.trim()) {
                        processSSEMessage(message);
                        // 使用 requestAnimationFrame 控制渲染频率
                        await new Promise(resolve => requestAnimationFrame(resolve));
                    }
                }
            }

        } catch (error) {
            console.error('Error in chat:', error)
            setStatus('发生错误，请重试');
            // 如果是新建的对话失败了，清空消息
            if (!selectedChatUID) {
                setMessages([]);
            }
        } finally {
            setIsGenerate(false);
        }
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
                                <BreadcrumbLink>主页</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbPage>写作助手</BreadcrumbPage>
                            </BreadcrumbItem>
                            {(selectProjectUID) && (
                                <>
                                    <BreadcrumbSeparator/>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{selectProjectTitle}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </>
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <MaterialsManager/>
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
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={!selectProjectUID}
                                onClick={handleNewChat}
                            >
                                <Plus className="h-5 w-5"/>
                            </Button>
                            <ChatHistory/>
                        </div>
                    </header>

                    <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-6 flex ${message.type === "ai" ? "justify-start" : "justify-end"}`}
                            >
                                <div className={`max-w-[90%] space-y-4`}>
                                    {Array.isArray(message.content) ? (
                                        message.content.map((item, i) => {
                                            if ('content' in item) {
                                                return (
                                                    <div key={i} className="bg-muted rounded-lg px-4 py-2">
                                                        <pre className="whitespace-pre-wrap font-sans">{item.content}</pre>
                                                    </div>
                                                )
                                            }
                                            if ("modified" in item) {
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
                                                message.type === "ai" ? "bg-muted" : "bg-primary text-primary-foreground"
                                            }`}
                                        >
                                            <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {/* 显示状态信息 */}
                        {(status) && (
                            <div className="flex justify-center">
                                            <span
                                                className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700"
                                            >
                                                {status}
                                            </span>
                            </div>
                        )}
                    </div>

                    <ChatInput
                        handleSubmit={handleSubmit}
                        input={input}
                        setInput={setInput}
                        files={files}
                        setFiles={setFiles}
                    />
                </div>

                {/* Editor Section */}
                <div className="flex h-full overflow-hidden bg-background">
                    <FileTreeForm/>
                    <div className="flex-1 flex flex-col">
                        <header className="h-14 border-b flex items-center justify-between px-4">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5"/>
                                <span className="font-medium">写作编辑区 - {manuscript ? manuscript.title : "未选择文件"}</span>
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
                                onChange={(e) => {
                                    setEditorContent(e.target.value)
                                    setEditorChanged(true)
                                }}
                                placeholder="在这里输入或粘贴你想要修改的文字..."
                                className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm"
                                style={{
                                    lineHeight: "1.5",
                                    tabSize: 2,
                                }}
                                disabled={!selectManuscriptUID || isLoading || isGenerate}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <FloatingActions onSave={handleSave} disabled={!selectManuscriptUID || isLoading || isGenerate || !editorChanged}/>
        </div>
    )
}

