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
import React, {useState, useEffect} from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
import {Button} from "@/components/ui/button.tsx"
import {EllipsisVertical, Plus} from "lucide-react"
import {useApiQuery, useApiMutation} from "@/hooks/useApi.ts"
import {ChatSession} from "@/utils/self_type.tsx"
import {groupItemsByPeriod} from "@/utils/sort.tsx"
import {kbStore} from "@/utils/self-state"
import {Link, useNavigate, useParams} from "react-router-dom"

export function ChatSidebar() {
    const selectedKbUID = kbStore((state) => state.selectedKbUID)
    const kbChatUID = kbStore((state) => state.kbChatUID)
    const setKBChatUID = kbStore((state) => state.setKBChatUID)
    const canCreateChat = kbStore((state) => state.canCreateChat)
    const navigate = useNavigate()
    const {chatId} = useParams()

    const [hoveredChat, setHoveredChat] = useState<string | null>(null)
    const [deleteID, setDeleteID] = useState<string | null>(null)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

    // 获取聊天列表
    const {data: chats, isLoading, refetch} = useApiQuery<ChatSession[]>(
        ['chats', selectedKbUID],
        `/rag/knowledge_bases/${selectedKbUID}/chats`,
        {
            enabled: !!selectedKbUID,
        }
    )

    // 删除对话请求
    const deleteChatMutation = useApiMutation<string, void>(
        `/rag/knowledge_bases/${selectedKbUID}/chats/${deleteID}`,
        'DELETE',
    )

    // 新建对话请求
    const newChatMutation = useApiMutation<string, void>(
        `/rag/knowledge_bases/${selectedKbUID}/chats`,
        'POST'
    )

    // 新建对话按钮点击事件
    const handleNewChat = async () => {
        if (!selectedKbUID) return

        try {
            const newChatUid = await newChatMutation.mutateAsync()
            await refetch()
            navigate(`/dashboard/chat/${newChatUid}`)
        } catch (error) {
            console.error('Failed to create new chat:', error)
            // 如果需要，这里可以添加错误提示
        }
    }

    const handleMoreClick = (e: React.MouseEvent, chatId: string) => {
        e.preventDefault()
        e.stopPropagation()
        setOpenMenuId(prevId => prevId === chatId ? null : chatId)
    }

    // 对话选择事件
    const handleChatClick = (chat: ChatSession) => {
        setKBChatUID(chat.uid)
        setHoveredChat(null)
        setOpenMenuId(null)
    }

    const handleDeleteClick = async (chatId: string) => {
        try {
            setDeleteID(chatId)
            await deleteChatMutation.mutateAsync()
            setDeleteID(null)

            // 刷新对话列表
            await refetch()

            setOpenMenuId(null)
            // 如果删除的是当前选中的对话，清空选中状态
            if (chatId === kbChatUID) {
                setKBChatUID("")
                navigate('/dashboard/chat')
            }
        } catch (error) {
            console.error('Failed to delete chat:', error)
        }
    }

    // 当URL中的chatId变化时，更新selectedChatUID
    useEffect(() => {
        if (chatId) {
            setKBChatUID(chatId)
        } else {
            setKBChatUID("")
        }
    }, [chatId, setKBChatUID])

    // 如果没有选择知识库，显示占位内容
    if (!selectedKbUID || isLoading) {
        return (
            <SidebarContent className="px-1 py-2">
                <div className="p-4 space-y-4">
                    <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full hover:bg-muted flex items-center gap-2 pl-3 pr-4"
                        disabled={true}
                    >
                        <Plus className="h-4 w-4"/>
                        <span className="text-sm">新建聊天</span>
                    </Button>
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
        )
    }

    const groupedChats = chats ? groupItemsByPeriod(chats) : {}

    return (
        <SidebarContent className="px-1 py-2">
            <div className="p-4 space-y-4">
                <Button
                    onClick={handleNewChat}
                    size="lg"
                    variant="outline"
                    className="rounded-full hover:bg-muted flex items-center gap-2 pl-3 pr-4"
                    disabled={!canCreateChat}
                >
                    <Plus className="h-4 w-4"/>
                    <span className="text-sm">新建聊天</span>
                </Button>
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
                                    key={chat.uid}
                                    onMouseEnter={() => setHoveredChat(chat.uid)}
                                    onMouseLeave={() => setHoveredChat(null)}
                                    className={chat.uid === kbChatUID ? 'bg-accent' : ''}
                                >
                                    <SidebarMenuButton asChild className="h-auto py-3 px-2 text-sm font-medium w-full text-left relative">
                                        <div className="flex items-center justify-between w-full">
                                            <Link
                                                to={`/dashboard/chat/${chat.uid}`}
                                                className="flex flex-col items-start gap-1 flex-grow min-w-0 relative"
                                                onClick={() => handleChatClick(chat)}
                                            >
                                                <span className="truncate w-full pr-4">{chat.description}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(chat.update_time), "MM月dd日 HH:mm", {locale: zhCN})}
                                                </span>
                                            </Link>
                                            {(hoveredChat === chat.uid || openMenuId === chat.uid) && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <DropdownMenu open={openMenuId === chat.uid}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0"
                                                                onClick={(e) => handleMoreClick(e, chat.uid)}
                                                            >
                                                                <EllipsisVertical className="h-4 w-4"/>
                                                                <span className="sr-only">打开菜单</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            onInteractOutside={() => setOpenMenuId(null)}
                                                        >
                                                            <DropdownMenuItem key={`${chat.uid}-rename`}>重命名</DropdownMenuItem>
                                                            <DropdownMenuItem key={`${chat.uid}-delete`}
                                                                              onClick={() => handleDeleteClick(chat.uid)}
                                                            >
                                                                删除
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
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

