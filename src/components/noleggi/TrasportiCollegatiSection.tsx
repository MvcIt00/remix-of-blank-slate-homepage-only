import { PackageOpen, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrasportiByNoleggio } from "@/hooks/useTrasporti";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useState } from "react";
import { RichiediTrasportoDialog } from "@/components/trasporti/RichiediTrasportoDialog";

interface TrasportiCollegatiSectionProps {
    noleggioId: string;
}

export function TrasportiCollegatiSection({ noleggioId }: TrasportiCollegatiSectionProps) {
    const { data: trasporti = [], isLoading } = useTrasportiByNoleggio(noleggioId);
    const [richiediDialogOpen, setRichiediDialogOpen] = useState(false);

    const getStatoBadge = (stato: string) => {
        switch (stato) {
            case 'richiesto':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Richiesto</Badge>;
            case 'confermato':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Confermato</Badge>;
            case 'completato':
                return <Badge className="bg-green-100 text-green-800 border-green-300">Completato</Badge>;
            default:
                return <Badge variant="outline">{stato}</Badge>;
        }
    };

    const formatDate = (d: string | null) =>
        d ? format(new Date(d), "dd/MM/yyyy", { locale: it }) : "-";

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <PackageOpen className="h-4 w-4" /> Trasporti Collegati
                </h3>
                <Button
                    size="sm"
                    onClick={() => setRichiediDialogOpen(true)}
                    className="h-8"
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Richiedi Trasporto
                </Button>
            </div>

            {isLoading ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                    Caricamento...
                </div>
            ) : trasporti.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-md">
                    Nessun trasporto richiesto
                </div>
            ) : (
                <div className="space-y-2">
                    {trasporti.map((trasporto: any) => (
                        <div
                            key={trasporto.id_trasporto}
                            className="border rounded-md p-3 text-sm space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                {getStatoBadge(trasporto.stato)}
                                <div className="flex gap-1">
                                    {trasporto.stato === 'richiesto' && (
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-muted-foreground">Mezzo:</span>
                                    <p className="font-medium">
                                        {trasporto.mezzo
                                            ? `${trasporto.mezzo.marca} ${trasporto.mezzo.modello}`
                                            : trasporto.metadata?.mezzo
                                                ? `${trasporto.metadata.mezzo.marca} ${trasporto.metadata.mezzo.modello}`
                                                : "-"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Tratta:</span>
                                    <p className="font-medium">
                                        {(() => {
                                            const partenza = trasporto.sede_partenza;
                                            const arrivo = trasporto.sede_arrivo;

                                            const formatSede = (sede: any) => {
                                                if (!sede) return "?";
                                                const parts = [sede.nome_sede];
                                                if (sede.indirizzo) parts.push(sede.indirizzo);
                                                if (sede.citta) parts.push(sede.citta);
                                                return parts.join(", ");
                                            };

                                            return `${formatSede(partenza)} → ${formatSede(arrivo)}`;
                                        })()}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Data:</span>
                                    <p className="font-medium">
                                        {formatDate(trasporto.stato === 'completato' ? trasporto.data_effettiva : trasporto.data_programmata)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Prezzo:</span>
                                    <p className="font-medium">
                                        {trasporto.prezzo_cliente ? `€${trasporto.prezzo_cliente.toFixed(2)}` : "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <RichiediTrasportoDialog
                open={richiediDialogOpen}
                onOpenChange={setRichiediDialogOpen}
                idNoleggio={noleggioId}
            />
        </section>
    );
}
