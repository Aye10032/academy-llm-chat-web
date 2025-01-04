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
} from "@/components/ui/sidebar"
import {useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button"
import {EllipsisVertical, Search, Plus} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";

const data = {
    chats: [
        {
            conclude: "API 参数解码分析",
            session_id: "1",
            date: "2025-01-03 18:20:25.743633",
        },
        {
            conclude: "Minipage 宽度可选参数",
            session_id: "2",
            date: "2025-01-02 18:20:25.743633",
        },
        {
            conclude: "系统发音树解析",
            session_id: "3",
            date: "2024-12-15 18:20:25.743633",
        },
        {
            conclude: "Shutil 文件复制函数区别",
            session_id: "4",
            date: "2024-12-15 18:20:25.743633",
        }
    ]
}

function groupChatsByPeriod(chats: typeof data.chats) {
    const now = new Date()
    const sevenDaysAgo = subDays(now, 7)
    const thirtyDaysAgo = subDays(now, 30)

    return chats.reduce((groups, chat) => {
        const chatDate = new Date(chat.date)

        if (isToday(chatDate)) {
            if (!groups["今天"]) groups["今天"] = []
            groups["今天"].push(chat)
        } else if (isAfter(chatDate, sevenDaysAgo)) {
            if (!groups["近7天"]) groups["近7天"] = []
            groups["近7天"].push(chat)
        } else if (isAfter(chatDate, thirtyDaysAgo)) {
            if (!groups["近30天"]) groups["近30天"] = []
            groups["近30天"].push(chat)
        } else {
            if (!groups["更早"]) groups["更早"] = []
            groups["更早"].push(chat)
        }

        return groups
    }, {} as Record<string, typeof data.chats>)
}


export function ChatSidebar() {
    const groupedChats = groupChatsByPeriod(data.chats)
    const [hoveredChat, setHoveredChat] = useState<string | null>(null)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const handleNewChat = () => {
        // 处理新建聊天的逻辑
        console.log('新建聊天')
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
                    <Button onClick={handleNewChat} size="icon" variant="outline" className="rounded-full">
                        <Plus className="h-4 w-4"/>
                        <span className="sr-only">新建聊天</span>
                    </Button>
                </div>
            </div>
            {Object.entries(groupedChats).map(([period, chats]) => (
                <SidebarGroup key={period}>
                    <SidebarGroupLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        {period}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {chats.map((chat) => (
                                <SidebarMenuItem
                                    key={chat.session_id}
                                    onMouseEnter={() => setHoveredChat(chat.session_id)}
                                    onMouseLeave={() => setHoveredChat(null)}
                                >
                                    <SidebarMenuButton asChild className="h-auto py-3 px-2 text-sm font-medium w-full text-left">
                                        <div className="flex items-center justify-between">
                                            <a href="#" className="flex flex-col items-start gap-1 flex-grow min-w-0">
                                                <span className="truncate w-full pr-4">{chat.conclude}</span>
                                                <span
                                                    className="text-[10px] text-muted-foreground">{format(new Date(chat.date), "MM月dd日 HH:mm", {locale: zhCN,})}</span>
                                            </a>
                                            {(hoveredChat === chat.session_id || openMenuId === chat.session_id) && (
                                                <DropdownMenu open={openMenuId === chat.session_id}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => handleMoreClick(e, chat.session_id)}
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
    )
}

