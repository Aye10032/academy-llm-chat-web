// 登陆相关
export interface LoginCredentials {
    username: string
    password: string
}

export interface TokenResponse {
    access_token: string
    token_type: string
}

export interface AuthState {
    token: string | null
    user: UserProfile | null
    isAuthenticated: boolean
    setToken: (token: string | null) => void
    setUser: (user: UserProfile | null) => void
    logout: () => void
}

export interface UserProfile {
    email: string,
    username: string,
    is_active: boolean,
    role: number,
    last_knowledge_base: string,
    last_project: string
}

// 对话界面
export interface KnowledgeBase {
    uid: string
    table_name: string;
    table_title: string;
    description: string;
    create_time: string;
    last_update: string;
    is_active: boolean;
}

export interface Message {
    id: string;
    type: 'human' | 'ai';
    content: string;
}

export interface Document {
    content: string;
    metadata: {
        title?: string;
        author?: string;
        year?: number;
        source: Array<{
            source_url: string
            source_type: number
        }>
        score: number
        refer_sentence: string[];
        isReferenced?: boolean;
    };
}

export interface ChatSession {
    chat_uid: string;
    parent_uid: string;
    user_email: string;
    description: string;
    create_time: string;
    update_time: string;
}
