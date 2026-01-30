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
import { useConfermaTrasporto } from "@/hooks/useTrasportiMutations";

interface ConfermaTrasportoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trasportoId: string | null;
    trasportoInfo?: {
        mezzo: string;
        tratta: string;
        prezzo: string;
    };
    onSuccess?: () => void; // Callback per refresh dashboard
}

export function ConfermaTrasportoDialog({
    open,
    onOpenChange,
    trasportoId,
    trasportoInfo,
    onSuccess,
}: ConfermaTrasportoDialogProps) {
    const confermaMutation = useConfermaTrasporto();

    const handleConferma = async () => {
        if (!trasportoId) return;
        await confermaMutation.mutateAsync(trasportoId);
        onOpenChange(false);
        if (onSuccess) onSuccess();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confermare trasporto?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Il trasporto passerà dallo stato "Richiesto" a "Confermato".
                        {trasportoInfo && (
                            <div className="mt-2 space-y-1">
                                <div><strong>Mezzo:</strong> {trasportoInfo.mezzo}</div>
                                <div><strong>Tratta:</strong> {trasportoInfo.tratta}</div>
                                <div><strong>Prezzo:</strong> {trasportoInfo.prezzo}</div>
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConferma}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={confermaMutation.isPending}
                    >
                        {confermaMutation.isPending ? "Conferma..." : "Conferma Trasporto"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
