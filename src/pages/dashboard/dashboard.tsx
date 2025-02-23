import {AppSidebar} from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {useAuth} from "@/utils/auth.tsx";
import {useQuery} from "@tanstack/react-query";
import {UserProfile} from "@/utils/self_type.tsx";
import {authApi} from "@/utils/api.tsx";
import {useNavigate} from "react-router-dom";
import React, {useState, useCallback} from "react";
import {ChatPage} from "@/pages/dashboard/chat-page.tsx";
import {WritePage} from "@/pages/dashboard/write-page.tsx";
import {kbStore, projectStore} from "@/utils/self-state.tsx";
import {SettingPage} from "@/pages/dashboard/setting-page.tsx";
import {InfoPage} from "@/pages/dashboard/info-page.tsx";

interface MainPageProps {
    defaultPage: 'chat' | 'write' | 'about' | 'setting';
}

export function MainPage({defaultPage}: MainPageProps) {
    const user = useAuth((state) => state.user)
    const kbChatUID = kbStore((state) => state.kbChatUID)
    const prChatUID = projectStore((state) => state.prChatUID)
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState<'chat' | 'write' | 'about' | 'setting'>(defaultPage)


    // ======================================
    // 用户信息认证初始化和登出逻辑处理
    const {
        data: userInfo,
        isLoading,
        error
    } = useQuery<UserProfile>({
        queryKey: ['user'],
        queryFn: authApi.getCurrentUser,
        initialData: user || undefined,
        enabled: !!useAuth.getState().token
    })

    // ======================================
    // 子页面切换逻辑处理
    const handlePageChange = useCallback((page: 'chat' | 'write' | 'about' | 'setting') => {
        if (activePage === page) return

        setActivePage(page)
        if (page === 'chat') {
            if (!kbChatUID) {
                navigate('/dashboard/chat')
            } else {
                navigate(`/dashboard/chat/${kbChatUID}`)
            }
        } else if (page === 'write') {
            if (!prChatUID) {
                navigate('/dashboard/write')
            } else {
                navigate(`/dashboard/write/${prChatUID}`)
            }

        } else if (page === 'setting') {
            navigate('/setting')
        } else if (page === 'about') {
            navigate('/about')
        }
    }, [activePage, navigate, kbChatUID, prChatUID])


    if (isLoading) {
        return <div>加载中...</div>
    }

    if (error || !userInfo) {
        return <div>加载失败</div>
    }

    return (
        (activePage === "about" || activePage === 'setting') ? (
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "48px",
                    } as React.CSSProperties
                }
            >
                <AppSidebar
                    user={userInfo}
                    activePage={activePage}
                    setActivePage={handlePageChange}
                />
                <SidebarInset className="overflow-hidden">
                    {activePage === 'setting' ? (
                        <SettingPage/>
                    ) : (
                        <InfoPage/>
                    )}
                </SidebarInset>
            </SidebarProvider>
        ) : (
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "350px",
                    } as React.CSSProperties
                }
            >
                <AppSidebar
                    user={userInfo}
                    activePage={activePage}
                    setActivePage={handlePageChange}
                />
                <SidebarInset className="overflow-hidden">
                    {activePage === 'chat' ? (
                        <ChatPage
                            user={userInfo}
                        />
                    ) : (
                        <WritePage/>
                    )}
                </SidebarInset>
            </SidebarProvider>
        )
    )
}