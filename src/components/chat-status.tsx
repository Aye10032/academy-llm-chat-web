"use client"

import {Loader2} from "lucide-react"
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";

interface StatusDisplayProps {
    status: string | null
}

export function SimpleStatus({status}: StatusDisplayProps) {
    if (!status) return null

    return (
        <div className="flex justify-center items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin"/>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700">
        {status}
      </span>
        </div>
    )
}

interface StatusCardProps {
    items: string[]
    isProcessing: boolean
}

export function StatusCard({items, isProcessing}: StatusCardProps) {
    return (
        <div className="flex justify-center">
            <Card className="w-[300px] border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.1)] bg-white">
                <CardHeader className="py-2 flex flex-row items-center space-x-2 border-b border-gray-100 min-h-[32px] bg-gray-100">
                    {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-600"/>}
                    <h2 className="text-sm font-medium leading-none text-gray-700">{isProcessing ? "思考中" : "处理完毕"}</h2>
                </CardHeader>
                <CardContent className="text-sm pt-1 pb-1.5">
                    <div className="max-h-[200px] overflow-y-auto pr-2">
                        <div className="space-y-0 relative">
                            <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-gray-200"/>

                            {items.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 py-2 relative">
                                    <div
                                        className={`h-2 w-2 rounded-full z-10 ${
                                            (index == items.length - 1 && isProcessing) ? "bg-green-500 animate-pulse" : "bg-gray-300"
                                        }`}
                                    />
                                    <span
                                        className={`text-xs ${(index == items.length - 1 && isProcessing) ? "text-gray-500" : "text-gray-700"}`}
                                    >
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

