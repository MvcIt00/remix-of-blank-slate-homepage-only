import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrasportiTable } from "@/components/trasporti/TrasportiTable";
import { ConfermaTrasportoDialog } from "@/components/trasporti/ConfermaTrasportoDialog";
import { CompletaTrasportoDialog } from "@/components/trasporti/CompletaTrasportoDialog";
import { EliminaTrasportoDialog } from "@/components/trasporti/EliminaTrasportoDialog";
import { useTrasporti } from "@/hooks/useTrasporti";
import { Settings, Search } from "lucide-react";
import { toast } from "sonner";

export default function TrasportiPage() {
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog states
    const [confermaDialogOpen, setConfermaDialogOpen] = useState(false);
    const [completaDialogOpen, setCompletaDialogOpen] = useState(false);
    const [eliminaDialogOpen, setEliminaDialogOpen] = useState(false);

    // Selected transport for dialogs
    const [selectedTrasporto, setSelectedTrasporto] = useState<{
        id: string;
        mezzo: string;
        tratta: string;
        prezzo: string;
    } | null>(null);

    // Query per le 3 tabelle
    const { data: richiesti = [], isLoading: loadingRichiesti } = useTrasporti('richiesto');
    const { data: confermati = [], isLoading: loadingConfermati } = useTrasporti('confermato');
    const { data: completati = [], isLoading: loadingCompletati } = useTrasporti('completato');

    // Handlers
    const handleConfig = () => {
        toast.info("Configurazione tariffe sarà implementata in futuro");
    };

    const handleConferma = (id: string) => {
        // Trova il trasporto per mostrare info nel dialog
        const trasporto = richiesti.find(t => t.id_trasporto === id);
        if (trasporto) {
            const mezzoDisplay = trasporto.mezzo
                ? `${trasporto.mezzo.marca} ${trasporto.mezzo.modello}`
                : trasporto.metadata?.mezzo
                    ? `${trasporto.metadata.mezzo.marca} ${trasporto.metadata.mezzo.modello}`
                    : "Mezzo sconosciuto";

            const trattaDisplay = `${trasporto.sede_partenza?.nome_sede || '?'} → ${trasporto.sede_arrivo?.nome_sede || '?'}`;
            const prezzoDisplay = trasporto.prezzo_cliente ? `€${trasporto.prezzo_cliente.toFixed(2)}` : "Non specificato";

            setSelectedTrasporto({
                id,
                mezzo: mezzoDisplay,
                tratta: trattaDisplay,
                prezzo: prezzoDisplay,
            });
            setConfermaDialogOpen(true);
        }
    };

    const handleCompleta = (id: string) => {
        const trasporto = confermati.find(t => t.id_trasporto === id);
        if (trasporto) {
            const mezzoDisplay = trasporto.mezzo
                ? `${trasporto.mezzo.marca} ${trasporto.mezzo.modello}`
                : trasporto.metadata?.mezzo
                    ? `${trasporto.metadata.mezzo.marca} ${trasporto.metadata.mezzo.modello}`
                    : "Mezzo sconosciuto";

            const trattaDisplay = `${trasporto.sede_partenza?.nome_sede || '?'} → ${trasporto.sede_arrivo?.nome_sede || '?'}`;

            setSelectedTrasporto({
                id,
                mezzo: mezzoDisplay,
                tratta: trattaDisplay,
                prezzo: "",
            });
            setCompletaDialogOpen(true);
        }
    };

    const handleModifica = (id: string) => {
        toast.info(`Modifica trasporto - Sarà implementato a breve`);
    };

    const handleElimina = (id: string) => {
        // Trova il trasporto in una delle 3 liste
        const trasporto = [...richiesti, ...confermati, ...completati].find(t => t.id_trasporto === id);
        if (trasporto) {
            const mezzoDisplay = trasporto.mezzo
                ? `${trasporto.mezzo.marca} ${trasporto.mezzo.modello}`
                : trasporto.metadata?.mezzo
                    ? `${trasporto.metadata.mezzo.marca} ${trasporto.metadata.mezzo.modello}`
                    : "Mezzo sconosciuto";

            const trattaDisplay = `${trasporto.sede_partenza?.nome_sede || '?'} → ${trasporto.sede_arrivo?.nome_sede || '?'}`;

            setSelectedTrasporto({
                id,
                mezzo: mezzoDisplay,
                tratta: trattaDisplay,
                prezzo: "",
            });
            setEliminaDialogOpen(true);
        }
    };

    const handleDettaglio = (id: string) => {
        toast.info(`Dettaglio trasporto - Fase 4`);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Trasporti
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitoraggio trasporti: richiesti, confermati, completati
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleConfig}>
                        <Settings className="h-4 w-4 mr-2" />
                        Config
                    </Button>
                </div>
            </div>

            {/* Filtri */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cerca mezzo, cliente, note..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* 3 Tabelle Verticali */}
            <div className="space-y-6">
                {/* Tabella 1: RICHIESTI */}
                <TrasportiTable
                    stato="richiesto"
                    trasporti={richiesti}
                    isLoading={loadingRichiesti}
                    onConferma={handleConferma}
                    onModifica={handleModifica}
                    onElimina={handleElimina}
                />

                {/* Tabella 2: CONFERMATI */}
                <TrasportiTable
                    stato="confermato"
                    trasporti={confermati}
                    isLoading={loadingConfermati}
                    onCompleta={handleCompleta}
                    onModifica={handleModifica}
                    onElimina={handleElimina}
                />

                {/* Tabella 3: COMPLETATI */}
                <TrasportiTable
                    stato="completato"
                    trasporti={completati}
                    isLoading={loadingCompletati}
                    onDettaglio={handleDettaglio}
                    onModifica={handleModifica}
                    onElimina={handleElimina}
                />
            </div>

            {/* Dialogs */}

            <ConfermaTrasportoDialog
                open={confermaDialogOpen}
                onOpenChange={setConfermaDialogOpen}
                trasportoId={selectedTrasporto?.id || null}
                trasportoInfo={selectedTrasporto ? {
                    mezzo: selectedTrasporto.mezzo,
                    tratta: selectedTrasporto.tratta,
                    prezzo: selectedTrasporto.prezzo,
                } : undefined}
            />

            <CompletaTrasportoDialog
                open={completaDialogOpen}
                onOpenChange={setCompletaDialogOpen}
                trasportoId={selectedTrasporto?.id || null}
                trasportoInfo={selectedTrasporto ? {
                    mezzo: selectedTrasporto.mezzo,
                    tratta: selectedTrasporto.tratta,
                } : undefined}
            />

            <EliminaTrasportoDialog
                open={eliminaDialogOpen}
                onOpenChange={setEliminaDialogOpen}
                trasportoId={selectedTrasporto?.id || null}
                trasportoInfo={selectedTrasporto ? {
                    mezzo: selectedTrasporto.mezzo,
                    tratta: selectedTrasporto.tratta,
                } : undefined}
            />
        </div>
    );
}
