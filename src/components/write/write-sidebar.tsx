import {Label} from "@/components/ui/label.tsx"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx"
import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar.tsx"
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {useState} from "react";
import {NewProjectDialog} from "@/components/write/new-project-form.tsx";

const writeOptions = [
    {value: "article", label: "文章"},
    {value: "essay", label: "论文"},
    {value: "report", label: "报告"},
    {value: "story", label: "故事"},
]

export function WriteSidebar() {
    const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState<boolean>(false)

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
                    <NewProjectDialog
                        isNewProjectDialogOpen={isNewProjectDialogOpen}
                        onNewProjectDialogOpen={setIsNewProjectDialogOpen}
                    />
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

