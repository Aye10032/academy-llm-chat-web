"use client"

import {
    Command, HelpCircle,
    MessageCircleMoreIcon,
    PenLineIcon
} from "lucide-react"
import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter, SidebarGroup, SidebarGroupContent,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar"
import llmLogo from "@/assets/llm-logo1.svg"
import {ChatSidebar} from "@/components/chat/chat-sidebar.tsx";
import {WriteSidebar} from "@/components/write/write-sidebar.tsx";
import * as React from "react";
import {UserProfile} from "@/utils/self_type.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Slider} from "@/components/ui/slider.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {llmConfig} from "@/utils/self-state.tsx";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: UserProfile
    activePage: 'chat' | 'write'
    setActivePage: (page: 'chat' | 'write') => void
}

export function AppSidebar(
    {
        user,
        activePage,
        setActivePage,
    }: AppSidebarProps) {
    const {setOpen} = useSidebar()
    const model = llmConfig((state)=>state.model)
    const setModel = llmConfig((state)=>state.setModel)
    const contextLength = llmConfig((state)=>state.contextLength)
    const setContextLength = llmConfig((state)=>state.setContextLength)
    const temperature = llmConfig((state) => state.temperature)
    const setTemperature = llmConfig((state) => state.setTemperature)

    const llmList = [
        'gpt-4o-mini',
        'gpt-4o',
        'gpt-o3-mini',
        'deepseek-v3',
        'deepseek-r1'
    ]

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
        >

            {/* This is the first sidebar */}
            {/* We disable collapsible and adjust width to icon. */}
            {/* This will make the sidebar appear as icons. */}
            <Sidebar
                collapsible="none"
                className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <a href="#">
                                    <div
                                        className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Command className="size-4"/>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-1.5 md:px-0">
                            <SidebarMenu>
                                <SidebarMenuItem key="rag-qa">
                                    <SidebarMenuButton
                                        tooltip={{
                                            children: "知识库对话",
                                            hidden: false,
                                        }}
                                        onClick={() => {
                                            setActivePage('chat')
                                            setOpen(true)
                                        }}
                                        isActive={activePage === 'chat'}
                                        className="px-2.5 md:px-2"
                                    >
                                        <MessageCircleMoreIcon/>
                                        <span>知识库对话</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem key="write">
                                    <SidebarMenuButton
                                        tooltip={{
                                            children: "写作助手",
                                            hidden: false,
                                        }}
                                        onClick={() => {
                                            setActivePage('write')
                                            setOpen(true)
                                        }}
                                        isActive={activePage === 'write'}
                                        className="px-2.5 md:px-2"
                                    >
                                        <PenLineIcon/>
                                        <span>写作助手</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <NavUser user={user}/>
                </SidebarFooter>
            </Sidebar>

            {/* This is the second sidebar */}
            {/* We disable collapsible and let it fill remaining space */}
            <Sidebar collapsible="none" className="hidden flex-1 md:flex">
                <SidebarHeader className="border-b p-4">
                    <div className="h-full w-full transition-opacity duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0">
                        <img
                            src={llmLogo}
                            alt="Academic LLM Chat Logo"
                            className="h-full w-full object-contain px-2 py-3"
                        />
                    </div>
                </SidebarHeader>
                {activePage === 'chat' ? (
                    <ChatSidebar/>
                ) : (
                    <WriteSidebar/>
                )}
                <SidebarSeparator/>
                <SidebarFooter className='flex-col h-[28%] px-1 py-2 space-y-4'>
                    <div className='w-full max-w-sm space-y-4 px-4'>
                        <Label className='text-sm font-medium'>选择对话大模型</Label>
                        <Select defaultValue={model} onValueChange={setModel}>
                            <SelectTrigger className="w-full bg-white pl-3.5 text-left">
                                <SelectValue placeholder="Select a fruit"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {llmList.map((model) => (
                                        <SelectItem key={model} value={model}>
                                            {model}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full max-w-sm space-y-4 px-4">
                        <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">上下文长度</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs text-sm">
                                            模型会截取多少个对话消息进行分析，越长的上下文能保留更多的信息，但是同时也意味着更多的token消耗和遗忘概率的增大
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="ml-auto text-sm text-muted-foreground">{contextLength[0]}</span>
                        </div>
                        <Slider
                            value={contextLength}
                            onValueChange={setContextLength}
                            max={10}
                            min={1}
                            step={1}
                            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                        />
                    </div>
                    <div className="w-full max-w-sm space-y-4 px-4">
                        <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">模型温度</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs text-sm">
                                            温度控制输出的随机性。较高的值会使输出更加随机，较低的值会使其更加集中和确定。
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="ml-auto text-sm text-muted-foreground">{temperature[0].toFixed(2)}</span>
                        </div>
                        <Slider
                            value={temperature}
                            onValueChange={setTemperature}
                            max={1}
                            step={0.1}
                            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                        />
                    </div>
                </SidebarFooter>
            </Sidebar>
        </Sidebar>
    )
}
