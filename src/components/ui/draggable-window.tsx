import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DraggableWindowProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  width?: "default" | "wide" | "xl";
  initialPosition?: { x: number; y: number };
}

const widthClasses = {
  default: "w-[600px] max-w-[95vw]",
  wide: "w-[800px] max-w-[95vw]",
  xl: "w-[1000px] max-w-[95vw]",
};

export function DraggableWindow({
  open,
  onClose,
  title,
  children,
  width = "default",
  initialPosition,
}: DraggableWindowProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Calculate centered position on mount
  useEffect(() => {
    if (open && !initialPosition) {
      const centerX = Math.max(50, (window.innerWidth - 800) / 2);
      const centerY = Math.max(50, window.innerHeight * 0.1);
      setPosition({ x: centerX, y: centerY });
    } else if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [open, initialPosition]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(_, info) => {
            setIsDragging(false);
            setPosition((prev) => ({
              x: Math.max(0, Math.min(prev.x + info.offset.x, window.innerWidth - 100)),
              y: Math.max(0, Math.min(prev.y + info.offset.y, window.innerHeight - 100)),
            }));
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "fixed z-50 flex flex-col",
            "bg-card border border-border rounded-lg shadow-2xl",
            "max-h-[85vh] overflow-hidden",
            widthClasses[width],
            isDragging && "cursor-grabbing"
          )}
          style={{ left: position.x, top: position.y }}
        >
          {/* HEADER - Drag Handle */}
          <div 
            className={cn(
              "px-6 py-4 border-b border-border bg-muted/50",
              "cursor-grab select-none",
              "flex items-center justify-between gap-4",
              isDragging && "cursor-grabbing"
            )}
          >
            <div className="text-xl font-semibold text-foreground flex-1 min-w-0">
              {title}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* CONTENT - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0 p-6">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
