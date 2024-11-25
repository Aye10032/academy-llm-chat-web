import React, {useEffect} from 'react'
import './App.css'
import {createBrowserRouter, RouterProvider, Navigate} from 'react-router-dom'
import {useAuth, isTokenExpired} from '@/utils/auth'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {LoginPage} from "@/pages/login/login-page.tsx";
import {RegisterPage} from "@/pages/login/register-page.tsx";
import {ForgotPswPage} from "@/pages/login/forgot-psw-page.tsx";
import TestPage from "@/pages/test.tsx";
import {Page} from "@/pages/dashboard/dashboard.tsx";

// 受保护的路由组件
const ProtectedRoute = ({children}: { children: React.ReactNode }) => {
    const {token, isAuthenticated, logout} = useAuth()

    useEffect(() => {
        // 检查 token 是否过期
        if (token && isTokenExpired(token)) {
            logout()
            return
        }
    }, [token, logout])

    // 如果没有认证，重定向到登录页
    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>
    }

    return <>{children}</>
}

// 公开路由组件
const PublicRoute = ({children}: { children: React.ReactNode }) => {
    const {isAuthenticated} = useAuth()

    // 如果已经认证，重定向到首页
    if (isAuthenticated) {
        return <Navigate to="/" replace/>
    }

    return <>{children}</>
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
})

function App() {
    const router = createBrowserRouter([
        {
            path: "/login",
            element: <PublicRoute><LoginPage/></PublicRoute>,
        },
        {
            path: "/register",
            element: <PublicRoute><RegisterPage/></PublicRoute>,
        },
        {
            path: "/forgot-password",
            element: <PublicRoute><ForgotPswPage/></PublicRoute>,
        },
        {
            path: "/",
            element: <ProtectedRoute><Page/></ProtectedRoute>,
        },
        {
            path: "*",
            element: <Navigate to="/" replace/>,
        }
    ])

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
    )
}

export default App
