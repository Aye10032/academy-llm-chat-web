import {useCallback, useState} from "react"
import {Button} from "@/components/ui/button"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Globe, ChevronDown} from "lucide-react"
import {FaRegFilePdf} from "react-icons/fa";
import {SiPubmed} from "react-icons/si";
import {PDFPreview} from "@/components/pdf-viewer.tsx";
import {useApiQuery} from "@/hooks/useApi.ts";
import {Document} from "@/utils/self_type.tsx";
import {projectStore} from "@/utils/self-state.tsx";


export function SourcesManager() {
    const selectedPrUID = projectStore((state) => state.selectedPrUID)
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

    const {data: sources} = useApiQuery<Document[]>(
        ['write', 'sources', selectedPrUID],
        `/write/projects/${selectedPrUID}/sources`,
        {
            enabled: !!selectedPrUID,
        }
    )
    const sourceGroup = sources ? sources : []

    const handleSourceClick = (source: { source_type: number; source_url: string }, event: React.MouseEvent) => {
        if (source.source_type === 1) {  // PDF类型
            event.preventDefault();
            setSelectedPdf(source.source_url);
        }
    }

    const handlePdfClose = useCallback(() => {
        setSelectedPdf(null);
    }, []);


    return (
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                        管理素材
                        <ChevronDown className="ml-2 h-4 w-4"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="end">
                    <div className="px-4 py-2 bg-muted/50">
                        <h3 className="text-sm font-medium">素材列表</h3>
                    </div>
                    <ScrollArea className="h-[400px]">
                        {sourceGroup.map((doc, index) => (
                            <div key={index} className="p-4 border-b last:border-b-0">
                                <h3 className="text-sm font-medium">{doc.metadata.title}</h3>
                                <p className="text-sm mt-2">{`${doc.metadata.author} (${doc.metadata.year})`}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-xs text-muted-foreground mr-2">来源：</span>
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
                            </div>
                        ))}
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <PDFPreview
                isOpen={!!selectedPdf}
                onClose={handlePdfClose}
                pdfFile={selectedPdf || ''}
            />
        </div>
    )
}

