import { AlertTriangle, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DettaglioModificaDisplayProps {
    dettaglio: string | null | undefined;
    variant?: "snippet" | "banner";
    maxLength?: number;
    className?: string;
}

export function DettaglioModificaDisplay({
    dettaglio,
    variant = "snippet",
    maxLength = 60,
    className,
}: DettaglioModificaDisplayProps) {
    if (!dettaglio) return null;

    // VARIANT: SNIPPET - Testo troncato con tooltip
    if (variant === "snippet") {
        const isTruncated = dettaglio.length > maxLength;
        const displayText = isTruncated
            ? dettaglio.slice(0, maxLength) + "..."
            : dettaglio;

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 cursor-help max-w-[200px]",
                        className
                    )}>
                        <MessageSquare className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{displayText}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm whitespace-pre-wrap">{dettaglio}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    // VARIANT: BANNER - Alert completo read-only
    return (
        <Alert variant="default" className={cn(
            "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
            className
        )}>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
                <span className="font-medium">Modifica richiesta: </span>
                {dettaglio}
            </AlertDescription>
        </Alert>
    );
}
