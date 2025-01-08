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
import ReactMarkdown from 'react-markdown';
// @ts-expect-error no need any more
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
// @ts-expect-error no need any more
import {tomorrow} from 'react-syntax-highlighter/dist/esm/styles/prism';
import React, {useState, useRef, useEffect} from "react";
import {useStreamingMutation, useApiQuery} from "@/hooks/useApi.ts";
import {UserProfile, KnowledgeBase, Message, Document} from "@/utils/self_type.ts";
import {ChevronDownIcon, Mic} from "lucide-react";
import MathJax from "@/components/math-block.tsx";
import {DocumentSidebar} from "@/components/chat/document-sidebar.tsx";

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

    // 获取知识库列表
    const {data: knowledgeBases, isLoading: knowledgeBasesLoading} = useApiQuery<KnowledgeBase[]>(
        ['knowledgeBases'],
        '/rag/knowledge_bases'
    );

    // 获取历史对话
    const {data: chatHistoryData, isLoading: chatHistoryLoading} = useApiQuery<Message[]>(
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

    // 发送新消息的mutation
    const chatMutation = useStreamingMutation<{
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

        try {
            const stream = await chatMutation.mutateAsync({
                message: userMessage.content,
                knowledge_base_name: selectedKb ? selectedKb.table_name : '',
                history: selectedChatHistory || user.last_chat // 使用选中的对话历史或默认值
            });

            if (!stream) throw new Error('No stream available');

            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let aiMessageContent = '';

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: ''
            };
            setMessages(prev => [...prev, aiMessage]);

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                aiMessageContent += text;

                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    lastMessage.content = aiMessageContent;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Error:', error);
            // TODO: 添加错误提示组件
        } finally {
            setIsLoading(false);
        }
    };

    // 当选择知识库时
    const handleKnowledgeBaseSelect = (kb: KnowledgeBase) => {
        setSelectedKb(kb);
        onKnowledgeBaseSelect?.(kb);
    };

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
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const [documents, setDocuments] = useState<Document[]>([
        {
            title: "Sample PDF Document",
            author: "John Doe",
            year: 2025,
            source: "sample.pdf",
            source_type: 1,
            score: 0.9730876959261983,
            refer_sentence: ["This is a sample reference sentence."],
            page_content: "This is sample page content. This is a sample reference sentence. More content here."
        },
        {
            title: "Sample Web Document",
            author: "Jane Smith",
            year: 2024,
            source: "https://example.com",
            source_type: 2,
            score: 0.7530876959261983,
            refer_sentence: ["This is another sample reference."],
            page_content: "This is another sample page content. This is another sample reference. Even more content here."
        },
        // Add more sample documents as needed
    ])

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
                                    <ReactMarkdown
                                        className="prose prose-sm max-w-none dark:prose-invert"
                                        components={{
                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                            code({node, inline, className, children, ...props}) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={tomorrow}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            },
                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                            p({node, children, ...props}) {
                                                return <p {...props}>{children}</p>
                                            },
                                            math: ({value}) => <MathJax math={value} display={true}/>,
                                            inlineMath: ({value}) => <MathJax math={value} display={false}/>,
                                        }}
                                        remarkPlugins={[]}
                                        rehypePlugins={[]}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
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

            {/* 可以添加加载状态显示 */}
            {chatHistoryLoading && (
                <div className="flex-1 flex items-center justify-center">
                    加载对话历史中...
                </div>
            )}

            {/* Add the DocumentSidebar component */}
            <DocumentSidebar documents={documents} />
        </div>
    )
}

