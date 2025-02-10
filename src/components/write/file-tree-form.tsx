import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";
import {ChevronRight, File, FolderOpen, Plus, RefreshCcw} from "lucide-react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useState, useMemo} from "react";
import {projectStore} from "@/utils/self-state.tsx";
import {useApiMutation, useApiQuery} from "@/hooks/useApi.ts";
import {Manuscript} from "@/utils/self_type.ts";

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
    const selectProjectUID = projectStore((state) => state.selectProjectUID)
    const setSelectManuscriptUID = projectStore((state) => state.setSelectManuscriptUID)
    const selectManuscriptUID = projectStore((state) => state.selectManuscriptUID)

    const {data: manuscripts, isLoading} = useApiQuery<Manuscript[]>(
        ['manuscripts', selectProjectUID],
        `/write/manuscripts?project_uid=${selectProjectUID}`,
        {
            enabled: !!selectProjectUID,
            refetchOnWindowFocus: false,
            retry: false,
        }
    );

    // 构建文件树结构
    const fileStructure = useMemo<FileStructure[]>(() => {
        if (!selectProjectUID) return [];

        console.log(manuscripts)
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
    }, [manuscripts, selectProjectUID]);

    const newFileMutation = useApiMutation<string, void>(
        `/write/new_manuscript?project_uid=${selectProjectUID}&title=${newFileName}`,
        'PATCH'
    );

    const createNewFile = () => {
        if (!newFileName) return;

        newFileMutation.mutate(undefined, {
            onSuccess: (data) => {
                setSelectManuscriptUID(data);
                setIsNewFileDialogOpen(false)
                setNewFileName("");
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
                    <button
                        className={`flex items-center gap-1 hover:bg-muted/50 w-full p-1 rounded transition-colors ${
                            selectManuscriptUID === item.manuscriptUid ? "bg-muted text-primary" : ""
                        }`}
                        onClick={() => item.manuscriptUid && setSelectManuscriptUID(item.manuscriptUid)}
                    >
                        <File className="h-4 w-4"/>
                        <span>{item.name}</span>
                    </button>
                )}
            </div>
        ))
    }

    return (
        <Collapsible className="relative border-r">
            <CollapsibleTrigger
                className="absolute -right-10 bottom-2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-md transition-transform hover:bg-muted focus:outline-none focus:ring-2 focus:ring-muted focus:ring-offset-2  data-[state=open]:rotate-180">
                <ChevronRight className="h-4 w-4 duration-500"/>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="w-64 h-full flex flex-col bg-muted/10">
                    <header className="h-14 border-b flex items-center justify-between px-4">
                        <span className="font-medium">文件列表</span>
                        <div className="flex gap-2">
                            <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={!selectProjectUID || isLoading}
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
                                    <Button onClick={() => createNewFile()}>创建</Button>
                                </DialogContent>
                            </Dialog>
                            <Button
                                variant="outline"
                                size="icon"
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