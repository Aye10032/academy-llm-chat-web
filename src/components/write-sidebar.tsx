import {Label} from "@/components/ui/label"
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
} from "@/components/ui/sidebar"
import {Plus, Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";

const writeOptions = [
    {value: "article", label: "文章"},
    {value: "essay", label: "论文"},
    {value: "report", label: "报告"},
    {value: "story", label: "故事"},
]

export function WriteSidebar() {
    return (
        <SidebarContent className="px-1 py-2">
            <div className="p-4 space-y-4">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                        <Input
                            type="text"
                            placeholder="选择写作项目"
                            // value={searchQuery}
                            // onChange={handleSearch}
                            className="pl-8 pr-4 py-2 w-full text-sm rounded-full bg-white"
                        />
                    </div>
                    <Button
                        // onClick={handleNewChat}
                        size="icon"
                        variant="outline"
                        className="rounded-full"
                        // disabled={!selectedKbName} // 如果没有选择知识库则禁用
                    >
                        <Plus className="h-4 w-4"/>
                        <span className="sr-only">新建聊天</span>
                    </Button>
                </div>
            </div>
            <SidebarGroup className="px-4 py-2">
                <SidebarGroupContent>
                    <Label htmlFor="write-type" className="mb-2 block">
                        选择写作类型
                    </Label>
                    <Select>
                        <SelectTrigger id="write-type">
                            <SelectValue placeholder="选择写作类型"/>
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
    )
}

