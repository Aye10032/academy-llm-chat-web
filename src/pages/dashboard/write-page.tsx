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
import {ChatInput} from "@/components/write/chat-input.tsx"
import {MaterialsManager} from "@/components/write/materials-manager.tsx"
import {FloatingActions} from "@/components/write/floating-actions.tsx"
import {SidebarTrigger} from "@/components/ui/sidebar.tsx"
import {Separator} from "@/components/ui/separator.tsx"
import {ChatHistory} from "@/components/write/chat-history-form.tsx"
import {FileTreeForm} from "@/components/write/file-tree-form.tsx"
import Markdown from 'react-markdown'
// @ts-expect-error no need any more
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
// @ts-expect-error no need any more
import {darcula} from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import {llmConfig, projectStore} from "@/utils/self-state.tsx"
import {useApiMutation, useApiQuery, useSseQuery} from "@/hooks/useApi.ts"
import {Manuscript, Message, Modify} from "@/utils/self_type.tsx"
import {useNavigate} from "react-router-dom"
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx"
import {StatusCard} from "@/components/chat-status.tsx"
import {toast} from "sonner";


export function WritePage() {
    const selectedPrUID = projectStore((state) => state.selectedPrUID)
    const selectedPrTitle = projectStore((state) => state.selectedPrTitle)
    const prChatUID = projectStore((state) => state.prChatUID)
    const selectedManuscriptUID = projectStore((state) => state.selectedManuscriptUID)
    const navigate = useNavigate()

    const model = llmConfig((state) => state.model)
    const contextLength = llmConfig((state) => state.contextLength)
    const temperature = llmConfig((state) => state.temperature)

    const [input, setInput] = useState('')
    const [useWeb, setUseWeb] = useState<boolean>(false)
    const [selectedKbList, setSelectedKbList] = useState<string[]>([])
    const [files, setFiles] = useState<File[]>([])
    const [editorContent, setEditorContent] = useState<string>("")
    const [editorChanged, setEditorChanged] = useState<boolean>(false)
    const [isGenerate, setIsGenerate] = useState<boolean>(false)
    const [isDraft, setIsDraft] = useState<boolean>(false)

    const [status, setStatus] = useState<string[]>([])
    const [messages, setMessages] = useState<Message[]>([])

    // 保存草稿
    const saveMutation = useApiMutation<string, FormData>(
        `/write/projects/${selectedPrUID}/manuscripts/${selectedManuscriptUID}`,
        'PATCH'
    )

    // 读取草稿内容
    const {data: manuscript, isLoading} = useApiQuery<Manuscript>(
        ['get_manuscript', selectedManuscriptUID],
        `/write/projects/${selectedPrUID}/manuscripts/${selectedManuscriptUID}`,
        {
            enabled: !!selectedManuscriptUID && !!selectedPrUID,
        }
    )

    // 新建对话请求
    const newChatMutation = useApiMutation<string, void>(
        `/write/projects/${selectedPrUID}/chats`,
        'POST'
    )

    // 获取历史对话请求
    const {data: chatHistoryData} = useApiQuery<Message[]>(
        ['chatHistory', prChatUID],
        `/write/projects/${selectedPrUID}/chats/${prChatUID}/messages`,
        {
            enabled: !!prChatUID && !!selectedPrUID,
        }
    )

    // 对话 SSE mutation
    const chatMutation = useSseQuery<FormData>(
        `/write/projects/${selectedPrUID}/chats/${prChatUID}/messages`
    )

    useEffect(() => {
        if (!manuscript) {
            setEditorContent("")
        } else {
            if (manuscript.content) {
                setEditorContent(manuscript.content)
            } else {
                setEditorContent("")
            }
            setIsDraft(manuscript.is_draft)
        }
        setEditorChanged(false)
    }, [manuscript])

    const applyModification = (original: string, modified: string) => {
        setEditorContent((prev) => prev.replace(original, modified))
    }

    const undoModification = (original: string, modified: string) => {
        setEditorContent((prev) => prev.replace(modified, original))
    }

    const chatRef = useRef<HTMLDivElement>(null)


    const handleSave = async () => {
        setEditorChanged(false)

        const formData = new FormData()
        formData.append('content', editorContent)

        await saveMutation.mutateAsync(formData)
        toast.success("编辑保存完毕", {
            position: 'top-right'
        })
    }

    const handleNewChat = async () => {
        if (!selectedPrUID) return

        try {
            const newChatUid = await newChatMutation.mutateAsync()
            navigate(`/dashboard/write/${newChatUid}`)
        } catch (error) {
            console.error('Failed to create new chat:', error)
            // 如果需要，这里可以添加错误提示
        }
    }


    const clearState = () => {
        setInput('')
        setStatus([])
        setIsGenerate(true)
    }

    // 历史对话加载
    useEffect(() => {
        // 当 selectedHistoryId 为空时，直接返回
        if (!selectedPrUID || !prChatUID) {
            setMessages([])
            return
        }

        // 如果有新的历史数据，则设置
        if (chatHistoryData) {
            const formattedMessages = chatHistoryData.map((msg, index) => ({
                id: index.toString(),
                type: msg.type,
                content: msg.content
            }))
            setMessages(formattedMessages)
        }
    }, [selectedPrUID, chatHistoryData, prChatUID])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading || !selectedPrUID) return

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'human',
            content: input.trim()
        }

        clearState()

        try {
            // 设置消息
            setMessages(prev => [...prev, userMessage])

            const formData = new FormData()
            formData.append('message', input)
            formData.append('current_text', editorContent)
            formData.append('model', model)
            formData.append('context_length', contextLength[0].toString())
            formData.append('temperature', temperature[0].toString())
            formData.append('use_web', useWeb.toString())
            formData.append('available_kbs', JSON.stringify(selectedKbList))

            // 文件处理 - 只在有文件时才添加
            if (files.length > 0) {
                files.forEach(file => {
                    formData.append('files', file)
                })
            }

            const response = await chatMutation.mutateAsync(formData)
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            let aiMessageContent = ''
            let aiMessageCreated = false
            let isGettingAnswer = false
            let buffer = '' // 添加缓冲区处理不完整的消息

            const processSSEMessage = (message: string) => {
                const [eventLine, dataLine] = message.split('\n')
                const eventType = eventLine.replace('event: ', '')
                const data = JSON.parse(dataLine.replace('data: ', ''))

                if (eventType && data) {
                    switch (eventType) {
                        case 'status':
                            if (data === "chat_end") {
                                isGettingAnswer = false
                                aiMessageContent = ''
                            } else {
                                setStatus(prevState => [...prevState, data])
                            }
                            break
                        case 'docs': {
                            // 处理文本
                            break
                        }
                        case 'answer': {
                            if (!aiMessageCreated) {
                                setMessages(prev => [...prev, {
                                    id: (Date.now() + 1).toString(),
                                    type: 'ai',
                                    content: [{
                                        content: ''
                                    }]
                                }])
                                aiMessageCreated = true
                                isGettingAnswer = true
                            }

                            aiMessageContent += data
                            if (!isGettingAnswer) {
                                setMessages(prev => {
                                    const newMessages = [...prev]
                                    const lastMessage = newMessages[newMessages.length - 1]
                                    if (lastMessage.type === 'ai' && Array.isArray(lastMessage.content)) {
                                        const newContent = lastMessage.content
                                        lastMessage.content = [...newContent, {content: aiMessageContent}]
                                    }
                                    return newMessages
                                })
                                isGettingAnswer = true
                            } else {
                                setMessages(prev => {
                                    const newMessages = [...prev]
                                    const lastMessage = newMessages[newMessages.length - 1]
                                    if (Array.isArray(lastMessage.content)) {
                                        const lastContent = lastMessage.content[lastMessage.content.length - 1]
                                        if (lastContent && "content" in lastContent) {
                                            lastContent.content = aiMessageContent
                                        }
                                    }
                                    return newMessages
                                })
                            }
                            break
                        }
                        case 'modify': {
                            const modifies = data.modifies.map((modify: Modify) => ({
                                original: modify.original,
                                modified: modify.modified,
                                explanation: modify.explanation
                            }))

                            if (!aiMessageCreated) {
                                setMessages(prev => [...prev, {
                                    id: (Date.now() + 1).toString(),
                                    type: 'ai',
                                    content: modifies
                                }])
                                aiMessageCreated = true
                            } else {
                                setMessages(prev => {
                                    const newMessages = [...prev]
                                    const lastMessage = newMessages[newMessages.length - 1]
                                    if (lastMessage.type === 'ai' && Array.isArray(lastMessage.content)) {
                                        lastMessage.content = [...lastMessage.content, ...modifies]
                                    }
                                    return newMessages
                                })
                            }

                            break
                        }
                        case 'write': {
                            setEditorContent(prevState => `${prevState}${data}`)
                        }
                    }
                }
            }

            while (reader) {
                const {done, value} = await reader.read()
                if (done) {
                    if (buffer.trim()) {
                        processSSEMessage(buffer)
                    }
                    setIsGenerate(false)
                    break
                }

                const chunk = decoder.decode(value)
                buffer += chunk

                // 查找完整的消息
                const messages = buffer.split('\n\n')
                // 保留最后一个可能不完整的消息
                buffer = messages.pop() || ''

                // 处理完整的消息
                for (const message of messages) {
                    if (message.trim()) {
                        processSSEMessage(message)
                        // 使用 requestAnimationFrame 控制渲染频率
                        await new Promise(resolve => requestAnimationFrame(resolve))
                    }
                }
            }

        } catch (error) {
            console.error('Error in chat:', error)
            setStatus(prevState => [...prevState, '发生错误，请重试'])
            // 如果是新建的对话失败了，清空消息
            if (!prChatUID) {
                setMessages([])
            }
        } finally {
            setIsGenerate(false)
        }
    }

    // 自动滚动到底部
    const scrollToBottom = () => {
        if (chatRef.current) {
            const scrollContainer = chatRef.current
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
            })
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, status])

    return (
        <div className="flex flex-col h-screen bg-white">
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
                            {(selectedPrUID) && (
                                <>
                                    <BreadcrumbSeparator/>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{selectedPrTitle}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </>
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <MaterialsManager/>
            </header>

            <div className="flex-1 grid overflow-hidden" style={{gridTemplateColumns: "1.5fr 3fr"}}>
                {/* Chat Section */}
                <div className="flex flex-col border-r h-full overflow-hidden">
                    <header className="h-14 border-b flex items-center justify-between px-4 bg-muted/60">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5"/>
                            <span className="font-medium">AI写作助手</span>
                        </div>
                        <div>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={!selectedPrUID || (messages.length <= 1 && !!prChatUID)}
                                onClick={handleNewChat}
                            >
                                <Plus className="h-5 w-5"/>
                            </Button>
                            <ChatHistory/>
                        </div>
                    </header>

                    <div
                        ref={chatRef}
                        className="flex-1 overflow-y-auto
                            [&::-webkit-scrollbar]:w-2
                            [&::-webkit-scrollbar-track]:bg-transparent
                            [&::-webkit-scrollbar-thumb]:bg-gray-200
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                            transition-all duration-300 p-4 space-y-4"
                    >
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-6 flex ${message.type === "human" ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.type === 'ai' && (
                                    <Avatar>
                                        <AvatarFallback>AI</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className="max-w-[90%]">
                                    {Array.isArray(message.content) ? (
                                        message.content.map((item, i) => {
                                            if ("modified" in item) {
                                                return (
                                                    <Accordion
                                                        type="single"
                                                        collapsible
                                                        className="w-full"
                                                        key={i}
                                                    >
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
                                            } else if ('content' in item) {
                                                return (
                                                    <Markdown
                                                        key={i}
                                                        className="prose rounded-lg bg-white text-black rounded-tl-none dark:prose-invert p-3"
                                                    >
                                                        {item.content}
                                                    </Markdown>
                                                )
                                            }
                                        })
                                    ) : (
                                        <Markdown
                                            className={`prose rounded-lg dark:prose-invert p-3 ${
                                                message.type === 'human'
                                                    ? 'bg-blue-500 text-white rounded-tr-none mr-1.5'
                                                    : 'bg-white text-black rounded-tl-none'
                                            }`}
                                            components={{
                                                code(props) {
                                                    const {children, className, ...rest} = props
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return match ? (
                                                        <SyntaxHighlighter
                                                            {...rest}
                                                            PreTag="div"
                                                            children={String(children).replace(/\n$/, '')}
                                                            language={match[1]}
                                                            style={darcula}
                                                        />
                                                    ) : (
                                                        <code {...rest} className={className}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                            remarkPlugins={[remarkGfm, remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                        >
                                            {message.content}
                                        </Markdown>
                                    )}
                                </div>
                                {message.type === 'human' && (
                                    <Avatar>
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {/* 显示状态信息 */}
                        {(status.length > 0) && (
                            <StatusCard isProcessing={isGenerate} items={status}/>
                        )}


                    </div>

                    <ChatInput
                        handleSubmit={handleSubmit}
                        input={input}
                        setInput={setInput}
                        files={files}
                        setFiles={setFiles}
                        useWeb={useWeb}
                        setUseWeb={setUseWeb}
                        selectedKbList={selectedKbList}
                        setSelectedKbList={setSelectedKbList}
                    />
                </div>

                {/* Editor Section */}
                <div className="flex h-full overflow-hidden">
                    <FileTreeForm/>
                    <div className="flex-1 flex flex-col">
                        <header className="shrink-0 h-14 border-b flex items-center justify-between px-4 bg-muted/60">
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
                                    }}
                                >
                                    <Copy className="h-4 w-4"/>
                                </Button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-hidden">
                            {(!isDraft) ? (
                                <textarea
                                    value={editorContent}
                                    onChange={(e) => {
                                        setEditorContent(e.target.value)
                                        setEditorChanged(true)
                                    }}
                                    placeholder="在这里输入或粘贴你想要修改的文字..."
                                    className="w-full h-full p-4 resize-none focus:outline-none font-light overflow-y-auto
                                    [&::-webkit-scrollbar]:w-2
                                    [&::-webkit-scrollbar-track]:bg-transparent
                                    [&::-webkit-scrollbar-thumb]:bg-gray-200
                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                                    transition-all duration-300"
                                    style={{
                                        lineHeight: "2",
                                        tabSize: 4,
                                    }}
                                    disabled={!selectedManuscriptUID || isLoading || isGenerate}
                                />
                            ) : (
                                <div className="h-full overflow-y-auto
                                    [&::-webkit-scrollbar]:w-2
                                    [&::-webkit-scrollbar-track]:bg-transparent
                                    [&::-webkit-scrollbar-thumb]:bg-gray-200
                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                                    transition-all duration-300">
                                    <Markdown
                                        className="prose p-4 leading-8 max-w-[97%]"
                                        components={{
                                            code(props) {
                                                const {children, className, ...rest} = props
                                                const match = /language-(\w+)/.exec(className || '')
                                                return match ? (
                                                    <SyntaxHighlighter
                                                        {...rest}
                                                        PreTag="div"
                                                        children={String(children).replace(/\n$/, '')}
                                                        language={match[1]}
                                                        style={darcula}
                                                    />
                                                ) : (
                                                    <code {...rest} className={className}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                                    >
                                        {editorContent}
                                    </Markdown>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <FloatingActions onSave={handleSave} disabled={!selectedManuscriptUID || isLoading || isGenerate || !editorChanged}/>
        </div>
    )
}

