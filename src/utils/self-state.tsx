import {create} from 'zustand'

interface KbState {
    selectedKbUID: string
    selectedChatUID: string
    setSelectedKbUID: (uid: string) => void
    setSelectedChatUID: (uid: string) => void
}

export const kbStore = create<KbState>((set) => ({
    selectedKbUID: '',
    selectedChatUID: '',
    setSelectedKbUID: (uid: string) => set({selectedKbUID: uid}),
    setSelectedChatUID: (uid: string) => set({selectedChatUID: uid})
}));

interface ProjectState {
    selectProjectUID: string
    selectedChatUID: string
    selectManuscriptUID: string
    setSelectProjectUID: (uid: string) => void
    setSelectedChatUID: (uid: string) => void
    setSelectManuscriptUID: (uid: string) => void
}

export const projectStore = create<ProjectState>((set) => ({
    selectProjectUID: '',
    selectedChatUID: '',
    selectManuscriptUID: '',
    setSelectProjectUID: (uid: string) => set({selectProjectUID: uid}),
    setSelectedChatUID: (uid: string) => set({selectedChatUID: uid}),
    setSelectManuscriptUID: (uid: string) => set({selectManuscriptUID: uid})
}))