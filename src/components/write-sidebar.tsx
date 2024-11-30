import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
} from "@/components/ui/sidebar"

const writeOptions = [
    { value: "article", label: "文章" },
    { value: "essay", label: "论文" },
    { value: "report", label: "报告" },
    { value: "story", label: "故事" },
]

export function WriteSidebar() {
    return (
        <>
            <SidebarHeader className="gap-3.5 border-b p-4">
                <div className="flex w-full items-center justify-between">
                    <div className="text-base font-medium text-foreground">
                        写作助手
                    </div>
                    <Label className="flex items-center gap-2 text-sm">
                        <span>Unreads</span>
                        <Switch className="shadow-none" />
                    </Label>
                </div>
                <SidebarInput placeholder="搜索写作..." />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="px-4 py-2">
                    <SidebarGroupContent>
                        <Label htmlFor="write-type" className="mb-2 block">
                            选择写作类型
                        </Label>
                        <Select>
                            <SelectTrigger id="write-type">
                                <SelectValue placeholder="选择写作类型" />
                            </SelectTrigger>
                            <SelectContent>
                                {writeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </>
    )
}

