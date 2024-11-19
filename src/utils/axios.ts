import axios from 'axios'
import { useAuth, isTokenExpired } from './auth'

const axiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

// 请求拦截器
axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuth.getState().token
        
        if (token) {
            if (isTokenExpired(token)) {
                useAuth.getState().logout()
                window.location.href = '/'
                return Promise.reject('Token has expired')
            }
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuth.getState().logout()
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

export default axiosInstance 