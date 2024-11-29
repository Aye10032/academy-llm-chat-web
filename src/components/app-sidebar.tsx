"use client"

import * as React from "react"
import {
    Command,
    MessageCircleMoreIcon,
    PenLineIcon
} from "lucide-react"

import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter, SidebarGroup, SidebarGroupContent,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar"
import {UserProfile} from "@/utils/self_type.ts";
import llmLogo from "@/assets/llm-logo1.svg"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: UserProfile;
    handleLogout: () => void;
}

export function AppSidebar({user, handleLogout, ...props}: AppSidebarProps) {
    // Note: I'm using state to show active item.
    // IRL you should use the url/router.
    const {setOpen} = useSidebar()

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
            {...props}
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
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Command className="size-4" />
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
                                            setOpen(true)
                                        }}
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
                                            setOpen(true)
                                        }}
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
                    <NavUser user={user} handleLogout={handleLogout}/>
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
                            className="h-full w-full object-contain px-2"
                        />
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="px-0">

                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </Sidebar>
    )
}
