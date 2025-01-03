import {format, isToday, isAfter, subDays} from "date-fns"
import { zhCN } from "date-fns/locale"
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
import {MoreHorizontal} from "lucide-react";

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

    return (
        <SidebarContent className="px-1 py-2">
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
                                    <SidebarMenuButton
                                        asChild
                                        className="h-auto py-3 px-2 text-sm font-medium w-full text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <a href="#" className="flex flex-col items-start gap-1 flex-grow min-w-0">
                                                <span className="truncate w-full pr-4">{chat.conclude}</span>
                                                <span className="text-[10px] text-muted-foreground">
                              {format(new Date(chat.date), "MM月dd日 HH:mm", {
                                  locale: zhCN,
                              })}
                            </span>
                                            </a>
                                            {hoveredChat === chat.session_id && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4"/>
                                                            <span className="sr-only">打开菜单</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
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

