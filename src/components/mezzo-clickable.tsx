import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MezzoCard } from "@/components/card/mezzo_card";

interface MezzoClickableProps {
  mezzoId: string;
  children: React.ReactNode;
  className?: string;
}

export function MezzoClickable({ mezzoId, children, className = "" }: MezzoClickableProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`text-left hover:underline hover:text-primary transition-colors cursor-pointer ${className}`}
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <MezzoCard mezzoId={mezzoId} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
