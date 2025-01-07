import React, {useState} from 'react'
import {Button} from "@/components/ui/button.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Label} from "@/components/ui/label.tsx"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card.tsx"
import {EyeIcon, EyeOffIcon} from 'lucide-react'
import {Link, useNavigate} from "react-router-dom"
import {useAuth} from '@/utils/auth.ts'
import {authApi} from "@/utils/api.ts";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const {setToken, setUser} = useAuth()

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const tokenResponse = await authApi.login({
                username: email,
                password: password
            })
            setToken(tokenResponse.access_token)

            // 获取用户信息
            const userProfile = await authApi.getCurrentUser()
            setUser(userProfile)

            navigate('/')
        } catch (err) {
            setError(err instanceof Error ? err.message : '网络错误，请稍后重试')
            console.error('Login error:', err)
        }
    }

    return (
        <Card className="mx-auto w-96">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="text-2xl">登录</CardTitle>
                    <CardDescription>
                        输入邮箱密码以登录
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label className="text-left font-semibold" htmlFor="email">邮箱</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label className="font-semibold" htmlFor="password">密码</Label>
                                <Link to="/forgot-password" className="ml-auto inline-block text-sm underline">
                                    忘记密码？
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2"
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-4 w-4 text-gray-500"/>
                                    ) : (
                                        <EyeIcon className="h-4 w-4 text-gray-500"/>
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="mt-2">
                            登录
                        </Button>
                        <div className="text-center text-sm">
                            没有账户？{" "}
                            <Link to="/register" className="underline">
                                注册
                            </Link>
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm text-center">{error}</div>
                        )}
                    </div>
                </CardContent>
            </form>
        </Card>
    )
}