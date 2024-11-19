import React, { useEffect } from 'react'
import LoginForm from './pages/login-form'
import './App.css'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import RegisterForm from './pages/register-form'
import ForgotPasswordForm from './pages/forgot-password-form'
import TestPage from "@/pages/test"
import { useAuth, isTokenExpired } from '@/utils/auth'

// 受保护的路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, logout } = useAuth()

    useEffect(() => {
        if (token && isTokenExpired(token)) {
            logout()
        }
    }, [token, logout])

    if (!token) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <LoginForm />,
        },
        {
            path: "/register",
            element: <RegisterForm />,
        },
        {
            path: "/forgot-password",
            element: <ForgotPasswordForm />,
        },
        {
            path: "/test",
            element: <ProtectedRoute><TestPage /></ProtectedRoute>,
        },
    ])

    return <RouterProvider router={router} />
}

export default App
