import React, {useEffect} from 'react'
import './App.css'
import {createBrowserRouter, RouterProvider, Navigate} from 'react-router-dom'
import Dashboard from './pages/dashboard'
import {useAuth, isTokenExpired} from '@/utils/auth'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {LoginPage} from "@/pages/login/login-page.tsx";
import {RegisterPage} from "@/pages/login/register-page.tsx";
import {ForgotPswPage} from "@/pages/login/forgot-psw-page.tsx";

// 受保护的路由组件
const ProtectedRoute = ({children}: { children: React.ReactNode }) => {
    const {token, logout} = useAuth()

    useEffect(() => {
        if (token && isTokenExpired(token)) {
            logout()
        }
    }, [token, logout])

    if (!token) {
        return <Navigate to="/login" replace/>
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
            element: <LoginPage/>,
        },
        {
            path: "/register",
            element: <RegisterPage/>,
        },
        {
            path: "/forgot-password",
            element: <ForgotPswPage/>,
        },
        {
            path: "/",
            element: <ProtectedRoute><Dashboard/></ProtectedRoute>,
        }
    ])

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
    )
}

export default App
