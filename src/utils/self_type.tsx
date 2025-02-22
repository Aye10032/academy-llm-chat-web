// 登陆相关
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
    last_knowledge_base: string
    last_project: string
}

// AI相关通用类型
export interface Message {
    id: string
    type: 'human' | 'ai'
    content: string | Array<TextMessage | Modify>
}

export interface TextMessage {
    content: string
}

export interface Modify {
    original: string
    modified: string
    explanation: string
}

export interface Document {
    content: string
    metadata: {
        title: string
        author?: string
        year?: number
        source: Array<{
            source_url: string
            source_type: number
        }>
        score: number
        refer_sentence: string[]
        isReferenced?: boolean
    };
}

export interface ChatSession {
    uid: string
    parent_uid: string
    user_email: string
    description: string
    create_time: string
    update_time: string
}

// 知识库
export interface KnowledgeBase {
    uid: string
    table_name: string
    table_title: string
    description: string
    create_time: string
    last_update: string
    is_active: boolean
}

// 写作相关
export interface WriteProject {
    uid: string
    user_email: string
    description: string
    last_manuscript: string
    create_time: string
    update_time: string
}

export interface Manuscript {
    uid: string
    project_uid: string
    title: string
    content?: string
    version: number
    is_draft: boolean
}

