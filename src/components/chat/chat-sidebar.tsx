import {format, isToday, isAfter, subDays} from "date-fns"
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
import React, {useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx"
import {EllipsisVertical, Search, Plus} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {useApiQuery} from "@/hooks/useApi.ts";
import {ChatSession, ChatSidebarProps} from "@/utils/self_type.ts";
import {useNavigate} from "react-router-dom";

function groupChatsByPeriod(chats: ChatSession[]) {
    // 首先按更新时间降序排序
    const sortedChats = [...chats].sort((a, b) => 
        new Date(b.update_time).getTime() - new Date(a.update_time).getTime()
    );

    const now = new Date()
    const sevenDaysAgo = subDays(now, 7)
    const thirtyDaysAgo = subDays(now, 30)

    const groups = {
        "今天": [] as ChatSession[],
        "近7天": [] as ChatSession[],
        "近30天": [] as ChatSession[],
        "更早": [] as ChatSession[],
    };

    sortedChats.forEach(chat => {
        const chatDate = new Date(chat.update_time)

        if (isToday(chatDate)) {
            groups["今天"].push(chat)
        } else if (isAfter(chatDate, sevenDaysAgo)) {
            groups["近7天"].push(chat)
        } else if (isAfter(chatDate, thirtyDaysAgo)) {
            groups["近30天"].push(chat)
        } else {
            groups["更早"].push(chat)
        }
    });

    // 只返回有内容的分组
    return Object.fromEntries(
        Object.entries(groups).filter(([_, chats]) => chats.length > 0)
    );
}

export function ChatSidebar({ selectedKbName, onHistorySelect, selectedHistoryId }: ChatSidebarProps) {
    const navigate = useNavigate();
    const [hoveredChat, setHoveredChat] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // 使用 useApiQuery 获取聊天记录
    const { data: chats, isLoading } = useApiQuery<ChatSession[]>(
        ['chats', selectedKbName],
        `/rag/chats?knowledge_base_name=${selectedKbName || ''}`,
        {
            enabled: !!selectedKbName,
        }
    );

    const handleNewChat = () => {
        // 清除当前选中的对话
        if (onHistorySelect) {
            onHistorySelect('');
        }
        // 导航到基础聊天路径
        navigate('/c');
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
        // 这里可以添加搜索逻辑
    }

    const handleMoreClick = (e: React.MouseEvent, chatId: string) => {
        e.preventDefault()
        e.stopPropagation()
        setOpenMenuId(prevId => prevId === chatId ? null : chatId)
    }

    const handleChatClick = (chat: ChatSession) => {
        if (onHistorySelect) {
            onHistorySelect(chat.history_id);
            // 可以在这里添加选中状态的视觉反馈
            setHoveredChat(null); // 清除悬停状态
            setOpenMenuId(null);  // 关闭下拉菜单
        }
    };

    // 如果没有选择知识库，显示占位内容
    if (!selectedKbName) {
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
                                disabled
                            />
                        </div>
                        <Button 
                            onClick={handleNewChat} 
                            size="icon" 
                            variant="outline" 
                            className="rounded-full"
                            disabled={!selectedKbName} // 如果没有选择知识库则禁用
                        >
                            <Plus className="h-4 w-4"/>
                            <span className="sr-only">新建聊天</span>
                        </Button>
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {Array.from({ length: 24 }).map((_, index) => (
                        <div
                            key={index}
                            className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                        />
                    ))}
                </div>
            </SidebarContent>
        );
    }

    // 如果正在加载，可以显示加载状态
    if (isLoading) {
        return (
            <SidebarContent className="px-1 py-2">
                <div className="p-4">加载中...</div>
            </SidebarContent>
        );
    }

    // 如果有聊天记录数据，按时间分组显示
    const groupedChats = chats ? groupChatsByPeriod(chats) : {};

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
                        disabled={!selectedKbName} // 如果没有选择知识库则禁用
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
                                    key={chat.history_id}
                                    onMouseEnter={() => setHoveredChat(chat.history_id)}
                                    onMouseLeave={() => setHoveredChat(null)}
                                    onClick={() => handleChatClick(chat)}
                                    className={chat.history_id === selectedHistoryId ? 'bg-accent' : ''}
                                >
                                    <SidebarMenuButton asChild className="h-auto py-3 px-2 text-sm font-medium w-full text-left">
                                        <div className="flex items-center justify-between">
                                            <a href="#" className="flex flex-col items-start gap-1 flex-grow min-w-0">
                                                <span className="truncate w-full pr-4">{chat.description}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(chat.create_time), "MM月dd日 HH:mm", {locale: zhCN})}
                                                </span>
                                            </a>
                                            {(hoveredChat === chat.history_id || openMenuId === chat.history_id) && (
                                                <DropdownMenu open={openMenuId === chat.history_id}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => handleMoreClick(e, chat.history_id)}
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

