"use client"

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"

interface PDFPreviewProps {
    isOpen: boolean
    onClose: () => void
    pdfFile: string
}

export function PDFPreview({isOpen, onClose, pdfFile}: PDFPreviewProps) {
    return (
        (!!pdfFile) && (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="flex flex-col min-w-[45%] w-full h-[90vh]">
                    <DialogHeader className="flex-none h-12">
                        <DialogTitle>PDF 预览</DialogTitle>
                        <DialogDescription>{pdfFile.split('/')[pdfFile.split('/').length - 1]}</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 w-full h-[calc(80vh-3rem)]">
                        <iframe
                            src={`/api/v1/resource/pdf/${pdfFile}`}
                            className="w-full h-full border-0"
                            title="PDF预览"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        )
    )
}

