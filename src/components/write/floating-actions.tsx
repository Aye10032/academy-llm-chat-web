'use client'

import * as React from 'react'
import {
    Save,
    Languages,
    Timer,
    History,
    MoreVertical
} from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"

interface FloatingActionsProps {
    onSave: () => void
}

export function FloatingActions({onSave}: FloatingActionsProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const menuRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
            <div ref={menuRef}>
                <div
                    className={cn(
                        "bg-background border shadow-lg transition-all duration-200",
                        isOpen
                            ? "w-[48px] rounded-[24px]"
                            : "rounded-full w-12 h-12 flex items-center justify-center hover:bg-muted/50"
                    )}
                    onMouseEnter={() => setIsOpen(true)}
                >
                    {isOpen ? (
                        <div className="flex flex-col items-center py-2 gap-2">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-full"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Languages className="h-4 w-4"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                        <p>转移到一种语言</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-full"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Timer className="h-4 w-4"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                        <p>设置定时器</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-full"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <History className="h-4 w-4"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                        <p>历史记录</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ) : (
                        <MoreVertical className="h-5 w-5"/>
                    )}
                </div>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-12 w-12 rounded-full bg-background shadow-lg hover:bg-muted/50"
                            onClick={onSave}
                        >
                            <Save className="h-5 w-5"/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>保存修改</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

