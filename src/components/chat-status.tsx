"use client"

import {Loader2} from "lucide-react"

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

