import {create} from 'zustand'
import {UserProfile} from './self_type'

interface AuthState {
    token: string | null
    user: UserProfile | null
    isAuthenticated: boolean
    setToken: (token: string | null) => void
    setUser: (user: UserProfile | null) => void
    logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: !!localStorage.getItem('token'),
    setToken: (token: string | null) => {
        if (token) {
            localStorage.setItem('token', token)
            set({token, isAuthenticated: true})
        } else {
            localStorage.removeItem('token')
            set({token: null, isAuthenticated: false})
        }
    },
    setUser: (user: UserProfile | null) => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
            set({user})
        } else {
            localStorage.removeItem('user')
            set({user: null})
        }
    },
    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({token: null, user: null, isAuthenticated: false})
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