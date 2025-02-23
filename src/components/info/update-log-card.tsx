import {Separator} from "@/components/ui/separator"
import {Badge} from "@/components/ui/badge.tsx";

const releases = [
    {
        version: "v0.1.0",
        date: "2025-02-23",
        title: "First Update",
        description: "正式上线",
        changes: [
            "对话、写作两大基础功能",
            "调用文献的预览和源界面跳转",
            "自主决策和用户指定的知识库调用",
        ],
    },
]

export function UpdateLog() {
    return (
        <div className="space-y-6">
            {releases.map((release, index) => (
                <div key={release.version} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            {release.version}
                            <Badge variant="secondary">{release.title}</Badge>
                        </h3>
                        <span className="text-sm text-muted-foreground">{release.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{release.description}</p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                        {release.changes.map((change, changeIndex) => (
                            <li key={changeIndex}>{change}</li>
                        ))}
                    </ul>
                    {index < releases.length - 1 && <Separator className="mt-4"/>}
                </div>
            ))}
        </div>
    )
}

