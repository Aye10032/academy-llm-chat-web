import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar.tsx"
import {EllipsisVertical} from "lucide-react";
import React, {useState} from "react";
import {NewProjectDialog} from "@/components/write/new-project-form.tsx";
import {useApiMutation, useApiQuery} from "@/hooks/useApi.ts";
import {WriteProject} from "@/utils/self_type.tsx";
import {groupItemsByPeriod} from "@/utils/sort.tsx";
import {projectStore} from "@/utils/self-state.tsx";
import {format} from "date-fns";
import {zhCN} from "date-fns/locale";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";

// const writeOptions = [
//     {value: "article", label: "文章"},
//     {value: "essay", label: "论文"},
//     {value: "report", label: "报告"},
//     {value: "story", label: "故事"},
// ]

export function WriteSidebar() {
    const selectedPrUID = projectStore((state) => state.selectedPrUID)
    const setSelectedProject = projectStore((state) => state.setSelectedProject)
    const setSelectedPrUID = projectStore((state) => state.setSelectedPrUID)

    const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState<boolean>(false)
    const [hoveredProject, setHoveredProject] = useState<string | null>(null);
    const [deleteID, setDeleteID] = useState<string | null>(null)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const navigate = useNavigate()

    // 删除对话请求
    const deleteProjectMutation = useApiMutation<string, void>(
        `/write/projects/${deleteID}`,
        'DELETE',
    )

    // 获取工程列表
    const {data: projects, isLoading: projectLoading, refetch} = useApiQuery<WriteProject[]>(
        ['write'],
        '/write/projects'
    )
    const groupedProjects = projects ? groupItemsByPeriod(projects) : {};

    const handleMoreClick = (e: React.MouseEvent, chatId: string) => {
        e.preventDefault()
        e.stopPropagation()
        setOpenMenuId(prevId => prevId === chatId ? null : chatId)
    }

    const handleProjectClick = (project: WriteProject) => {
        setSelectedProject(project)
        setHoveredProject(null); // 清除悬停状态
        setOpenMenuId(null);  // 关闭下拉菜单
    };

    const handleDeleteClick = async (projectId: string) => {
        try {
            setDeleteID(projectId)
            await deleteProjectMutation.mutateAsync()
            setDeleteID(null)

            // 刷新对话列表
            await refetch()

            setOpenMenuId(null)
            // 如果删除的是当前选中的对话，清空选中状态
            if (projectId === selectedPrUID) {
                setSelectedPrUID("")
                navigate('/dashboard/write')
            }
        } catch (error) {
            console.error('Failed to delete chat:', error)
        }
    }

    if (projectLoading) {
        return (
            <SidebarContent className="px-1 py-2">
                <NewProjectDialog
                    isNewProjectDialogOpen={isNewProjectDialogOpen}
                    onNewProjectDialogOpen={setIsNewProjectDialogOpen}
                    refresh={refetch}
                />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {Array.from({length: 24}).map((_, index) => (
                        <div
                            key={index}
                            className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                        />
                    ))}
                </div>
            </SidebarContent>
        )
    }

    return (
        <SidebarContent className="px-1 py-2">
            <div className="p-4 space-y-4">
                <NewProjectDialog
                    isNewProjectDialogOpen={isNewProjectDialogOpen}
                    onNewProjectDialogOpen={setIsNewProjectDialogOpen}
                    refresh={refetch}
                />
            </div>

            {Object.entries(groupedProjects).map(([period, periodProjects]) => (
                <SidebarGroup key={period}>
                    <SidebarGroupLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        {period}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {periodProjects.map((project) => (
                                <SidebarMenuItem
                                    key={project.uid}
                                    onMouseEnter={() => setHoveredProject(project.uid)}
                                    onMouseLeave={() => setHoveredProject(null)}
                                    onClick={() => handleProjectClick(project)}
                                    className={project.uid === selectedPrUID ? 'bg-accent' : ''}
                                >
                                    <SidebarMenuButton asChild className="h-auto py-3 px-2 text-sm font-medium w-full text-left">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col items-start gap-1 flex-grow min-w-0">
                                                <span className="truncate w-full pr-4">{project.description}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(project.update_time), "MM月dd日 HH:mm", {locale: zhCN})}
                                                </span>
                                            </div>
                                            {(hoveredProject === project.uid || openMenuId === project.uid) && (
                                                <DropdownMenu open={openMenuId === project.uid}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => handleMoreClick(e, project.uid)}
                                                        >
                                                            <EllipsisVertical className="h-4 w-4"/>
                                                            <span className="sr-only">打开菜单</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        onInteractOutside={() => setOpenMenuId(null)}
                                                    >
                                                        <DropdownMenuItem>重命名</DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteClick(project.uid)}>删除</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </SidebarContent>
    )
}

