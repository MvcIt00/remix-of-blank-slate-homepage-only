import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTrasporto } from "@/hooks/useTrasportiMutations";

interface EliminaTrasportoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trasportoId: string | null;
    trasportoInfo?: {
        mezzo: string;
        tratta: string;
    };
}

export function EliminaTrasportoDialog({
    open,
    onOpenChange,
    trasportoId,
    trasportoInfo,
}: EliminaTrasportoDialogProps) {
    const deleteMutation = useDeleteTrasporto();

    const handleElimina = async () => {
        if (!trasportoId) return;
        await deleteMutation.mutateAsync(trasportoId);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Eliminare trasporto?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Questa azione è irreversibile.
                        {trasportoInfo && (
                            <div className="mt-2 space-y-1">
                                <div><strong>Mezzo:</strong> {trasportoInfo.mezzo}</div>
                                <div><strong>Tratta:</strong> {trasportoInfo.tratta}</div>
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleElimina}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? "Eliminazione..." : "Elimina Definitivamente"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
