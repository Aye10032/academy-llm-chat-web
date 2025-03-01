import {SimpleStatus} from "@/components/chat-status.tsx";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Markdown from 'react-markdown';
// @ts-expect-error no need any more
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
// @ts-expect-error no need any more
import {darcula} from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import React, {useState, useRef, useEffect, useCallback} from "react";
import {kbStore, llmConfig} from "@/utils/self-state.tsx";
import {useApiQuery, useSseQuery} from "@/hooks/useApi.ts";
import {KnowledgeBase, Message, Document, UserProfile} from "@/utils/self_type.tsx";
import {ChevronDownIcon, Mic} from "lucide-react";
import {DocumentSidebar} from "@/components/chat/document-sidebar.tsx";
import {useNavigate} from "react-router-dom";

interface ChatPageProps {
    user: UserProfile;
}

export function ChatPage({user}: ChatPageProps) {
    const selectedKbUID = kbStore((state) => state.selectedKbUID)
    const selectedKbTitle = kbStore((state) => state.selectedKbTitle)
    const kbChatUID = kbStore((state) => state.kbChatUID)
    const setSelectedKbUID = kbStore((state) => state.setSelectedKbUID)
    const setSelectedKnowledgeBase = kbStore((state) => state.setSelectedKnowledgeBase)
    const setCanCreateChat = kbStore((state) => state.setCanCreateChat)

    const model = llmConfig((state)=>state.model)
    const contextLength = llmConfig((state)=>state.contextLength)
    const temperature = llmConfig((state) => state.temperature)

    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const chatContainerRef = useRef<HTMLDivElement>(null)

    const [status, setStatus] = useState<string>('')
    const [documents, setDocuments] = useState<Document[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const navigate = useNavigate()


    // 获取知识库列表请求
    const {data: knowledgeBases, isLoading: knowledgeBasesLoading} = useApiQuery<KnowledgeBase[]>(
        ['knowledgeBases'],
        '/rag/knowledge_bases'
    )

    // 获取历史对话请求
    const {data: chatHistoryData} = useApiQuery<Message[]>(
        ['chatHistory', kbChatUID],
        `/rag/knowledge_bases/${selectedKbUID}/chats/${kbChatUID}/messages`,
        {
            enabled: !!kbChatUID && !!selectedKbUID,
        }
    )

    // 对话 SSE mutation
    const chatMutation = useSseQuery<FormData>(
        `/rag/knowledge_bases/${selectedKbUID}/chats/${kbChatUID}/messages`
    )

    // 选择知识库事件处理
    const handleKnowledgeBaseSelect = (kb: KnowledgeBase) => {
        if (kb.uid == selectedKbUID) return;

        clearState();
        setMessages([])
        setSelectedKnowledgeBase(kb);
        setIsLoading(false);
        navigate('/dashboard/chat/')
    };

    const clearState = () => {
        setIsLoading(true);
        setInput('');
        setStatus('');
        setDocuments([]);
        setIsGenerating(false);
        setIsSidebarOpen(false);
    }

    // 初始化知识库
    useEffect(() => {
        if (selectedKbUID || knowledgeBasesLoading || !user.last_knowledge_base) return

        if (!knowledgeBases) {
            setSelectedKbUID('')
        } else {
            const lastKb = knowledgeBases.find(kb => kb.uid === user.last_knowledge_base)
            if (lastKb) {
                setSelectedKnowledgeBase(lastKb)
                console.log('init kb')
            }
        }
    }, [knowledgeBasesLoading, knowledgeBases, user.last_knowledge_base, setSelectedKbUID, selectedKbUID, setSelectedKnowledgeBase])

    useEffect(() => {
        setDocuments([])
    }, [kbChatUID]);

    // 历史对话加载
    useEffect(() => {
        // 当 selectedChatUID 为空时，直接返回
        if (!kbChatUID) {
            setMessages([]);
            return;
        }

        // 如果有新的历史数据，则设置
        if (chatHistoryData) {
            const formattedMessages = chatHistoryData.map((msg, index) => ({
                id: index.toString(),
                type: msg.type,
                content: msg.content
            }));
            setMessages(formattedMessages);
        }
    }, [kbChatUID, chatHistoryData]);

    //处理新建对话可用性
    useEffect(() => {
        if ((messages.length > 0 || !kbChatUID) && selectedKbUID) {
            setCanCreateChat(true)
        } else {
            setCanCreateChat(false)
        }
    }, [messages, setCanCreateChat, selectedKbUID, kbChatUID]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    // 对话提交事件处理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !selectedKbUID || !kbChatUID) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'human',
            content: input.trim()
        };

        clearState();

        try {
            // 设置消息
            setMessages(prev => [...prev, userMessage]);

            const formData = new FormData()
            formData.append('message', input)
            formData.append('model', model)
            formData.append('context_length', contextLength[0].toString())
            formData.append('temperature', temperature[0].toString())

            // 发送聊天请求
            const response = await chatMutation.mutateAsync(formData);

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            let aiMessageContent = '';
            let aiMessageCreated = false;
            let buffer = ''; // 添加缓冲区处理不完整的消息

            const processSSEMessage = (message: string) => {
                const lines = message.split('\n');
                let event = '';
                let data = '';

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        event = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        data = line.slice(5).trim();
                    }
                }

                if (event && data) {
                    try {
                        const parsedData = JSON.parse(data);
                        switch (event) {
                            case 'status':
                                setStatus(parsedData);
                                if (parsedData === '正在生成回答...') {
                                    setIsGenerating(true);
                                }
                                break;
                            case 'docs': {
                                const processedDocs = parsedData.map((doc: Document) => ({
                                    ...doc,
                                    metadata: {
                                        ...doc.metadata,
                                        isReferenced: false // 初始化引用状态
                                    }
                                }));
                                setDocuments(processedDocs);
                                break;
                            }
                            case 'answer':
                                if (!aiMessageCreated) {
                                    setMessages(prev => [...prev, {
                                        id: (Date.now() + 1).toString(),
                                        type: 'ai',
                                        content: ''
                                    }]);
                                    aiMessageCreated = true;
                                }

                                aiMessageContent += parsedData;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage.type === 'ai') {
                                        lastMessage.content = aiMessageContent;
                                    }
                                    return newMessages;
                                });
                                break;
                        }
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            };

            while (true) {
                const {done, value} = await reader.read();
                if (done) {
                    if (buffer.trim()) {
                        processSSEMessage(buffer);
                    }
                    setDocuments(prevDocs =>
                        prevDocs.map((doc, index) => ({
                            ...doc,
                            metadata: {
                                ...doc.metadata,
                                isReferenced: aiMessageContent.includes(`[^${index + 1}]`)
                            }
                        }))
                    );
                    setIsGenerating(false);
                    setStatus('');
                    break;
                }

                const chunk = new TextDecoder().decode(value);
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
            console.error('Error:', error);
            setStatus('发生错误，请重试');
            // 如果是新建的对话失败了，清空消息
            if (!kbChatUID) {
                setMessages([]);
            }
        } finally {
            setIsLoading(false);
            setIsGenerating(false);
        }
    };


    // 生成回答后自动打开侧边栏
    useEffect(() => {
        if (documents.length > 0 && !isGenerating && !isLoading) {
            setIsSidebarOpen(true)
        }
    }, [documents, isGenerating, isLoading]);

    const handleSidebarToogle = useCallback(() => {
        setIsSidebarOpen(prevState => !prevState)
    }, [])

    // 自动滚动到底部
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            const scrollContainer = chatContainerRef.current;
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, status]);

    return (
        <div className="flex flex-col h-screen bg-white">
            <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
                <SidebarTrigger className="-ml-1"/>
                <Separator orientation="vertical" className="mr-2 h-4"/>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">主页</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>知识库对话</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1">
                                    {selectedKbUID ? selectedKbTitle : '选择知识库'}
                                    <ChevronDownIcon/>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {knowledgeBasesLoading ? (
                                        <DropdownMenuItem disabled>加载中...</DropdownMenuItem>
                                    ) : knowledgeBases?.map((kb) => (
                                        <DropdownMenuItem
                                            key={kb.table_name}
                                            onClick={() => handleKnowledgeBaseSelect(kb)}
                                        >
                                            {kb.table_title}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            {/* Main chat area with full-width scroll */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-gray-200
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                    transition-all duration-300"
                style={{paddingRight: isSidebarOpen ? '25%' : '0'}}
            >
                <div className="max-w-3xl mx-auto px-4">
                    <div className="space-y-6 py-8">
                        {messages.map((message, index) => (
                            (!Array.isArray(message.content)) && (
                                <div
                                    key={index}
                                    className={`flex items-start gap-3 ${
                                        message.type === 'human' ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                                >
                                    <Avatar className={`flex-shrink-0 ${
                                        message.type === 'human' ? 'ml-2' : 'mr-2'
                                    }`}>
                                        <AvatarFallback>
                                            {message.type === 'human' ? 'U' : 'AI'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Markdown
                                        className={`prose p-3 rounded-lg max-w-[80%] dark:prose-invert ${
                                            message.type === 'human'
                                                ? 'bg-blue-500 text-white rounded-tr-none'
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
                                </div>
                            )
                        ))}

                        {/* 显示状态信息 */}
                        {(status || isGenerating) && (
                            <SimpleStatus status={isGenerating ? '正在生成回答...' : status}/>
                        )}
                    </div>
                </div>
            </div>

            {/* Fixed input area */}
            <div
                className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t"
                style={{paddingRight: isSidebarOpen ? '25%' : '0'}}
            >
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                className="w-full pl-4 pr-10 py-3 rounded-full border-gray-200"
                                placeholder="问一问 AI..."
                                value={input}
                                onChange={handleInputChange}
                                disabled={isLoading || !kbChatUID}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                            >
                                <Mic className="h-5 w-5 text-gray-400"/>
                                <span className="sr-only">语音输入</span>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <DocumentSidebar
                documents={documents}
                isOpen={isSidebarOpen}
                onToggle={handleSidebarToogle}
            />
        </div>
    )
}

