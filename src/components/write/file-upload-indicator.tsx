import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    FileIcon,
    FileImageIcon,
    FileIcon as FilePdfIcon,
    FileTextIcon,
    FileSpreadsheetIcon,
    FileArchiveIcon as FileZipIcon,
} from "lucide-react"

interface FileUploadIndicatorProps {
    fileName: string
    fileSize: number
    onDelete?: () => void
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getFileIcon(fileName: string) {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
            return <FileImageIcon className="h-6 w-6 text-blue-500" />
        case "pdf":
            return <FilePdfIcon className="h-6 w-6 text-red-500" />
        case "doc":
        case "docx":
            return <FileTextIcon className="h-6 w-6 text-blue-700" />
        case "xls":
        case "xlsx":
            return <FileSpreadsheetIcon className="h-6 w-6 text-green-600" />
        case "zip":
        case "rar":
            return <FileZipIcon className="h-6 w-6 text-yellow-600" />
        default:
            return <FileIcon className="h-6 w-6 text-gray-500" />
    }
}

export function FileUploadIndicator({ fileName, fileSize, onDelete }: FileUploadIndicatorProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-2">
            <div className="relative">
                {getFileIcon(fileName)}
            </div>
            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{fileName}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatFileSize(fileSize)}</span>
                </div>
            </div>
            {onDelete && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}

