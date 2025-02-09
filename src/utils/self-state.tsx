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
    selectProjectTitle: string
    selectedChatUID: string
    selectManuscriptUID: string
    setSelectProjectUID: (uid: string) => void
    setSelectProjectTitle: (uid: string) => void
    setSelectedChatUID: (uid: string) => void
    setSelectManuscriptUID: (uid: string) => void
}

export const projectStore = create<ProjectState>((set) => ({
    selectProjectUID: '',
    selectProjectTitle: '',
    selectedChatUID: '',
    selectManuscriptUID: '',
    setSelectProjectUID: (uid: string) => set({selectProjectUID: uid}),
    setSelectProjectTitle: (title: string) => set({selectProjectTitle: title}),
    setSelectedChatUID: (uid: string) => set({selectedChatUID: uid}),
    setSelectManuscriptUID: (uid: string) => set({selectManuscriptUID: uid})
}))