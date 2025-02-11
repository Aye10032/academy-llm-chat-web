import {create} from 'zustand'
import {WriteProject} from "@/utils/self_type.tsx";

interface KbState {
    selectedKbUID: string
    kbChatUID: string
    canCreateChat: boolean
    setSelectedKbUID: (uid: string) => void
    setKBChatUID: (uid: string) => void
    setCanCreateChat: (flag: boolean) => void
}

export const kbStore = create<KbState>((set) => ({
    selectedKbUID: '',
    kbChatUID: '',
    canCreateChat: true,
    setSelectedKbUID: (uid: string) => set({selectedKbUID: uid}),
    setKBChatUID: (uid: string) => set({kbChatUID: uid}),
    setCanCreateChat: (flag: boolean) => set({canCreateChat: flag})
}));

interface ProjectState {
    selectedPrUID: string
    selectedPrTitle: string
    selectedPrCheckpoint: string
    prChatUID: string
    selectedManuscriptUID: string
    setSelectedPrUID: (uid: string) => void
    setSelectedProject: (project: WriteProject) => void
    setPrChatUID: (uid: string) => void
    setSelectedManuscriptUID: (uid: string) => void
}

export const projectStore = create<ProjectState>((set) => ({
    selectedPrUID: '',
    selectedPrTitle: '',
    selectedPrCheckpoint: '',
    prChatUID: '',
    selectedManuscriptUID: '',
    setSelectedPrUID: (uid: string) => {
        if (!uid) {
            set({selectedPrUID: ''})
            set({selectedPrTitle: ''})
            set({selectedPrCheckpoint: ''})
            set({selectedManuscriptUID: ''})
        }
        set({selectedPrUID: uid})
    },
    setSelectedProject: (project: WriteProject) => {
        set({selectedPrUID: project.uid})
        set({selectedPrTitle: project.description})
        set({selectedPrCheckpoint: project.graph_checkpoint})
        set({selectedManuscriptUID: project.last_manuscript})
    },
    setPrChatUID: (uid: string) => set({prChatUID: uid}),
    setSelectedManuscriptUID: (uid: string) => set({selectedManuscriptUID: uid})
}))