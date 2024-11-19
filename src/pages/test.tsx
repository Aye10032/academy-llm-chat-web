import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TestPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">登录成功！</h1>
        <p>这是测试页面</p>
      </div>
    </div>
  )
} 