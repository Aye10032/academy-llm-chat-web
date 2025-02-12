"use client"

import {useState} from "react"
import {Document, Page, pdfjs} from "react-pdf"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Loader2} from "lucide-react"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFPreviewProps {
    isOpen: boolean
    onClose: () => void
    pdfUrl: string
}

export function PDFPreview({isOpen, onClose, pdfUrl}: PDFPreviewProps) {
    const [numPages, setNumPages] = useState<number | null>(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    function onDocumentLoadSuccess({numPages}: { numPages: number }) {
        setNumPages(numPages)
        setLoading(false)
    }

    function onDocumentLoadError(error: Error) {
        console.error("Error loading PDF:", error)
        setError("PDF 加载失败，请稍后重试。")
        setLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-[80vh]">
                <DialogHeader>
                    <DialogTitle>PDF 预览</DialogTitle>
                </DialogHeader>
                <div className="flex-1 w-full h-full overflow-auto">
                    {loading && (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin"/>
                        </div>
                    )}
                    {error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : (
                        <Document
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={<Loader2 className="h-8 w-8 animate-spin"/>}
                        >
                            <Page pageNumber={pageNumber} width={800}/>
                        </Document>
                    )}
                </div>
                {numPages && (
                    <div className="flex justify-between items-center mt-4">
                        <Button onClick={() => setPageNumber((page) => Math.max(page - 1, 1))} disabled={pageNumber <= 1}>
                            上一页
                        </Button>
                        <p>
                            第 {pageNumber} 页，共 {numPages} 页
                        </p>
                        <Button
                            onClick={() => setPageNumber((page) => Math.min(page + 1, numPages))}
                            disabled={pageNumber >= numPages}
                        >
                            下一页
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

