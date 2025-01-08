'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, FileText, Globe } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Document} from "@/utils/self_type.ts";

interface DocumentSidebarProps {
    documents: Document[]
}

export function DocumentSidebar({ documents }: DocumentSidebarProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleSidebar = useCallback(() => {
        setIsOpen(prevState => !prevState)
    }, [])

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
                isOpen ? 'w-96' : 'w-8'
            } flex flex-col`}
        >
            <Button
                variant="ghost"
                size="icon"
                className={`absolute top-4 ${
                    isOpen ? 'left-2' : '-left-4'
                } z-10 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all duration-300`}
                onClick={toggleSidebar}
            >
                {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            {isOpen && (
                <ScrollArea className="flex-1 p-6">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800 pl-28">参考文档</h2>
                    {documents.map((doc, index) => (
                        <div key={index} className="mb-6 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium text-lg text-gray-800">
                                    {doc.metadata.title || 'Untitled'}
                                </h3>
                                {doc.metadata.source_type === 1 ? (
                                    <FileText className="h-5 w-5 text-blue-500" />
                                ) : (
                                    <a href={doc.metadata.source} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity duration-300">
                                        <Globe className="h-5 w-5 text-green-500" />
                                    </a>
                                )}
                            </div>
                            {doc.metadata.author && (
                                <p className="text-sm text-gray-600 mb-1">Author: {doc.metadata.author}</p>
                            )}
                            {doc.metadata.year && (
                                <p className="text-sm text-gray-600 mb-1">Year: {doc.metadata.year}</p>
                            )}
                            <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block mb-2 ${
                                getScoreColor(doc.metadata.score)
                            }`}>
                                Score: {doc.metadata.score.toFixed(2)}
                            </p>
                            {doc.metadata.refer_sentence && doc.metadata.refer_sentence.length > 0 && (
                                <div
                                    className="text-sm mt-2 text-gray-700 bg-white p-2 rounded-md border border-gray-200"
                                    dangerouslySetInnerHTML={{
                                        __html: highlightContent(doc.content, doc.metadata.refer_sentence)
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </ScrollArea>
            )}
        </div>
    )
}

