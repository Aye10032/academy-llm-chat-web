export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    access_token: string
    token_type: string
}

export interface UserInfo {
    email: string
    nick_name: string
}

export interface SidebarProps {
    user: UserInfo
    onNavigate: (page: string) => void
    onLogout: () => void
}