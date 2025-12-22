import { ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FormDialogLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function FormDialogLayout({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className = "max-w-4xl",
}: FormDialogLayoutProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`
          ${className}
          max-h-[90vh]
          p-0
          overflow-hidden
          [&>button]:hidden
          grid
          grid-rows-[auto_1fr_auto]
        `}
      >
        {/* HEADER (non scrolla) */}
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* BODY SCROLLABILE - min-h-0 è cruciale per far funzionare overflow in grid */}
        <div className="min-h-0 overflow-y-auto">
          <div className="p-6">{children}</div>
        </div>

        {/* FOOTER (non scrolla) */}
        {footer && <div className="border-t px-6 py-4 bg-background">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
