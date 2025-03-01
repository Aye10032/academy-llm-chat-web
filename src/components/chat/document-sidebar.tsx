'use client'

import {useCallback, useRef, useState} from 'react'
import {ChevronLeft, ChevronRight, Globe} from 'lucide-react'
import {FaRegFilePdf} from "react-icons/fa";
import {SiPubmed} from "react-icons/si";
import {Button} from "@/components/ui/button"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Document} from "@/utils/self_type.tsx";
import {PDFPreview} from "@/components/pdf-viewer.tsx";


interface DocumentSidebarProps {
    documents: Document[]
    isOpen: boolean
    onToggle: () => void
}

export function DocumentSidebar(
    {
        documents,
        isOpen,
        onToggle,
    }: DocumentSidebarProps
) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

    const handleSourceClick = (source: { source_type: number; source_url: string }, event: React.MouseEvent) => {
        if (source.source_type === 1) {  // PDF类型
            event.preventDefault();
            setSelectedPdf(source.source_url);
        }
    }

    const handlePdfClose = useCallback(() => {
        setSelectedPdf(null);
    }, []);

    const toggleSidebar = useCallback(() => {
        onToggle()
    }, [onToggle])

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return 'bg-green-100 text-green-800'
        if (score >= 0.6) return 'bg-yellow-100 text-yellow-800'
        return 'bg-red-100 text-red-800'
    }

    const highlightContent = (content: string, sentences: string[]) => {
        let highlightedContent = content
        sentences.forEach(sentence => {
            highlightedContent = highlightedContent.replace(
                sentence,
                `<span class="bg-yellow-200">${sentence}</span>`
            )
        })
        return highlightedContent
    }

    return (
        <div
            className={`fixed top-0 right-0 h-full bg-gray-50 border-l border-gray-200 shadow-lg transition-all duration-300 ${
                isOpen ? 'w-1/4' : 'w-0'
            } flex flex-col overflow-hidden`}
        >
            <Button
                variant="ghost"
                size="icon"
                className={`absolute top-4 ${
                    isOpen ? 'left-2' : 'right-4'
                } z-10 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all duration-300`}
                onClick={toggleSidebar}
                disabled={!documents || documents.length == 0}
            >
                {isOpen ? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>}
            </Button>
            {isOpen && (
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-6 overflow-y-auto">
                    <h1
                        className="mb-6 text-gray-800"
                        style={{paddingLeft: '40%'}}
                    >
                        参考文档
                    </h1>
                    {documents.map((doc, index) => (
                        <div
                            key={index}
                            data-doc-index={index}
                            className={`mb-6 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 
                                ${doc.metadata.isReferenced ? 'border-l-4 border-blue-500' : ''}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-lg text-gray-800">
                                        {doc.metadata.title || 'Untitled'}
                                    </h3>
                                    {doc.metadata.isReferenced && (
                                        <span
                                            className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                            {index + 1}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {doc.metadata.author && (
                                <p className="text-sm text-gray-600 mb-1">Author: {doc.metadata.author}</p>
                            )}
                            {doc.metadata.year && (
                                <p className="text-sm text-gray-600 mb-1">Year: {doc.metadata.year}</p>
                            )}
                            <div className="flex justify-between items-center mt-2">
                                <p className={`text-xs font-medium px-2 py-1 rounded-full ${getScoreColor(doc.metadata.score)}`}>
                                    Score: {doc.metadata.score.toFixed(2)}
                                </p>
                                <div className="flex space-x-1">
                                    {doc.metadata.source.map((source, sourceIndex) => (
                                        <a
                                            key={sourceIndex}
                                            href={source.source_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:opacity-80 transition-opacity duration-300 mt-1"
                                            onClick={(e) => handleSourceClick(source, e)}
                                        >
                                            {
                                                source.source_type === 1 ? (
                                                    <FaRegFilePdf className="h-4 w-4 text-red-500"/>
                                                ) : source.source_type === 2 ? (
                                                    <Globe className="h-4 w-4 text-green-500"/>
                                                ) : source.source_type === 3 ? (<SiPubmed className="h-4 w-4 text-blue-950"/>
                                                ) : (<div/>)
                                            }
                                        </a>
                                    ))}
                                </div>
                            </div>
                            {doc.metadata.refer_sentence && doc.metadata.refer_sentence.length > 0 && (
                                <div
                                    className="prose prose-sm mt-2 text-gray-700 bg-white p-2 rounded-md border border-gray-200"
                                    dangerouslySetInnerHTML={{
                                        __html: highlightContent(doc.content, doc.metadata.refer_sentence)
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </ScrollArea>
            )}

            <PDFPreview
                isOpen={!!selectedPdf}
                onClose={handlePdfClose}
                pdfFile={selectedPdf || ''}
            />
        </div>
    )
}

