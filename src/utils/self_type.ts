import * as React from "react";
import {Sidebar} from "@/components/ui/sidebar.tsx";

export interface LoginCredentials {
    username: string
    password: string
}

export interface TokenResponse {
    access_token: string
    token_type: string
}

export interface UserProfile {
    email: string,
    username: string,
    is_active: boolean,
    role: number,
    last_knowledge_base: string,
    last_project: string
}

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: UserProfile;
    handleLogout: () => void;
    activePage: 'chat' | 'write';
    setActivePage: (page: 'chat' | 'write') => void;
    selectedKbName?: string;
    selectedHistoryId?: string;
    onHistorySelect?: (historyId: string) => void;
}

export interface ChatSidebarProps {
    selectedKbName?: string;
    onHistorySelect?: (chatHistory: string) => void;
    selectedHistoryId?: string;
}

export interface ChatPageProps {
    user: UserProfile;
    onKnowledgeBaseSelect?: (kb: KnowledgeBase | null) => void;
    selectedHistoryId?: string;
}

export interface DocumentSidebarProps {
    documents: Document[]
    isOpen: boolean
    onToggle: () => void
    activeDocIndex?: number
}

export interface KnowledgeBase {
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
        source: string;
        source_type: number;
        score: number;
        refer_sentence: string[];
        isReferenced?: boolean;
    };
}

export interface ChatSession {
    history_id: string;
    knowledge_base_name: string;
    user_email: string;
    description: string;
    create_time: string;
    update_time: string;
}
