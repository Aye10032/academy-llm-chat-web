import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";
import {ChevronRight, File, FolderOpen, Plus, RefreshCcw} from "lucide-react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useState, useMemo} from "react";
import {projectStore} from "@/utils/self-state.tsx";
import {useApiMutation, useApiQuery} from "@/hooks/useApi.ts";
import {Manuscript} from "@/utils/self_type.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

interface FileStructure {
    id: string
    name: string
    type: "file" | "folder"
    children?: FileStructure[]
    manuscriptUid?: string
}

export function FileTreeForm() {
    const [newFileName, setNewFileName] = useState<string>('')
    const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState<boolean>(false)
    const selectedPrUID = projectStore((state) => state.selectedPrUID)
    const setSelectedManuscriptUID = projectStore((state) => state.setSelectedManuscriptUID)
    const selectedManuscriptUID = projectStore((state) => state.selectedManuscriptUID)

    // 请求草稿列表
    const {data: manuscripts, isLoading, refetch} = useApiQuery<Manuscript[]>(
        ['manuscripts', selectedPrUID],
        `/write/projects/${selectedPrUID}/manuscripts`,
        {
            enabled: !!selectedPrUID,
            refetchOnWindowFocus: false,
            retry: false,
        }
    );

    // 新建草稿
    const newFileMutation = useApiMutation<string, FormData>(
        `/write/projects/${selectedPrUID}/manuscripts`,
        'POST'
    );

    // 构建文件树结构
    const fileStructure = useMemo<FileStructure[]>(() => {
        if (!selectedPrUID) return [];

        if (!manuscripts) return [];

        // 将manuscripts按照is_draft分组并排序
        const normalFiles = manuscripts
            .filter(m => !m.is_draft)
            .sort((a, b) => a.title.localeCompare(b.title))
            .map(m => ({
                id: m.uid,
                name: m.title,
                type: 'file' as const,
                manuscriptUid: m.uid
            }));

        const draftFiles = manuscripts
            .filter(m => m.is_draft)
            .sort((a, b) => a.title.localeCompare(b.title))
            .map(m => ({
                id: m.uid,
                name: m.title,
                type: 'file' as const,
                manuscriptUid: m.uid
            }));

        // 只返回非空文件夹
        const folders: FileStructure[] = [];
        if (normalFiles.length > 0) {
            folders.push({
                id: "project-folder",
                name: "项目文件夹",
                type: "folder" as const,
                children: normalFiles,
            });
        }
        if (draftFiles.length > 0) {
            folders.push({
                id: "draft-folder",
                name: "草稿",
                type: "folder" as const,
                children: draftFiles,
            });
        }
        return folders;
    }, [manuscripts, selectedPrUID]);


    const createNewFile = () => {
        if (!newFileName) return;

        const formData = new FormData()
        formData.append('title', newFileName)

        newFileMutation.mutate(formData, {
            onSuccess: (data) => {
                refetch().then(r => {
                    if (r.isSuccess) {
                        setSelectedManuscriptUID(data);
                        setIsNewFileDialogOpen(false)
                        setNewFileName("");
                    }
                })
            }
        });
    }

    const renderFileTree = (items: FileStructure[]) => {
        return items.map((item) => (
            <div key={item.id} className="ml-4">
                {item.type === "folder" ? (
                    <Collapsible>
                        <CollapsibleTrigger
                            className="flex items-center gap-1 hover:bg-muted/50 w-full p-1 rounded transition-colors group">
                            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90"/>
                            <FolderOpen className="h-4 w-4"/>
                            <span>{item.name}</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>{item.children && renderFileTree(item.children)}</CollapsibleContent>
                    </Collapsible>
                ) : (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className={`flex items-center gap-1 hover:bg-muted/50 w-full p-1 rounded transition-colors ${
                                        selectedManuscriptUID === item.manuscriptUid ? "bg-muted text-primary" : ""
                                    }`}
                                    onClick={() => item.manuscriptUid && setSelectedManuscriptUID(item.manuscriptUid)}
                                >
                                    <File className="h-4 w-4"/>
                                    <span className="truncate max-w-[10em]">{item.name}</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{item.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        ))
    }

    return (
        <Collapsible className="relative border-r">
            <CollapsibleTrigger
                className="absolute -right-10 bottom-2 -translate-y-1/2 z-10
                flex h-8 w-8 items-center justify-center
                rounded-full border bg-background
                shadow-md transition-transform
                hover:bg-muted focus:outline-none
                focus:ring-2 focus:ring-muted
                focus:ring-offset-2
                data-[state=open]:rotate-180"
            >
                <ChevronRight className="h-4 w-4 duration-500"/>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="w-64 h-full flex flex-col">
                    <header className="h-14 border-b flex items-center justify-between px-4 bg-muted/60">
                        <span className="font-medium">文件列表</span>
                        <div className="flex gap-2">
                            <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={!selectedPrUID || isLoading}
                                    >
                                        <Plus className="h-4 w-4"/>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>新建文件</DialogTitle>
                                    </DialogHeader>
                                    <DialogDescription>创建新的待编辑文档</DialogDescription>
                                    <Input
                                        value={newFileName}
                                        onChange={(e) => setNewFileName(e.target.value)}
                                        placeholder="输入文件名称"
                                    />
                                    <Button
                                        onClick={() => createNewFile()}
                                        disabled={!newFileName}
                                    >
                                        创建
                                    </Button>
                                </DialogContent>
                            </Dialog>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => refetch()}
                                disabled={!selectedPrUID || isLoading}
                            >
                                <RefreshCcw className="h-4 w-4"/>
                            </Button>
                        </div>
                    </header>
                    <div className="flex-1 overflow-auto p-2">{renderFileTree(fileStructure)}</div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}