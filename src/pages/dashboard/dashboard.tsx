import {AppSidebar} from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {useAuth} from "@/utils/auth.ts";
import {useQuery} from "@tanstack/react-query";
import {UserProfile} from "@/utils/self_type.ts";
import {authApi} from "@/utils/api.ts";
import {useNavigate} from "react-router-dom";
import React from "react";
import {ChatPage} from "@/pages/dashboard/chat/chat-page.tsx";
import {WritePage} from "@/pages/dashboard/write-page.tsx";

export function MainPage() {
    const {user, logout} = useAuth()
    const navigate = useNavigate()
    const [activePage, setActivePage] = React.useState<'chat' | 'write'>('chat')
    const [selectedKbName, setSelectedKbName] = React.useState<string>()
    const [selectedChatHistory, setSelectedChatHistory] = React.useState<string>();

    // 使用 React Query 和 authApi.getCurrentUser
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

    // 处理选择对话的回调
    const handleChatSelect = (chatHistory: string) => {
        setSelectedChatHistory(chatHistory);
    };

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
                setActivePage={setActivePage}
                selectedKbName={selectedKbName}
                selectedChatHistory={selectedChatHistory}
                onChatSelect={handleChatSelect}
            />
            <SidebarInset>
                {activePage === 'chat' ? (
                    <ChatPage 
                        user={userInfo} 
                        onKnowledgeBaseSelect={(kb) => setSelectedKbName(kb?.table_name)}
                        selectedChatHistory={selectedChatHistory}
                    />
                ) : (
                    <WritePage />
                )}
            </SidebarInset>
        </SidebarProvider>
    )
}