"use client"

import {
    CreditCard,
    LogOut,
    Settings,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenuButton,
    SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar"
import {useAuth} from "@/utils/auth.tsx";
import {useNavigate} from "react-router-dom";
import {UserProfile} from "@/utils/self_type.tsx";
import {kbStore, projectStore} from "@/utils/self-state.tsx";

interface NavProps {
    user: UserProfile
}

export function NavUser({user}: NavProps) {
    const setSelectedKbUID = kbStore(state => state.setSelectedKbUID)
    const setSelectedPrUID = projectStore(state => state.setSelectedPrUID)
    const {logout} = useAuth()
    const {isMobile} = useSidebar()
    const navigate = useNavigate();

    const handleLogout = () => {
        setSelectedKbUID('')
        setSelectedPrUID('')
        logout()
        navigate('/login')
    }

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
                    >
                        <Avatar className="h-8 w-8 rounded-lg bg-orange-100">
                            <AvatarFallback className="rounded-lg text-orange-500 bg-orange-100">
                                {user.username.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-lg bg-orange-100">
                                <AvatarFallback className="rounded-lg text-orange-500 bg-orange-100">
                                    {user.username.slice(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.username}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <CreditCard/>
                            账户概览
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings/>
                            设置
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut/>
                        退出登录
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    )
}
