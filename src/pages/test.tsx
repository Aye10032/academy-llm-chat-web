import {useAuth} from '@/utils/auth'
import {useQuery} from '@tanstack/react-query'
import {authApi} from '@/utils/api'
import {UserProfile} from '@/utils/self_type'
import {Button} from "@/components/ui/button"

export default function TestPage() {
    const {user, logout} = useAuth()

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
    }

    if (isLoading) {
        return <div>加载中...</div>
    }

    if (error || !userInfo) {
        return <div>加载失败</div>
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">测试页面</h1>
            <div className="space-y-4">
                <div>
                    <p>用户名: {userInfo.username}</p>
                    <p>邮箱: {userInfo.email}</p>
                    <p>角色: {userInfo.role}</p>
                </div>
                <Button onClick={handleLogout}>
                    登出
                </Button>
            </div>
        </div>
    )
} 