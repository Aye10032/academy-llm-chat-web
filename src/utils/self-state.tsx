import {create} from 'zustand'
import {KnowledgeBase, WriteProject} from "@/utils/self_type.tsx";

interface KbState {
    selectedKbUID: string
    selectedKbTitle: string
    kbChatUID: string
    canCreateChat: boolean
    setSelectedKbUID: (uid: string) => void
    setSelectedKnowledgeBase: (kb: KnowledgeBase) => void
    setKBChatUID: (uid: string) => void
    setCanCreateChat: (flag: boolean) => void
}

export const kbStore = create<KbState>((set) => ({
    selectedKbUID: '',
    selectedKbTitle: '',
    kbChatUID: '',
    canCreateChat: true,
    setSelectedKbUID: (uid: string) => {
        if (!uid) {
            set({selectedKbUID: ''})
            set({selectedKbTitle: ''})
            set({kbChatUID: ''})
        }
        set({selectedKbUID: uid})
    },
    setSelectedKnowledgeBase: (kb: KnowledgeBase) => {
        set({selectedKbUID: kb.uid})
        set({selectedKbTitle: kb.table_title})
    },
    setKBChatUID: (uid: string) => set({kbChatUID: uid}),
    setCanCreateChat: (flag: boolean) => set({canCreateChat: flag})
}));

interface ProjectState {
    selectedPrUID: string
    selectedPrTitle: string
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
    prChatUID: '',
    selectedManuscriptUID: '',
    setSelectedPrUID: (uid: string) => {
        if (!uid) {
            set({selectedPrUID: ''})
            set({selectedPrTitle: ''})
            set({selectedManuscriptUID: ''})
        }
        set({selectedPrUID: uid})
    },
    setSelectedProject: (project: WriteProject) => {
        set({selectedPrUID: project.uid})
        set({selectedPrTitle: project.description})
        set({selectedManuscriptUID: project.last_manuscript})
    },
    setPrChatUID: (uid: string) => set({prChatUID: uid}),
    setSelectedManuscriptUID: (uid: string) => set({selectedManuscriptUID: uid})
}))

interface LlmConfig {
    model: string
    contextLength: number[]
    temperature: number[]
    setModel: (model: string) => void
    setContextLength: (length: number[]) => void
    setTemperature: (temperature: number[]) => void
}

export const llmConfig = create<LlmConfig>((set) => ({
    model: 'deepseek-v3',
    contextLength: [2],
    temperature: [0.4],
    setModel: (name: string) => set({model: name}),
    setContextLength: (length) => set({contextLength: length}),
    setTemperature: (temp) => set({temperature: temp})
}))