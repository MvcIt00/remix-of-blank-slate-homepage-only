import { Reply, Forward, Trash2, Archive, MailOpen, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { EmailManagementActions } from "@/hooks/useEmailManagement";

interface EmailActionsToolbarProps {
    email: any;
    actions: EmailManagementActions;
    className?: string;
    variant?: "default" | "compact";
    showText?: boolean;
}

export function EmailActionsToolbar({
    email,
    actions,
    className,
    variant = "default",
    showText = false
}: EmailActionsToolbarProps) {
    const isSent = email.direzione === 'inviata';
    const isUnread = email.direzione === 'ricevuta' && email.stato === 'non_letta';

    const ActionButton = ({
        icon: Icon,
        label,
        onClick,
        destructive = false,
        isActive = false
    }: any) => {
        const content = (
            <Button
                variant="ghost"
                size={variant === "compact" ? "icon" : "sm"}
                onClick={onClick}
                className={cn(
                    "flex items-center gap-2 font-bold uppercase tracking-tight",
                    variant === "compact" ? "h-8 w-8" : "h-9",
                    destructive && "text-destructive hover:text-destructive hover:bg-destructive/10",
                    isActive && "text-primary bg-primary/10",
                    !destructive && !isActive && "text-slate-900 dark:text-slate-100 hover:bg-slate-200/50"
                )}
            >
                <Icon className={cn(variant === "compact" ? "h-4 w-4" : "h-3.5 w-3.5")} />
                {showText && variant !== "compact" && <span>{label}</span>}
            </Button>
        );

        if (variant === "compact") {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>{content}</TooltipTrigger>
                        <TooltipContent side="top">{label}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return content;
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <ActionButton
                icon={Reply}
                label="Rispondi"
                onClick={() => actions.prepareReply(email)}
            />
            <ActionButton
                icon={Forward}
                label="Inoltra"
                onClick={() => actions.prepareForward(email)}
            />

            <div className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700" />

            <ActionButton
                icon={Archive}
                label="Archivia"
                onClick={() => actions.archive(email.id, email.direzione)}
            />

            <ActionButton
                icon={Trash2}
                label="Elimina"
                destructive
                onClick={() => actions.trash(email.id, email.direzione)}
            />
        </div>
    );
}
