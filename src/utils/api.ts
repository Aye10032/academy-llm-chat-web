import {KnowledgeBase, LoginCredentials, TokenResponse, UserProfile} from './self_type'
import {isTokenExpired, useAuth} from "@/utils/auth.ts";

export const API_BASE_URL = '/api/v1'

interface FetchOptions extends RequestInit {
    timeout?: number
}

export async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
    const {timeout = 10000, ...fetchOptions} = options

    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal
        })
        clearTimeout(id)

        if (!response.ok) {
            if (response.status === 401) {
                useAuth.getState().logout()
                window.location.href = '/'
            }
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        return response
    } catch (error) {
        clearTimeout(id)
        throw error
    }
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const token = useAuth.getState().token

    if (token && isTokenExpired(token)) {
        useAuth.getState().logout()
        window.location.href = '/'
        throw new Error('Token has expired')
    }

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
        ...options.headers,
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    })

    return response.json()
}

// 认证相关的 API 函数
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
        const formData = new URLSearchParams()
        formData.append('username', credentials.username)
        formData.append('password', credentials.password)

        const response = await fetch(`${API_BASE_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || '登录失败')
        }

        return response.json()
    },

    getCurrentUser: async (): Promise<UserProfile> => {
        return apiClient<UserProfile>('/auth/me/')
    }
}

export const ragApi = {
    getKnowledgeBases: () => apiClient<KnowledgeBase[]>('/rag/knowledge_bases/'),
}