export interface LoginCredentials {
    username: string
    password: string
}

export interface TokenResponse {
    access_token: string
    token_type: string
}

export interface UserProfile {
    email: string
    username: string
    is_active: boolean
    role: number
}

export interface SidebarProps {
    user: UserProfile
    onNavigate: (page: string) => void
    onLogout: () => void
}

export interface KnowledgeBase {
    table_name: string;
    table_title: string;
    description: string;
    create_time: string;
    last_update: string;
    is_active: boolean;
}