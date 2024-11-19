import { useEffect, useState } from 'react'
import { useAuth } from '@/utils/auth'
import axiosInstance from '@/utils/axios'
import { Button } from "@/components/ui/button"

interface UserInfo {
  email: string
  nick_name: string
}

export default function TestPage() {
  const { logout } = useAuth()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 这里需要后端提供一个获取用户信息的接口
        const response = await axiosInstance.get('/auth/user/me')
        setUserInfo(response.data)
      } catch (err) {
        setError('获取用户信息失败')
        console.error('Error fetching user info:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">受保护的测试页面</h1>
        
        {error ? (
          <div className="text-red-500 text-center mb-4">{error}</div>
        ) : userInfo ? (
          <div className="space-y-4">
            <div className="text-gray-700">
              <p><span className="font-semibold">邮箱：</span>{userInfo.email}</p>
              <p><span className="font-semibold">昵称：</span>{userInfo.nick_name}</p>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">测试功能区域</h2>
              <p className="text-gray-600">
                这里可以放置需要登录才能访问的功能
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleLogout}
            variant="destructive"
          >
            退出登录
          </Button>
        </div>
      </div>
    </div>
  )
} 