import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"

interface PDFPreviewProps {
    isOpen: boolean
    onClose: () => void
    pdfUrl: string
}

export function PDFPreview({isOpen, onClose, pdfUrl}: PDFPreviewProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-[80vh]">
                <DialogHeader>
                    <DialogTitle>PDF 预览</DialogTitle>
                </DialogHeader>
                <div className="flex-1 w-full h-full">
                    <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
                        className="w-full h-full border-none"
                        title="PDF Preview"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

