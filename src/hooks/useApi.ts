import {useQuery, useMutation, UseQueryOptions, UseMutationOptions} from '@tanstack/react-query'
import {apiClient} from '@/utils/apiClient'
import { LoginCredentials, TokenResponse, UserProfile } from '@/utils/self_type'

// 用于 GET 请求的 hook
export function useApiQuery<T>(
    queryKey: string[],
    endpoint: string,
    options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<T, Error>({
        queryKey,
        queryFn: () => apiClient<T>(endpoint),
        ...options,
    })
}

// 用于 POST/PUT/DELETE 等修改操作的 hook
export function useApiMutation<TData, TVariables>(
    endpoint: string,
    method: string,
    options?: UseMutationOptions<TData, Error, TVariables>
) {
    return useMutation<TData, Error, TVariables>({
        mutationFn: (variables) =>
            apiClient<TData>(endpoint, {
                method,
                body: JSON.stringify(variables),
            }),
        ...options,
    })
}

// 认证相关的 API 函数
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
        const formData = new URLSearchParams()
        formData.append('username', credentials.username)
        formData.append('password', credentials.password)
        
        const response = await fetch('/api/v1/auth/token', {
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
        return apiClient<UserProfile>('/auth/users/me/')
    }
}