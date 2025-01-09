import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx"
import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import Markdown from 'react-markdown';
// @ts-expect-error no need any more
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
// @ts-expect-error no need any more
import {darcula} from 'react-syntax-highlighter/dist/esm/styles/prism';
import React, {useState, useRef, useEffect, useCallback} from "react";
import {useApiQuery, useSseQuery} from "@/hooks/useApi.ts";
import {UserProfile, KnowledgeBase, Message, Document} from "@/utils/self_type.ts";
import {ChevronDownIcon, Mic} from "lucide-react";
import {DocumentSidebar} from "@/components/chat/document-sidebar.tsx";
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'

interface ChatPageProps {
    user: UserProfile;
    onKnowledgeBaseSelect?: (kb: KnowledgeBase | null) => void;
    selectedChatHistory?: string;
}


export function ChatPage({user, onKnowledgeBaseSelect, selectedChatHistory}: ChatPageProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
    const [status, setStatus] = useState<string>('');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeDocIndex, setActiveDocIndex] = useState<number>();

    // 获取知识库列表
    const {data: knowledgeBases, isLoading: knowledgeBasesLoading} = useApiQuery<KnowledgeBase[]>(
        ['knowledgeBases'],
        '/rag/knowledge_bases'
    );

    // 当选择知识库时
    const handleKnowledgeBaseSelect = (kb: KnowledgeBase) => {
        setSelectedKb(kb);
        onKnowledgeBaseSelect?.(kb);
    };

    // 获取历史对话
    const {data: chatHistoryData} = useApiQuery<Message[]>(
        ['chatHistory', selectedChatHistory],
        `/rag/chat/${selectedChatHistory}`,
        {
            enabled: !!selectedChatHistory,
        }
    );

    // 当历史对话数据加载完成时更新消息列表
    useEffect(() => {
        if (chatHistoryData) {
            const formattedMessages = chatHistoryData.map((msg, index) => ({
                id: index.toString(),
                type: msg.type,
                content: msg.content
            }));
            setMessages(formattedMessages);
        }
    }, [chatHistoryData]);

    // 当选择新的对话时，清空当前消息
    useEffect(() => {
        if (selectedChatHistory) {
            setMessages([]); // 在新数据加载前清空
        }
    }, [selectedChatHistory]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    // 使用新的 SSE mutation
    const chatMutation = useSseQuery<{
        message: string,
        knowledge_base_name: string,
        history: string
    }>('/rag/chat');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'human',
            content: input.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setStatus('');
        setDocuments([]);
        setIsGenerating(false);
        setIsSidebarOpen(false);

        try {
            const response = await chatMutation.mutateAsync({
                message: userMessage.content,
                knowledge_base_name: selectedKb?.table_name || '',
                history: selectedChatHistory || user.last_chat
            });

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
                            case 'docs':
                                const processedDocs = parsedData.map((doc: Document, index: number) => ({
                                    ...doc,
                                    metadata: {
                                        ...doc.metadata,
                                        isReferenced: false // 初始化引用状态
                                    }
                                }));
                                setDocuments(processedDocs);
                                break;
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
        } finally {
            setIsLoading(false);
            setIsGenerating(false);
        }
    };

    // 添加处理脚注的函数
    const processFootnotes = (content: string) => {
        // 处理已经转义的方括号
        content = content.replace(/\\\[\\\^(\d+)\\\]/g, (_, num) => {
            const index = parseInt(num) - 1;
            return `<sup class="inline-flex justify-center items-center text-xs bg-gray-100 rounded px-1.5 py-0.5 ml-0.5 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer" onclick="window.handleFootnoteClick(${index})">${num}</sup>`;
        });
        
        // 处理普通的方括号
        return content.replace(/\[\^(\d+)\]/g, (_, num) => {
            const index = parseInt(num) - 1;
            return `<sup class="inline-flex justify-center items-center text-xs bg-gray-100 rounded px-1.5 py-0.5 ml-0.5 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer" onclick="window.handleFootnoteClick(${index})">${num}</sup>`;
        });
    };

    // 添加全局点击处理函数
    useEffect(() => {
        window.handleFootnoteClick = (index: number) => {
            setIsSidebarOpen(true);
            setActiveDocIndex(index);
        };

        return () => {
            delete window.handleFootnoteClick;
        };
    }, []);

    // 生成回答后自动打开侧边栏
    useEffect(() => {
        if (documents.length > 0 && !isGenerating && !isLoading) {
            setIsSidebarOpen(true)
        }
    }, [documents, isGenerating, isLoading]);

    const handleSidebarToogle = useCallback(()=>{
        setIsSidebarOpen(prevState => !prevState)
    },[])

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
                                    {selectedKb ? selectedKb.table_title : '选择知识库'}
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
                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
            >
                <div className="max-w-3xl mx-auto px-4">
                    <div className="space-y-6 py-8">
                        {messages.map((message, index) => (
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
                                <div
                                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                                        message.type === 'human'
                                            ? 'bg-blue-500 text-white rounded-tr-none'
                                            : 'bg-white text-black rounded-tl-none'
                                    }`}
                                >
                                    <Markdown
                                        className="prose prose-sm max-w-none dark:prose-invert"
                                        components={{
                                            code(props) {
                                                const {children, className, node, ...rest} = props
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
                                            },
                                            p({children}) {
                                                if (typeof children === 'string') {
                                                    return <p dangerouslySetInnerHTML={{__html: processFootnotes(children)}}/>;
                                                }
                                                return <p>{children}</p>;
                                            },
                                            li({children}) {
                                                if (typeof children === 'string') {
                                                    return <li dangerouslySetInnerHTML={{__html: processFootnotes(children)}}/>;
                                                }
                                                return <li>{children}</li>;
                                            },
                                            strong({children}) {
                                                if (typeof children === 'string') {
                                                    return <strong dangerouslySetInnerHTML={{__html: processFootnotes(children)}}/>;
                                                }
                                                return <strong>{children}</strong>;
                                            },
                                            em({children}) {
                                                if (typeof children === 'string') {
                                                    return <em dangerouslySetInnerHTML={{__html: processFootnotes(children)}}/>;
                                                }
                                                return <em>{children}</em>;
                                            },
                                            text({children}) {
                                                if (typeof children === 'string') {
                                                    return <span dangerouslySetInnerHTML={{__html: processFootnotes(children)}}/>;
                                                }
                                                return <>{children}</>;
                                            }
                                        }}
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {message.content}
                                    </Markdown>
                                </div>
                            </div>
                        ))}

                        {/* 显示状态信息 */}
                        {(status || isGenerating) && (
                            <div className="flex justify-center">
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700">
                                    {isGenerating ? '正在生成回答...' : status}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fixed input area */}
            <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                className="w-full pl-4 pr-10 py-3 rounded-full border-gray-200"
                                placeholder="问一问 AI..."
                                value={input}
                                onChange={handleInputChange}
                                disabled={isLoading}
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

            {/* 使用真实文档数据 */}
            <DocumentSidebar
                documents={documents}
                isOpen={isSidebarOpen}
                onToggle={handleSidebarToogle}
                activeDocIndex={activeDocIndex}
                onActiveDocChange={setActiveDocIndex}
            />
        </div>
    )
}

