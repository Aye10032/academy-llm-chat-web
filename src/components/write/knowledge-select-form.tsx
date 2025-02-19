"use client"

import * as React from "react"
import {Check} from "lucide-react"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Command, CommandGroup, CommandItem, CommandList} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {useApiQuery} from "@/hooks/useApi.ts";
import {KnowledgeBase} from "@/utils/self_type.tsx";

interface MultiSelectProps {
    selected: string[]
    onChange: (selected: string[]) => void
}

export function MultiSelect({selected, onChange}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    // 获取知识库列表请求
    const {data: knowledgeBases, isLoading: knowledgeBasesLoading} = useApiQuery<KnowledgeBase[]>(
        ['knowledgeBases'],
        '/rag/knowledge_bases'
    )
    const kbGroup = knowledgeBases ? knowledgeBases : []

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="h-7 px-3 text-xs scale-75 rounded-full"
                    disabled={knowledgeBasesLoading || !knowledgeBases}
                >
                    {(selected.length==0)?"调用全部知识库":`已使用 ${selected.length} 个知识库`}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandList>
                        <CommandGroup>
                            {kbGroup.map((kb) => (
                                <CommandItem
                                    key={kb.uid}
                                    onSelect={() => {
                                        onChange(
                                            selected.includes(kb.uid)
                                                ? selected.filter((item) => item !== kb.uid)
                                                : [...selected, kb.uid],
                                        )
                                        setOpen(true)
                                    }}
                                    className="text-xs py-1.5"
                                >
                                    <Check
                                        className={cn("mr-1 h-3 w-3", selected.includes(kb.uid) ? "opacity-100" : "opacity-0")}
                                    />
                                    {kb.table_title}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

