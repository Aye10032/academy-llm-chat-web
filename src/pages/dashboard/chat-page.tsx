declare global {
    interface Window {
        handleFootnoteClick?: (index: number) => void;
    }
}

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
import {useApiQuery, useSseQuery, useApiMutation} from "@/hooks/useApi.ts";
import {KnowledgeBase, Message, Document, UserProfile} from "@/utils/self_type.ts";
import {ChevronDownIcon, Mic} from "lucide-react";
import {DocumentSidebar} from "@/components/chat/document-sidebar.tsx";
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'

interface ChatPageProps {
    user: UserProfile;
    onKnowledgeBaseSelect: (kb: KnowledgeBase | null) => void;
    selectedHistoryId: string;
}

export function ChatPage({user, onKnowledgeBaseSelect, selectedHistoryId}: ChatPageProps) {
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

    // 获取知识库列表请求
    const {data: knowledgeBases, isLoading: knowledgeBasesLoading} = useApiQuery<KnowledgeBase[]>(
        ['knowledgeBases'],
        '/rag/knowledge_bases'
    );

    // 获取历史对话请求
    const {data: chatHistoryData} = useApiQuery<Message[]>(
        ['chatHistory', selectedHistoryId],
        `/rag/chat/${selectedHistoryId}`,
        {
            enabled: !!selectedHistoryId,
        }
    );

    // 新建对话请求
    const newChatMutation = useApiMutation<string, void>(
        `/rag/chat/${selectedKb?.table_name || ''}`,
        'PATCH'
    );

    // 对话 SSE mutation
    const chatMutation = useSseQuery<{
        message: string,
        knowledge_base_name: string,
        history_id: string
    }>('/rag/chat');

    // 初始化知识库
    useEffect(() => {
        if (!knowledgeBasesLoading && knowledgeBases && user.last_knowledge_base) {
            const lastKb = knowledgeBases.find(kb => kb.table_name === user.last_knowledge_base);
            if (lastKb) {
                setSelectedKb(lastKb);
                onKnowledgeBaseSelect(lastKb);
            }
        }
    }, [knowledgeBasesLoading, knowledgeBases, user.last_knowledge_base, onKnowledgeBaseSelect]);

    // 选择知识库事件处理
    const handleKnowledgeBaseSelect = (kb: KnowledgeBase) => {
        if (kb.table_name == selectedKb?.table_name) return;

        setMessages([]);
        clearState();
        setSelectedKb(kb);
        onKnowledgeBaseSelect(kb);
        setIsLoading(false);
    };

    const clearState = () => {
        setInput('');
        setIsLoading(true);
        setStatus('');
        setDocuments([]);
        setIsGenerating(false);
        setIsSidebarOpen(false);
    }

    // 历史对话加载
    useEffect(() => {
        setMessages([]);

        // 当 selectedHistoryId 为空时，直接返回
        if (!selectedHistoryId) return;

        // 如果有新的历史数据，则设置
        if (chatHistoryData) {
            const formattedMessages = chatHistoryData.map((msg, index) => ({
                id: index.toString(),
                type: msg.type,
                content: msg.content
            }));
            setMessages(formattedMessages);
        }
    }, [selectedHistoryId, chatHistoryData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    // 对话提交事件处理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !selectedKb) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'human',
            content: input.trim()
        };

        clearState();

        try {
            let currentHistoryId = selectedHistoryId;

            // 如果没有选中的对话，先创建新对话
            if (!selectedHistoryId) {
                try {
                    currentHistoryId = await newChatMutation.mutateAsync();
                } catch (error) {
                    console.error('Failed to create new chat:', error);
                    setStatus('创建新对话失败');
                    return;
                }
            }

            // 设置消息
            setMessages(prev => [...prev, userMessage]);

            // 使用可能更新的 historyId 发送聊天请求
            const response = await chatMutation.mutateAsync({
                message: userMessage.content,
                knowledge_base_name: selectedKb.table_name,
                history_id: currentHistoryId || ''
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
            if (!selectedHistoryId) {
                setMessages([]);
            }
        } finally {
            setIsLoading(false);
            setIsGenerating(false);
        }
    };

    // 修改 processFootnotes 函数使其能够递归处理嵌套的HTML内容
    const processFootnotes = (content: string | React.ReactNode): string | React.ReactNode => {
        if (typeof content !== 'string') {
            return content;
        }

        // 处理已经转义的方括号
        let processed = content.replace(/\\\[\\\^(\d+)\\\]/g, (_, num) => {
            const index = parseInt(num) - 1;
            return `<sup class="inline-flex justify-center items-center text-xs bg-gray-100 rounded px-1.5 py-0.5 ml-0.5 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer" onclick="window.handleFootnoteClick(${index})">${num}</sup>`;
        });

        // 处理普通的方括号
        processed = processed.replace(/\[\^(\d+)\]/g, (_, num) => {
            const index = parseInt(num) - 1;
            return `<sup class="inline-flex justify-center items-center text-xs bg-gray-100 rounded px-1.5 py-0.5 ml-0.5 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer" onclick="window.handleFootnoteClick(${index})">${num}</sup>`;
        });

        return processed;
    };

    // 创建一个通用的内容处理组件
    const ProcessContent = ({children, as: Component = 'span'}: { children: React.ReactNode, as?: keyof JSX.IntrinsicElements }) => {
        const processChildren = (child: React.ReactNode): React.ReactNode => {
            if (typeof child === 'string') {
                return <span dangerouslySetInnerHTML={{__html: processFootnotes(child) as string}}/>;
            }

            if (Array.isArray(child)) {
                return child.map((c, index) => <React.Fragment key={index}>{processChildren(c)}</React.Fragment>);
            }

            if (React.isValidElement(child)) {
                const props = {
                    ...child.props,
                    children: processChildren(child.props.children)
                };
                return React.cloneElement(child, props);
            }

            return child;
        };

        return <Component>{processChildren(children)}</Component>;
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
                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                    transition-all duration-300"
                style={{paddingRight: isSidebarOpen ? '25%' : '0'}}
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
                                            },
                                            p(props) {
                                                return <ProcessContent as="p">{props.children}</ProcessContent>;
                                            },
                                            li(props) {
                                                return <ProcessContent as="li">{props.children}</ProcessContent>;
                                            },
                                            strong(props) {
                                                return <ProcessContent as="strong">{props.children}</ProcessContent>;
                                            },
                                            em(props) {
                                                return <ProcessContent as="em">{props.children}</ProcessContent>;
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

            <DocumentSidebar
                documents={documents}
                isOpen={isSidebarOpen}
                onToggle={handleSidebarToogle}
                activeDocIndex={activeDocIndex}
            />
        </div>
    )
}

