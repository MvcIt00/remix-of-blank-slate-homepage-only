import { useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NOLEGGIO_BUCKET, getNoleggioPath } from "@/utils/noleggioStorage";
import { cn } from "@/lib/utils";
import { StatoPreventivo } from "@/types/preventiviNoleggio";

interface PreventivoUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preventivoId: string;
    existingFilePath?: string | null;
    onUploadSuccess: () => void;
}

export function PreventivoUploadDialog({
    open,
    onOpenChange,
    preventivoId,
    existingFilePath,
    onUploadSuccess,
}: PreventivoUploadDialogProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const validateFile = (file: File): boolean => {
        if (file.type !== "application/pdf") {
            toast({
                title: "Errore",
                description: "Solo file PDF sono accettati",
                variant: "destructive",
            });
            return false;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: "Errore",
                description: "Il file non può superare i 10MB",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const timestamp = Date.now();
            const filePath = getNoleggioPath("PREVENTIVO_FIRMATO", preventivoId, timestamp);

            // 1. Upload to storage
            const { error: uploadError } = await supabase.storage
                .from(NOLEGGIO_BUCKET) // Domain-specific silo
                .upload(filePath, selectedFile);

            if (uploadError) throw uploadError;

            // 2. Cleanup old file if exists
            if (existingFilePath) {
                await supabase.storage.from(NOLEGGIO_BUCKET).remove([existingFilePath]);
            }

            // 3. Update database record
            const { error: updateError } = await supabase
                .from("prev_noleggi" as any)
                .update({
                    pdf_firmato_path: filePath,
                    stato: StatoPreventivo.APPROVATO, // Auto-approve upon upload
                })
                .eq("id_preventivo", preventivoId);

            if (updateError) throw updateError;

            toast({
                title: "Successo",
                description: "Preventivo firmato caricato correttamente. Lo stato è ora 'Approvato'.",
            });

            setSelectedFile(null);
            onOpenChange(false);
            onUploadSuccess();
        } catch (error) {
            console.error("Error uploading signed quote:", error);
            toast({
                title: "Errore",
                description: "Errore nel caricamento del documento",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {existingFilePath ? "Sostituisci firmato" : "Carica preventivo firmato"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={cn(
                            "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                            dragActive
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-muted-foreground/50",
                            selectedFile && "border-green-500 bg-green-50"
                        )}
                    >
                        {selectedFile ? (
                            <div className="flex flex-col items-center gap-2">
                                <FileUp className="h-10 w-10 text-green-600" />
                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedFile(null)}
                                    className="mt-2"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Rimuovi
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Trascina qui il file PDF oppure
                                </p>
                                <label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <Button variant="outline" size="sm" asChild>
                                        <span className="cursor-pointer">Seleziona file</span>
                                    </Button>
                                </label>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Solo PDF, massimo 10MB
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={uploading}>
                            Annulla
                        </Button>
                        <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Caricamento...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Carica
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
