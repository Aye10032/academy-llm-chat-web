'use client'

import * as React from 'react'
import { Save, Languages, Timer, History, MoreVertical } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingActionsProps {
    onSave: () => void
}

export function FloatingActions({ onSave }: FloatingActionsProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const menuRef = React.useRef<HTMLDivElement>(null)

    const toggleMenu = React.useCallback(() => {
        setIsOpen(prev => !prev)
    }, [])

    const closeMenu = React.useCallback(() => {
        setIsOpen(false)
    }, [])

    const handleAction = React.useCallback((action: () => void) => {
        action()
        closeMenu()
    }, [closeMenu])

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeMenu()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [closeMenu])

    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
            <div ref={menuRef} className="relative">
                <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                        "h-12 w-12 rounded-full bg-background shadow-lg transition-all duration-200",
                        isOpen ? "bg-muted" : "hover:bg-muted/50"
                    )}
                    onClick={toggleMenu}
                >
                    <MoreVertical className="h-5 w-5" />
                </Button>
                {isOpen && (
                    <div className="absolute bottom-full right-0 mb-2 flex flex-col items-end space-y-2">
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 rounded-full bg-background shadow-md"
                                        onClick={() => handleAction(() => console.log('Language action'))}
                                    >
                                        <Languages className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>转移到一种语言</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 rounded-full bg-background shadow-md"
                                        onClick={() => handleAction(() => console.log('Timer action'))}
                                    >
                                        <Timer className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>设置定时器</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 rounded-full bg-background shadow-md"
                                        onClick={() => handleAction(() => console.log('History action'))}
                                    >
                                        <History className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>历史记录</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
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
                            <Save className="h-5 w-5" />
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

