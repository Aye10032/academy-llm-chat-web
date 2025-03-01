import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button.tsx"
import {Plus} from "lucide-react"
import {Input} from "@/components/ui/input.tsx"
import {useState} from "react"
import {useApiMutation} from "@/hooks/useApi.ts"
import {projectStore} from "@/utils/self-state.tsx"
import {useNavigate} from "react-router-dom"
import {QueryObserverResult, RefetchOptions} from "@tanstack/react-query";
import {WriteProject} from "@/utils/self_type.tsx";

interface NewProjectDialogProps {
    isNewProjectDialogOpen: boolean
    onNewProjectDialogOpen: (open: boolean) => void
    refresh: (options?: RefetchOptions) => Promise<QueryObserverResult<WriteProject[], Error>>
}

export function NewProjectDialog(
    {
        isNewProjectDialogOpen,
        onNewProjectDialogOpen,
        refresh
    }: NewProjectDialogProps
) {
    const setSelectedProject = projectStore((state)=>state.setSelectedProject)
    const [projectName, setProjectName] = useState<string>("")
    const navigate = useNavigate()

    // 新建项目
    const newProjectMutation = useApiMutation<WriteProject, FormData>(
        `/write/projects`,
        'POST'
    )

    const createNewProject = () => {
        if (!projectName) return

        const formData = new FormData()
        formData.append('description', projectName)

        newProjectMutation.mutate(formData, {
            onSuccess: (data) => {
                onNewProjectDialogOpen(false)
                refresh().then(r =>{
                    if (r.isSuccess){
                        setSelectedProject(data)
                    }
                })
                navigate('/dashboard/write')
            }
        })
    }

    return (
        <Dialog open={isNewProjectDialogOpen} onOpenChange={onNewProjectDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full hover:bg-muted flex items-center gap-2 pl-3 pr-4"
                >
                    <Plus className="h-4 w-4"/>
                    <span className="text-sm">新建项目</span>
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
                    disabled={!projectName}
                >
                    创建
                </Button>
            </DialogContent>
        </Dialog>
    )
}