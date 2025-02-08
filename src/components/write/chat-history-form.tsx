import {Button} from "@/components/ui/button"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {History} from "lucide-react"
import {format} from "date-fns"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {groupItemsByPeriod} from "@/utils/sort.ts";
import {ChatSession} from "@/utils/self_type.ts";
import {projectStore} from "@/utils/self-state.tsx";
import {useApiQuery} from "@/hooks/useApi.ts";


export function ChatHistory() {
    const selectProjectUID = projectStore((state) => state.selectProjectUID)
    const setSelectedChatUID = projectStore((state) => state.setSelectedChatUID)

    // 获取聊天列表
    const {data: chats, isLoading} = useApiQuery<ChatSession[]>(
        ['write', selectProjectUID],
        `/write/chats?project_uid=${selectProjectUID}`,
        {
            enabled: !!selectProjectUID,
        }
    );
    const groupedChats = chats ? groupItemsByPeriod(chats) : {};

    return (
        <Popover>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={!chats || chats.length === 0 || isLoading}
                            >
                                <History className="h-5 w-5"/>
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>聊天记录</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <PopoverContent align="start" side="right" className="w-80 p-0" sideOffset={0} alignOffset={-40}>
                <ScrollArea className="h-80">
                    {Object.entries(groupedChats).map(([period, chats]) => (
                        <div key={period} className="px-1">
                            <div className="sticky top-0 bg-background/95 backdrop-blur px-3 py-2">
                                <h3 className="text-sm font-medium text-muted-foreground">{period}</h3>
                            </div>
                            <div className="space-y-1 p-1">
                                {chats.map((chat) => (
                                    <button
                                        key={chat.chat_uid}
                                        onClick={() => setSelectedChatUID(chat.chat_uid)}
                                        className="w-full text-left px-2 py-1 rounded-md hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="text-sm font-medium truncate">{chat.description}</div>
                                        <div className="text-xs text-muted-foreground">{format(new Date(chat.update_time), "HH:mm")}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}

