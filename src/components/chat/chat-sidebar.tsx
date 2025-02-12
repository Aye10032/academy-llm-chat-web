import {format} from "date-fns"
import {zhCN} from "date-fns/locale"
import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar.tsx"
import React, {useState, useEffect} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx"
import {EllipsisVertical, Search, Plus} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {useApiQuery, useApiMutation} from "@/hooks/useApi.ts";
import {ChatSession} from "@/utils/self_type.tsx";
import {groupItemsByPeriod} from "@/utils/sort.tsx";
import {kbStore} from "@/utils/self-state";
import {Link, useNavigate, useParams} from "react-router-dom";

export function ChatSidebar() {
    const selectedKbUID = kbStore((state) => state.selectedKbUID);
    const kbChatUID = kbStore((state) => state.kbChatUID);
    const setKBChatUID = kbStore((state) => state.setKBChatUID);
    const canCreateChat = kbStore((state) => state.canCreateChat);
    const navigate = useNavigate();
    const {chatId} = useParams();

    const [hoveredChat, setHoveredChat] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // 当URL中的chatId变化时，更新selectedChatUID
    useEffect(() => {
        if (chatId) {
            setKBChatUID(chatId);
        }
    }, [chatId, setKBChatUID]);

    // 获取聊天列表
    const {data: chats, isLoading} = useApiQuery<ChatSession[]>(
        ['chats', selectedKbUID],
        `/rag/chats?knowledge_base_uid=${selectedKbUID}`,
        {
            enabled: !!selectedKbUID,
        }
    );

    // 新建对话请求
    const newChatMutation = useApiMutation<string, void>(
        `/rag/new_chat/${selectedKbUID || ''}`,
        'PATCH'
    )

    // 修改handleNewChat函数
    const handleNewChat = async () => {
        if (!selectedKbUID) return;

        try {
            const newChatUid = await newChatMutation.mutateAsync();
            navigate(`/dashboard/chat/${newChatUid}`);
        } catch (error) {
            console.error('Failed to create new chat:', error);
            // 如果需要，这里可以添加错误提示
        }
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
        // TODO 对话历史搜索功能
    }

    const handleMoreClick = (e: React.MouseEvent, chatId: string) => {
        e.preventDefault()
        e.stopPropagation()
        setOpenMenuId(prevId => prevId === chatId ? null : chatId)
    }

    const handleChatClick = (chat: ChatSession) => {
        setKBChatUID(chat.chat_uid);
        setHoveredChat(null);
        setOpenMenuId(null);
    };

    // 如果没有选择知识库，显示占位内容
    if (!selectedKbUID || isLoading) {
        return (
            <SidebarContent className="px-1 py-2">
                <div className="p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                            <Input
                                type="text"
                                placeholder="搜索聊天"
                                className="pl-8 pr-4 py-2 w-full text-sm rounded-full bg-white"
                                disabled
                            />
                        </div>
                        <Button
                            size="icon"
                            variant="outline"
                            className="rounded-full"
                            disabled
                        >
                            <Plus className="h-4 w-4"/>
                            <span className="sr-only">新建聊天</span>
                        </Button>
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {Array.from({length: 12}).map((_, index) => (
                        <div
                            key={index}
                            className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                        />
                    ))}
                </div>
            </SidebarContent>
        );
    }

    const groupedChats = chats ? groupItemsByPeriod(chats) : {};

    return (
        <SidebarContent className="px-1 py-2">
            <div className="p-4 space-y-4">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                        <Input
                            type="text"
                            placeholder="搜索聊天"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="pl-8 pr-4 py-2 w-full text-sm rounded-full bg-white"
                        />
                    </div>
                    <Button
                        onClick={handleNewChat}
                        size="icon"
                        variant="outline"
                        className="rounded-full"
                        disabled={!canCreateChat}
                    >
                        <Plus className="h-4 w-4"/>
                        <span className="sr-only">新建聊天</span>
                    </Button>
                </div>
            </div>
            {Object.entries(groupedChats).map(([period, periodChats]) => (
                <SidebarGroup key={period}>
                    <SidebarGroupLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        {period}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {periodChats.map((chat) => (
                                <SidebarMenuItem
                                    key={chat.chat_uid}
                                    onMouseEnter={() => setHoveredChat(chat.chat_uid)}
                                    onMouseLeave={() => setHoveredChat(null)}
                                    className={chat.chat_uid === kbChatUID ? 'bg-accent' : ''}
                                >
                                    <SidebarMenuButton asChild className="h-auto py-3 px-2 text-sm font-medium w-full text-left">
                                        <div className="flex items-center justify-between">
                                            <Link
                                                to={`/dashboard/chat/${chat.chat_uid}`}
                                                className="flex flex-col items-start gap-1 flex-grow min-w-0"
                                                onClick={() => handleChatClick(chat)}
                                            >
                                                <span className="truncate w-full pr-4">{chat.description}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(chat.update_time), "MM月dd日 HH:mm", {locale: zhCN})}
                                                </span>
                                            </Link>
                                            {(hoveredChat === chat.chat_uid || openMenuId === chat.chat_uid) && (
                                                <DropdownMenu open={openMenuId === chat.chat_uid}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => handleMoreClick(e, chat.chat_uid)}
                                                        >
                                                            <EllipsisVertical className="h-4 w-4"/>
                                                            <span className="sr-only">打开菜单</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        onInteractOutside={() => setOpenMenuId(null)}
                                                    >
                                                        <DropdownMenuItem>重命名</DropdownMenuItem>
                                                        <DropdownMenuItem>删除</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </SidebarContent>
    );
}

