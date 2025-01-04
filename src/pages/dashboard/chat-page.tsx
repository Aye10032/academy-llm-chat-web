import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {ScrollArea} from "@/components/ui/scroll-area";
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
import {useStreamingMutation, useApiQuery} from "@/hooks/useApi";
import {UserProfile, KnowledgeBase, Message} from "@/utils/self_type";
import {ChevronDownIcon, Mic} from "lucide-react";

interface ChatPageProps {
    user: UserProfile;
}


export function ChatPage({user}: ChatPageProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const chatMutation = useStreamingMutation<{
        message: string,
        knowledge_base_name: string,
        history: string
    }>('/rag/chat');

    const {data: knowledgeBases, isLoading: knowledgeBasesLoading} = useApiQuery<KnowledgeBase[]>(
        ['knowledgeBases'],
        '/rag/knowledge_bases'
    );

    const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chatMutation.mutateAsync({
                message: userMessage.content,
                knowledge_base_name: selectedKb ? selectedKb.table_title : '',
                history: user.last_chat
            });
            if (!stream) throw new Error('No stream available');

            const reader = stream.getReader();
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: ''
            };
            setMessages(prev => [...prev, aiMessage]);

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    lastMessage.content += text;
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
                                            onClick={() => setSelectedKb(kb)}
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
            <main className="flex-1 overflow-hidden container max-w-3xl mx-auto px-4">
                <ScrollArea className="h-full pt-8 pb-24">
                    <div className="space-y-6">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 ${
                                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                }`}
                            >
                                <Avatar className={`flex-shrink-0 ${
                                    message.role === 'user' ? 'ml-2' : 'mr-2'
                                }`}>
                                    <AvatarFallback>
                                        {message.role === 'user' ? 'U' : 'AI'}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                                        message.role === 'user'
                                            ? 'bg-blue-500 text-white rounded-tr-none'
                                            : 'text-black rounded-tl-none'
                                    }`}
                                >
                                    <ReactMarkdown
                                        className="prose prose-sm max-w-none dark:prose-invert"
                                        components={{
                                            code({className, children, ...props}) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return match ? (
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
                                            }
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </main>

            {/* Fixed input area */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t">
                <div className="container max-w-3xl mx-auto px-4 py-4">
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
        </div>
    )
}

