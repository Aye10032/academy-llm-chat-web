import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Plus} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {useState} from "react";
import {useApiMutation} from "@/hooks/useApi.ts";
import {projectStore} from "@/utils/self-state.tsx";

interface NewProjectDialogProps {
    isNewProjectDialogOpen: boolean
    onNewProjectDialogOpen: (open: boolean) => void
}

export function NewProjectDialog(
    {
        isNewProjectDialogOpen,
        onNewProjectDialogOpen
    }: NewProjectDialogProps
) {
    const setSelectedPrUID = projectStore((state) => state.setSelectedPrUID)
    const [projectName, setProjectName] = useState<string>("")

    const newProjectMutation = useApiMutation<string, void>(
        `/write/new_project?description=${projectName}`,
        'PATCH'
    );

    const createNewProject = () => {
        if (!projectName) return;
        
        newProjectMutation.mutate(undefined, {
            onSuccess: (data) => {
                setSelectedPrUID(data);
                onNewProjectDialogOpen(false);
                setProjectName("");
            }
        });
    }

    return (
        <Dialog open={isNewProjectDialogOpen} onOpenChange={onNewProjectDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full"
                >
                    <Plus className="h-4 w-4"/>
                    <span className="sr-only">新建聊天</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>新建写作项目</DialogTitle>
                </DialogHeader>
                <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="输入项目名称"
                />
                <Button
                    onClick={() => createNewProject()}
                >创建</Button>
            </DialogContent>
        </Dialog>
    )
}