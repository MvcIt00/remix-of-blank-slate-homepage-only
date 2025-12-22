import { Button } from "./button";
import { Edit, Trash2, Archive, Check, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { cn } from "@/lib/utils";

interface ActionConfig {
    icon?: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
    disabled?: boolean;
}

interface TableActionsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onArchive?: () => void;
    onView?: () => void;
    onComplete?: () => void;
    customActions?: ActionConfig[];
    className?: string;
    editDisabled?: boolean;
    deleteDisabled?: boolean;
    archiveDisabled?: boolean;
    viewDisabled?: boolean;
    completeDisabled?: boolean;
}

export function TableActions({
    onEdit,
    onDelete,
    onArchive,
    onView,
    onComplete,
    customActions,
    className,
    editDisabled,
    deleteDisabled,
    archiveDisabled,
    viewDisabled,
    completeDisabled,
}: TableActionsProps) {
    return (
        <TooltipProvider>
            <div className={cn("flex justify-end gap-2", className)}>
                {onView && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onView}
                                disabled={viewDisabled}
                                className="h-8 w-8 p-0"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Visualizza</TooltipContent>
                    </Tooltip>
                )}

                {onEdit && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onEdit}
                                disabled={editDisabled}
                                className="h-8 w-8 p-0"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Modifica</TooltipContent>
                    </Tooltip>
                )}

                {onComplete && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onComplete}
                                disabled={completeDisabled}
                                className="h-8 w-8 p-0"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Completa</TooltipContent>
                    </Tooltip>
                )}

                {onArchive && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onArchive}
                                disabled={archiveDisabled}
                                className="h-8 w-8 p-0 text-amber-600 border-amber-200 hover:bg-amber-50"
                            >
                                <Archive className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Archivia</TooltipContent>
                    </Tooltip>
                )}

                {customActions?.map((action, index) => (
                    <Tooltip key={index}>
                        <TooltipTrigger asChild>
                            <Button
                                variant={action.variant || "outline"}
                                size="sm"
                                onClick={action.onClick}
                                disabled={action.disabled}
                                className={cn("h-8 w-8 p-0", action.className)}
                            >
                                {action.icon}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{action.label}</TooltipContent>
                    </Tooltip>
                ))}

                {onDelete && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={onDelete}
                                disabled={deleteDisabled}
                                className="h-8 w-8 p-0"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Elimina</TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    );
}
