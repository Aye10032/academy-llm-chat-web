import {AppSidebar} from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {useAuth} from "@/utils/auth.ts";
import {useQuery} from "@tanstack/react-query";
import {UserProfile, KnowledgeBase} from "@/utils/self_type.ts";
import {authApi} from "@/utils/api.ts";
import {useNavigate, useParams} from "react-router-dom";
import React, {useCallback} from "react";
import {ChatPage} from "@/pages/dashboard/chat/chat-page.tsx";
import {WritePage} from "@/pages/dashboard/write-page.tsx";

interface MainPageProps {
    defaultPage?: 'chat' | 'write';
}

export function MainPage({defaultPage = 'chat'}: MainPageProps) {
    const {user, logout} = useAuth()
    const {historyId} = useParams();
    const navigate = useNavigate();
    const [activePage, setActivePage] = React.useState<'chat' | 'write'>(defaultPage)
    const [selectedKbName, setSelectedKbName] = React.useState<string>()
    const [selectedHistoryId, setSelectedHistoryId] = React.useState<string>();

    // 当 URL 中的 historyId 参数改变时，更新选中的对话
    React.useEffect(() => {
        if (historyId) {
            setSelectedHistoryId(historyId);
        }
    }, [historyId]);

    // 修改 setActivePage 的处理逻辑
    const handlePageChange = React.useCallback((page: 'chat' | 'write') => {
        setActivePage(page);
        if (page === 'chat') {
            navigate('/c');
        } else if (page === 'write') {
            navigate('/w');
        }
    }, [navigate]);

    // 处理选择对话的回调
    const handleHistorySelect = (historyId: string) => {
        setSelectedHistoryId(historyId);
        navigate(`/c/${historyId}`);
    };

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

    // 修改 handleKnowledgeBaseSelect 的实现
    const handleKnowledgeBaseSelect = useCallback((kb: KnowledgeBase | null) => {
        setSelectedKbName(kb?.table_name);
        // 当切换知识库时，清除当前选中的对话
        setSelectedHistoryId(undefined);
        // 如果在聊天页面且切换到了新的知识库，则导航到基础路径
        if (activePage === 'chat' && kb) {
            navigate('/c');
        }
    }, [activePage, navigate]);

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
                selectedHistoryId={selectedHistoryId}
                onHistorySelect={handleHistorySelect}
            />
            <SidebarInset>
                {activePage === 'chat' ? (
                    <ChatPage 
                        user={userInfo} 
                        onKnowledgeBaseSelect={handleKnowledgeBaseSelect}
                        selectedHistoryId={selectedHistoryId}
                    />
                ) : (
                    <WritePage />
                )}
            </SidebarInset>
        </SidebarProvider>
    )
}