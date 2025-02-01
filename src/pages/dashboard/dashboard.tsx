import {AppSidebar} from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {useAuth} from "@/utils/auth.ts";
import {useQuery} from "@tanstack/react-query";
import {UserProfile, KnowledgeBase} from "@/utils/self_type.ts";
import {authApi} from "@/utils/api.ts";
import {useNavigate} from "react-router-dom";
import React, {useState, useCallback} from "react";
import {ChatPage} from "@/pages/dashboard/chat-page.tsx";
import {WritePage} from "@/pages/dashboard/write-page.tsx";

interface MainPageProps {
    defaultPage: 'chat' | 'write';
}

export function MainPage({defaultPage}: MainPageProps) {
    const {user, logout} = useAuth()
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState<'chat' | 'write'>(defaultPage)
    const [selectedKbName, setSelectedKb] = useState<string>('')
    const [selectedChatHistoryId, setSelectedChatHistory] = useState<string>('')
    // const [selectedProjectName, setSelectedProject] = useState<string>('')
    // const [selectedWriteHistoryId, setSelectedWriteHistory] = useState<string>('')


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

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // ======================================
    // 子页面切换逻辑处理
    const handlePageChange = useCallback((page: 'chat' | 'write') => {
        setActivePage(page);
        if (page === 'chat') {
            navigate('/c')
        } else if (page === 'write') {
            navigate('/w')
        }
    }, [navigate])

    // ======================问答界面相关======================
    // 响应知识库选择事件
    const handleKnowledgeBaseSelect = useCallback((kb: KnowledgeBase | null) => {
        if (kb) {
            setSelectedKb(kb.table_name);
        } else {
            setSelectedKb('');
        }
    }, []);


    // ======================写作界面相关======================


    if (isLoading) {
        return <div>加载中...</div>
    }

    if (error || !userInfo) {
        return <div>加载失败</div>
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "350px",
                } as React.CSSProperties
            }
        >
            <AppSidebar
                user={userInfo}
                handleLogout={handleLogout}
                activePage={activePage}
                setActivePage={handlePageChange}
                selectedKbName={selectedKbName}
                selectedHistoryId={selectedChatHistoryId}
                onHistorySelect={setSelectedChatHistory}
            />
            <SidebarInset>
                {activePage === 'chat' ? (
                    <ChatPage
                        user={userInfo}
                        onKnowledgeBaseSelect={handleKnowledgeBaseSelect}
                        selectedHistoryId={selectedChatHistoryId}
                    />
                ) : (
                    <WritePage/>
                )}
            </SidebarInset>
        </SidebarProvider>
    )
}