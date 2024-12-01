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
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import ReactMarkdown from 'react-markdown'
import React, {useState, useRef, useEffect} from "react";
import {useStreamingMutation} from "@/hooks/useApi";
import {UserProfile} from "@/utils/self_type";

interface ChatPageProps {
    user: UserProfile;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function ChatPage({ user }: ChatPageProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const chatMutation = useStreamingMutation<{message: string}>('/chat/question');

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
            const stream = await chatMutation.mutateAsync({ message: userMessage.content });
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
        <div className="flex flex-col h-full">
            <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
                <SidebarTrigger className="-ml-1"/>
                <Separator orientation="vertical" className="mr-2 h-4"/>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#">主页</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>知识库对话</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <main className="flex-1 overflow-auto p-4">
                <Card className="w-full max-w-2xl mx-auto mt-8">
                    <CardHeader>
                        <CardTitle>AI Chat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px] pr-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 flex items-start gap-2 ${
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
                                                : 'bg-white text-black rounded-tl-none'
                                        }`}
                                    >
                                        <ReactMarkdown className="prose-sm break-words">
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    </CardContent>
                    <CardFooter>
                        <form onSubmit={handleSubmit} className="flex w-full gap-2">
                            <Input
                                placeholder="输入你的问题..."
                                value={input}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "发送中..." : "发送"}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </main>
        </div>
    )
}

