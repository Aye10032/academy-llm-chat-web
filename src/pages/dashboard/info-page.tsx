import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {SiGithub} from "react-icons/si"
import {UpdateLog} from "@/components/info/update-log-card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";

export function InfoPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Academic LLM Chat</h1>
                    <div className="flex items-center space-x-4">
                        <p className="text-muted-foreground">by Aye10032</p>
                        <a href="https://github.com/Aye10032/academy-llm-chat-api" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon">
                                <SiGithub className="h-4 w-4" />
                                <span className="sr-only">GitHub</span>
                            </Button>
                        </a>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                            <CardDescription>基于LangGraph的多智能体RAG复制写作平台，支持多种文件格式的解析、知识库管理、deep research等功能。</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Technologies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>React</Badge>
                                        <Badge>shadcn/ui</Badge>
                                        <Badge>Python</Badge>
                                        <Badge>LangGraph</Badge>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">License</h3>
                                    <p className="text-muted-foreground">GPL</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>公告</CardTitle>
                            <CardDescription>2025.02.23</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Academic LLM Chat正式发布！
                            <br/>
                            目前支持GPT系列模型、DeepSeek系列模型（使用火山云平台部署版本）。
                            <br/>
                            目前自主建库在用户端尚未支持，请联系管理人员通过后台添加知识库和相关文献。前端的自主建库功能正在加紧开发中，将在后续更新中上线。
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>更新日志</CardTitle>
                            <CardDescription>Recent changes and releases</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UpdateLog />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}