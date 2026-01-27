import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageCircle } from 'lucide-react';
import { useWhatsAppTrasporto } from '@/hooks/useWhatsAppTrasporto';

interface InviaWhatsAppDialogProps {
    idTrasporto: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InviaWhatsAppDialog({
    idTrasporto,
    open,
    onOpenChange,
}: InviaWhatsAppDialogProps) {
    const {
        contatti,
        selectedContatto,
        setSelectedContatto,
        messaggio,
        sendWhatsApp,
        isLoading,
        isSending,
    } = useWhatsAppTrasporto(idTrasporto);

    const handleSend = () => {
        sendWhatsApp();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        Invia WhatsApp al Trasportatore
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Caricamento...
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Selezione Contatto */}
                        <div className="space-y-2">
                            <Label>Numero WhatsApp destinatario</Label>
                            {contatti.length === 0 ? (
                                <div className="text-sm text-red-600 font-medium">
                                    ⚠️ Nessun numero WhatsApp disponibile per questo vettore
                                </div>
                            ) : (
                                <Select
                                    value={selectedContatto || ''}
                                    onValueChange={setSelectedContatto}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona contatto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contatti.map((contatto) => (
                                            <SelectItem
                                                key={contatto.id_contatto}
                                                value={contatto.id_contatto}
                                            >
                                                {contatto.nome} - {contatto.telefono}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Anteprima Messaggio */}
                        <div className="space-y-2">
                            <Label>Anteprima messaggio</Label>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                <pre className="font-mono text-sm whitespace-pre-wrap text-gray-800">
                                    {messaggio}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annulla
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={!selectedContatto || isLoading || isSending || contatti.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {isSending ? 'Invio in corso...' : 'Invia WhatsApp'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
