import { create } from 'zustand'

interface AuthState {
    token: string | null
    isAuthenticated: boolean
    setToken: (token: string | null) => void
    logout: () => void
}

// 创建认证状态管理
export const useAuth = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    setToken: (token: string | null) => {
        if (token) {
            localStorage.setItem('token', token)
            set({ token, isAuthenticated: true })
        } else {
            localStorage.removeItem('token')
            set({ token: null, isAuthenticated: false })
        }
    },
    logout: () => {
        localStorage.removeItem('token')
        set({ token: null, isAuthenticated: false })
    }
}))

// Token 过期时间检查
export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const exp = payload.exp * 1000 // 转换为毫秒
        return Date.now() >= exp
    } catch {
        return true
    }
} 