import {useQuery, useMutation, UseQueryOptions, UseMutationOptions} from '@tanstack/react-query'
import {apiClient} from '@/utils/api'
import {useAuth} from "@/utils/auth";
import {API_BASE_URL} from "@/utils/api";

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

// 用于普通 POST/PUT/DELETE 请求的 hook
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

// 用于响应 SSE 请求的 hook
export function useSseQuery<TVariables>(
    endpoint: string,
    options?: Omit<UseMutationOptions<Response, Error, TVariables>, 'mutationFn'>
) {
    return useMutation<Response, Error, TVariables>({
        mutationFn: async (variables) => {
            const token = useAuth.getState().token;
            
            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    useAuth.getState().logout();
                    window.location.href = '/';
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Network response was not ok');
            }

            return response;
        },
        ...options,
    });
}