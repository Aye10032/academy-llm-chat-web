import {useQuery, useMutation, UseQueryOptions, UseMutationOptions} from '@tanstack/react-query'
import {apiClient} from '../utils/apiClient'

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