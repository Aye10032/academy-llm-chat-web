import {create} from 'zustand'

interface KbState {
    selectedKbUID: string
    setSelectedKbUID: (uid: string) => void
}

export const kbStore = create<KbState>((set) => ({
    selectedKbUID: '',
    setSelectedKbUID: (uid: string) => set({selectedKbUID: uid}),
}));

interface ProjectState {
    selectProjectUID: string
    setSelectProjectUID: (uid: string) => void
}

export const projectStore = create<ProjectState>((set) => ({
    selectProjectUID: '',
    setSelectProjectUID: (uid: string) => set({selectProjectUID: uid})
}))

interface ChatState {
    selectedChatUID: string
    setSelectedChatUID: (chatUID: string) => void
}

export const chatStore = create<ChatState>((set) => ({
    selectedChatUID: '',
    setSelectedChatUID: (uid: string) => set({selectedChatUID: uid})
}))