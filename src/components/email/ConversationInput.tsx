import { useState } from "react";
import { Send, Paperclip, MoreHorizontal, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ConversationInputProps {
    onSend: (content: string) => void;
    onExpand: () => void;
    isSending?: boolean;
}

export function ConversationInput({ onSend, onExpand, isSending }: ConversationInputProps) {
    const [content, setContent] = useState("");

    const handleSend = () => {
        if (!content.trim() || isSending) return;
        onSend(content);
        setContent("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // L'utente vuole che l'invio sia solo tramite tasto fisico, quindi non facciamo nulla sull'Enter
        // Il default di Textarea gestirà l'andata a capo (\n)
    };

    return (
        <div className="p-4 border-t bg-background/80 backdrop-blur-md shrink-0">
            <div className="max-w-4xl mx-auto flex items-end gap-3">
                <div className="flex-1 relative group">
                    <Textarea
                        placeholder="Scrivi un messaggio..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[50px] max-h-[200px] pr-12 py-3 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 resize-none transition-all rounded-2xl scrollbar-hide text-[15.5px] placeholder:text-[15.5px]"
                    />

                    <div className="absolute right-2 bottom-2 flex gap-1 transform transition-opacity duration-200">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-muted"
                                        onClick={onExpand}
                                    >
                                        <Maximize2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Editor completo</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Allega file</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <Button
                    size="icon"
                    className={cn(
                        "h-12 w-12 rounded-2xl shadow-lg transition-all duration-300 shrink-0",
                        content.trim() ? "translate-y-0 scale-100 opacity-100 shadow-primary/30" : "translate-y-2 scale-90 opacity-50"
                    )}
                    onClick={handleSend}
                    disabled={!content.trim() || isSending}
                >
                    <Send className={cn("h-5 w-5", isSending && "animate-pulse")} />
                </Button>
            </div>
        </div>
    );
}
