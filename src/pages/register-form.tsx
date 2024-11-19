import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Link } from "react-router-dom";
// import { Progress } from "@/components/ui/progress" // Removed Progress import
import { cn } from "@/lib/utils"

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('') // Added confirmPassword state
  const [passwordsMatch, setPasswordsMatch] = useState(true) // Added passwordsMatch state
  const [passwordStrength, setPasswordStrength] = useState(0)

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
    setPasswordsMatch(confirmPassword === newPassword) // Update passwordsMatch when password changes
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Added handleConfirmPasswordChange function
    const newConfirmPassword = e.target.value
    setConfirmPassword(newConfirmPassword)
    setPasswordsMatch(newConfirmPassword === password)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">注册</CardTitle>
          <CardDescription className="text-center">创建您的新账号</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input id="username" placeholder="输入您的用户名" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">电子邮箱</Label>
            <Input id="email" type="email" placeholder="your@email.com" required />
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
                onChange={handlePasswordChange}
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
            <p className="text-sm text-gray-500"> {/* Removed Progress component */}
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
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
                  <EyeOffIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            {!passwordsMatch && confirmPassword !== '' && ( // Added password mismatch message
              <p className="text-sm text-red-500">密码不匹配</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" disabled={!passwordsMatch || password === '' || confirmPassword === ''}> {/* Updated Button to disable if passwords don't match */}
            注册
          </Button>
          <div className="text-sm text-center">
            已有账号？ 
            <Link to="/" className="text-blue-600 hover:underline ml-1">
              登录
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}