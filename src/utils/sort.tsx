import {isAfter, isToday, subDays} from "date-fns";

// 定义一个类型约束，确保传入的对象具有 update_time 属性
interface HasUpdateTime {
    update_time: string;
}

export function groupItemsByPeriod<T extends HasUpdateTime>(items: T[]) {
    // 按更新时间降序排序
    const sortedItems = [...items].sort((a, b) =>
        new Date(b.update_time).getTime() - new Date(a.update_time).getTime()
    );

    const now = new Date()
    const sevenDaysAgo = subDays(now, 7)
    const thirtyDaysAgo = subDays(now, 30)

    const groups = {
        "今天": [] as T[],
        "近7天": [] as T[],
        "近30天": [] as T[],
        "更早": [] as T[],
    };

    sortedItems.forEach(item => {
        const itemDate = new Date(item.update_time)

        if (isToday(itemDate)) {
            groups["今天"].push(item)
        } else if (isAfter(itemDate, sevenDaysAgo)) {
            groups["近7天"].push(item)
        } else if (isAfter(itemDate, thirtyDaysAgo)) {
            groups["近30天"].push(item)
        } else {
            groups["更早"].push(item)
        }
    });

    // 只返回有内容的分组
    return Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(groups).filter(([_, items]) => items.length > 0)
    ) as Record<string, T[]>;
}