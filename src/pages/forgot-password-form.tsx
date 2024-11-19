import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Link } from "react-router-dom";

export default function ForgotPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">重置密码</CardTitle>
          <CardDescription className="text-center">请输入您的邮箱和新密码</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">电子邮箱</Label>
            <Input id="email" type="email" placeholder="your@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">新密码</Label>
            <div className="relative">
              <Input 
                id="newPassword" 
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
                  <EyeOffIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full">重置密码</Button>
          <div className="text-sm text-center">
            记起密码了？
            <Link to="/" className="text-blue-600 hover:underline ml-1">
              返回登录
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}