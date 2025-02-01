import {useState} from "react"
import {Button} from "@/components/ui/button"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {FileText, Globe, Eye, Trash2, ChevronDown} from "lucide-react"
import {PDFPreview} from "@/components/pdf-viewer.tsx";

interface Material {
    id: string
    title: string
    timestamp: string
    summary: string
    source: string
    type: "pdf" | "web"
    isHidden: boolean
}

interface MaterialsManagerProps {
    materials: Material[]
    onDeleteMaterial: (id: string) => void
    onToggleMaterialVisibility: (id: string) => void
    onPreviewMaterial: (id: string) => void
}

export function MaterialsManager(
    {
        materials,
        onDeleteMaterial,
        onToggleMaterialVisibility,
        onPreviewMaterial,
    }: MaterialsManagerProps) {
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)

    const handlePreviewMaterial = (material: Material) => {
        if (material.type === "pdf") {
            setPdfPreviewUrl(material.source)
        } else {
            onPreviewMaterial(material.id)
        }
    }

    return (
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                        管理素材
                        <ChevronDown className="ml-2 h-4 w-4"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="end">
                    <div className="px-4 py-2 bg-muted/50">
                        <h3 className="text-sm font-medium">素材列表</h3>
                    </div>
                    <ScrollArea className="h-[300px]">
                        {materials.map((material) => (
                            <div key={material.id} className="p-4 border-b last:border-b-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">{material.title}</h4>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handlePreviewMaterial(material)}>
                                            <Eye className="h-4 w-4"/>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onToggleMaterialVisibility(material.id)}>
                                            {material.isHidden ? (
                                                <FileText className="h-4 w-4"/>
                                            ) : (
                                                <FileText className="h-4 w-4 text-primary"/>
                                            )}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onDeleteMaterial(material.id)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{material.timestamp}</p>
                                <p className="text-sm mt-2">{material.summary}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-xs text-muted-foreground mr-2">来源：</span>
                                    {material.type === "pdf" ? (
                                        <FileText className="h-4 w-4 text-red-500"/>
                                    ) : (
                                        <Globe className="h-4 w-4 text-blue-500"/>
                                    )}
                                    <span className="text-xs ml-1">{material.source}</span>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </PopoverContent>
            </Popover>
            <PDFPreview isOpen={!!pdfPreviewUrl} onClose={() => setPdfPreviewUrl(null)} pdfUrl={pdfPreviewUrl || ""}/>
        </div>
    )
}

