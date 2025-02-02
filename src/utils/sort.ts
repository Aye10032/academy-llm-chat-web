import {ChatSession} from "@/utils/self_type.ts";
import {isAfter, isToday, subDays} from "date-fns";

export function groupChatsByPeriod(chats: ChatSession[]) {
    // 按更新时间降序排序
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