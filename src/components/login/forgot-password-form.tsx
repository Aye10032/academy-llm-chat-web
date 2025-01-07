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
import {Link} from "react-router-dom";

export default function ForgotPasswordForm() {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => setShowPassword(!showPassword)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // TODO
    }

    return (
        <Card className="mx-auto w-96">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="text-2xl">重置密码</CardTitle>
                    <CardDescription>请输入您的邮箱和新密码</CardDescription>
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
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-left font-semibold" htmlFor="password">新密码</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="输入您的新密码"
                                    required
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
                            重置密码
                        </Button>
                        <div className="text-center text-sm">
                            记起密码了？{" "}
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