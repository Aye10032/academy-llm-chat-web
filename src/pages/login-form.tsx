import React, {useState} from 'react'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {EyeIcon, EyeOffIcon} from 'lucide-react'
import {Link, useNavigate} from "react-router-dom";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
            })

            const data = await response.json()

            if (response.ok) {
                // 登录成功，保存token并跳转
                localStorage.setItem('token', data.token)
                navigate('/test')
            } else {
                // 登录失败，显示错误信息
                setError(data.detail || '登录失败，请检查邮箱和密码')
            }
        } catch (err) {
            setError('网络错误，请稍后重试')
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">登录</CardTitle>
                    <CardDescription className="text-center">请输入您的账号信息</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="text-red-500 text-sm text-center">{error}</div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">电子邮箱</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">密码</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="输入您的密码"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-4 w-4 text-gray-500"/>
                                    ) : (
                                        <EyeIcon className="h-4 w-4 text-gray-500"/>
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full">登录</Button>
                        <div className="flex justify-between w-full text-sm">
                            <Link to="/register" className="text-blue-600 hover:underline">
                                注册新账号
                            </Link>
                            <Link to="/forgot-password" className="text-blue-600 hover:underline">
                                忘记密码？
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}