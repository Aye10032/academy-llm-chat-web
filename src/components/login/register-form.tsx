import React, {useState} from 'react'
import {Button} from "@/components/ui/button.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Label} from "@/components/ui/label.tsx"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card.tsx"
import {EyeIcon, EyeOffIcon} from 'lucide-react'
import {Link, useNavigate} from "react-router-dom";
import {cn} from "@/lib/utils.ts"
import {useApiMutation} from "@/hooks/useApi.ts";

export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordsMatch, setPasswordsMatch] = useState(true)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [error, setError] = useState('')

    const navigate = useNavigate();

    const togglePasswordVisibility = () => setShowPassword(!showPassword)
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

    const calculatePasswordStrength = (password: string) => {
        let strength = 0
        if (password.length > 6) strength += 20
        if (password.match(/[a-z]+/)) strength += 20
        if (password.match(/[A-Z]+/)) strength += 20
        if (password.match(/[0-9]+/)) strength += 20
        if (password.match(/[$@#&!]+/)) strength += 20
        return strength
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value
        setPassword(newPassword)
        setPasswordStrength(calculatePasswordStrength(newPassword))
        setPasswordsMatch(confirmPassword === newPassword)
    }

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newConfirmPassword = e.target.value
        setConfirmPassword(newConfirmPassword)
        setPasswordsMatch(newConfirmPassword === password)
    }

    const registryMutation = useApiMutation<string, FormData>(
        `/user`,
        'POST',
        {
            onError: (error) => {
                setError(error.message);
            },
            onSuccess: () => {
                navigate('/login');
            }
        }
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('email', email)
        formData.append('username', username)
        formData.append('password', password)

        registryMutation.mutate(formData)
    }

    return (
        <Card className="mx-auto w-96">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="text-2xl">注册</CardTitle>
                    <CardDescription>创建新的账号</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label className="text-left font-semibold" htmlFor="username">用户名</Label>
                            <Input 
                                id="username" 
                                placeholder="输入您的用户名" 
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
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
                                <p className="ml-auto inline-block text-sm text-gray-500">
                                    密码强度:
                                    <span className={cn(
                                        "ml-1 font-medium",
                                        passwordStrength <= 33 ? "text-red-500" : "",
                                        passwordStrength > 33 && passwordStrength <= 66 ? "text-yellow-500" : "",
                                        passwordStrength > 66 ? "text-green-500" : ""
                                    )}>
                                    {passwordStrength <= 33 ? "弱" : passwordStrength <= 66 ? "中等" : "强"}
                                  </span>
                                </p>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="输入您的密码"
                                    required
                                    value={password}
                                    onChange={handlePasswordChange}
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

                        <div className="grid gap-2">
                            <Label className="text-left font-semibold" htmlFor="confirmPassword">确认密码</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="再次输入您的密码"
                                    required
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOffIcon className="h-4 w-4 text-gray-500"/>
                                    ) : (
                                        <EyeIcon className="h-4 w-4 text-gray-500"/>
                                    )}
                                </button>
                            </div>
                            {!passwordsMatch && confirmPassword !== '' && (
                                <p className="text-sm text-red-500">密码不匹配</p>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-2 text-sm text-red-500 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="mt-2"
                            disabled={!passwordsMatch || password === '' || confirmPassword === ''}
                        >
                            注册
                        </Button>
                        <div className="text-center text-sm">
                            已有账号？{" "}
                            <Link to="/login" className="underline">
                                返回登录
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </form>
        </Card>
    )
}