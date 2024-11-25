"use client"

import * as React from "react"
import {
    MessageCircleMore,
    PenLine
} from "lucide-react"

import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter, SidebarGroup,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import {UserProfile} from "@/utils/self_type.ts";
import llmLogo from "@/assets/llm-logo1.svg"
import logoOnly from "@/assets/logo_only.svg"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: UserProfile;
    handleLogout: () => void;
}

export function AppSidebar({user, handleLogout, ...props}: AppSidebarProps) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="relative w-full">
                    <div className="h-full w-full transition-opacity duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0">
                        <img
                            src={llmLogo}
                            alt="Academic LLM Chat Logo"
                            className="h-full w-full object-contain px-2"
                        />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-1.5 rounded-md transition-colors duration-300 group-data-[collapsible=icon]:bg-gray-100">
                            <img
                                src={logoOnly}
                                alt="Academic LLM Chat Icon"
                                className="h-8 w-8 opacity-0 transition-opacity duration-300 ease-in-out group-data-[collapsible=icon]:opacity-100"
                            />
                        </div>
                    </div>
                </div>
                <SidebarGroup>
                    <SidebarMenu className="gap-2">
                        <SidebarMenuItem key="rag-qa">
                            <SidebarMenuButton asChild className="text-gray-950">
                                <a href="#">
                                    <MessageCircleMore/>
                                    <span>知识库对话</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem key="write">
                            <SidebarMenuButton asChild className="text-gray-950">
                                <a href="#">
                                    <PenLine/>
                                    <span>写作助手</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent>
                {/*TODO*/}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} handleLogout={handleLogout}/>
            </SidebarFooter>
        </Sidebar>
    )
}
