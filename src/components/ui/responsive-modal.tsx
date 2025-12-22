import React from "react";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

// ----------------------------------------------------------------------
// Base Primitive (Internal Use)
// ----------------------------------------------------------------------

interface BaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string; // For overriding max-width
    preventCloseOnClickOutside?: boolean;
    description?: string;
}

const ResponsiveModalBase = ({
    open,
    onOpenChange,
    title,
    children,
    footer,
    className,
    preventCloseOnClickOutside = false,
    description,
}: BaseModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "flex flex-col gap-0 p-0 max-h-[90vh] sm:max-h-[85vh] overflow-hidden",
                    className
                )}
                onInteractOutside={(e) => {
                    if (preventCloseOnClickOutside) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold w-full">{title}</DialogTitle>
                        {/* Semantic Close Button for Accessibility */}
                        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </DialogPrimitive.Close>
                    </div>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                </DialogHeader>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6">
                    {children}
                </div>

                {/* Sticky Footer (if present) */}
                {footer && (
                    <div className="px-6 py-4 border-t bg-background flex-shrink-0">
                        {footer}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

// ----------------------------------------------------------------------
// 1. Form Modal (Transactional)
// ----------------------------------------------------------------------

interface FormModalProps extends Omit<BaseModalProps, "className" | "preventCloseOnClickOutside"> {
    size?: "default" | "lg" | "xl" | "full";
}

export function FormModal({ size = "lg", ...props }: FormModalProps) {
    // Map size to utility classes
    const sizeClasses = {
        default: "sm:max-w-lg", // Standard
        lg: "sm:max-w-2xl",      // Better for complex forms
        xl: "sm:max-w-4xl",      // Very complex forms (Anagrafica)
        full: "sm:max-w-[95vw]", // Almost full
    };

    return (
        <ResponsiveModalBase
            {...props}
            // Forms should not close accidentally
            preventCloseOnClickOutside={true}
            className={sizeClasses[size]}
        />
    );
}

// ----------------------------------------------------------------------
// 2. Info Modal (Review / Details)
// ----------------------------------------------------------------------

interface InfoModalProps extends Omit<BaseModalProps, "className" | "footer" | "preventCloseOnClickOutside"> {
    // Info modals usually don't have a footer, actions are inline or top
    width?: "default" | "wide";
}

export function InfoModal({ width = "default", ...props }: InfoModalProps) {
    const widthClasses = {
        default: "sm:max-w-3xl",
        wide: "sm:max-w-5xl"
    };

    return (
        <ResponsiveModalBase
            {...props}
            // Easy exit for info
            preventCloseOnClickOutside={false}
            className={widthClasses[width]}
        />
    );
}

// ----------------------------------------------------------------------
// 3. Data List Modal (Tables / Logs)
// ----------------------------------------------------------------------

interface DataListModalProps extends Omit<BaseModalProps, "className" | "preventCloseOnClickOutside"> { }

export function DataListModal(props: DataListModalProps) {
    return (
        <ResponsiveModalBase
            {...props}
            preventCloseOnClickOutside={false}
            className="sm:max-w-7xl w-[90vw]" // Wide for tables
        />
    );
}
