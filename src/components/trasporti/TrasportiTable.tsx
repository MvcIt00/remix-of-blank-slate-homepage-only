import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface TrasportoRow {
    id_trasporto: string;
    stato: 'richiesto' | 'confermato' | 'completato';
    data_programmata: string | null;
    data_effettiva: string | null;
    prezzo_cliente: number | null;
    metadata: any;
    mezzo: {
        id_mezzo: string;
        seriale_telaio: string;
        marca: string;
        modello: string;
        targa: string;
    } | null;
    vettore: {
        id_anagrafica: string;
        ragione_sociale: string | null;
        nome: string | null;
        cognome: string | null;
    } | null;
    sede_partenza: {
        id_sede: string;
        nome_sede: string;
        citta: string;
    } | null;
    sede_arrivo: {
        id_sede: string;
        nome_sede: string;
        citta: string;
    } | null;
}

interface TrasportiTableProps {
    stato: 'richiesto' | 'confermato' | 'completato';
    trasporti: TrasportoRow[];
    isLoading: boolean;
    onConferma?: (id: string) => void;
    onCompleta?: (id: string) => void;
    onModifica: (id: string) => void;
    onElimina: (id: string) => void;
    onDettaglio?: (id: string) => void;
}

export function TrasportiTable({
    stato,
    trasporti,
    isLoading,
    onConferma,
    onCompleta,
    onModifica,
    onElimina,
    onDettaglio,
}: TrasportiTableProps) {

    const getStatoBadge = () => {
        switch (stato) {
            case 'richiesto':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">🟡 RICHIESTI ({trasporti.length})</Badge>;
            case 'confermato':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">🔵 CONFERMATI ({trasporti.length})</Badge>;
            case 'completato':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">🟢 COMPLETATI ({trasporti.length})</Badge>;
        }
    };

    const getMezzoDisplay = (trasporto: TrasportoRow) => {
        if (trasporto.mezzo) {
            return (
                <div className="space-y-0.5">
                    <div className="font-medium">{trasporto.mezzo.marca} {trasporto.mezzo.modello}</div>
                    <div className="text-xs text-muted-foreground">{trasporto.mezzo.seriale_telaio}</div>
                </div>
            );
        }
        // Mezzo eliminato - mostra da metadata
        if (trasporto.metadata?.mezzo) {
            return (
                <div className="space-y-0.5">
                    <div className="font-medium text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        [DEL] {trasporto.metadata.mezzo.marca} {trasporto.metadata.mezzo.modello}
                    </div>
                    <div className="text-xs text-muted-foreground">{trasporto.metadata.mezzo.seriale}</div>
                </div>
            );
        }
        return <span className="text-muted-foreground">-</span>;
    };

    const getVettoreDisplay = (trasporto: TrasportoRow) => {
        if (trasporto.vettore) {
            return trasporto.vettore.ragione_sociale || `${trasporto.vettore.nome} ${trasporto.vettore.cognome}`;
        }
        // Vettore eliminato - mostra da metadata
        if (trasporto.metadata?.vettore) {
            return (
                <span className="text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {trasporto.metadata.vettore.ragione_sociale || `${trasporto.metadata.vettore.nome} ${trasporto.metadata.vettore.cognome}`}
                </span>
            );
        }
        return <span className="text-muted-foreground">-</span>;
    };

    const getSedeDisplay = (trasporto: TrasportoRow) => {
        const partenza = trasporto.sede_partenza?.nome_sede || trasporto.metadata?.sede_partenza?.nome || '?';
        const arrivo = trasporto.sede_arrivo?.nome_sede || trasporto.metadata?.sede_arrivo?.nome || '?';
        return `${partenza} → ${arrivo}`;
    };

    const getPrezzoDisplay = (trasporto: TrasportoRow) => {
        if (trasporto.prezzo_cliente === null) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Mancante
                </Badge>
            );
        }
        return `€${trasporto.prezzo_cliente.toFixed(2)}`;
    };

    const getDataDisplay = (trasporto: TrasportoRow) => {
        const data = stato === 'completato' ? trasporto.data_effettiva : trasporto.data_programmata;
        if (!data) return '-';
        return format(new Date(data), 'dd/MM/yyyy', { locale: it });
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    {getStatoBadge()}
                </div>
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    Caricamento...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                {getStatoBadge()}
            </div>

            {trasporti.length === 0 ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    Nessun trasporto {stato}
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[15%]">Mezzo</TableHead>
                                <TableHead className="w-[15%]">Da → A</TableHead>
                                <TableHead className="w-[15%]">Vettore</TableHead>
                                <TableHead className="w-[10%]">Prezzo</TableHead>
                                <TableHead className="w-[10%]">Data</TableHead>
                                <TableHead className="w-[35%]">Azioni</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trasporti.map((trasporto) => (
                                <TableRow key={trasporto.id_trasporto}>
                                    <TableCell>{getMezzoDisplay(trasporto)}</TableCell>
                                    <TableCell>{getSedeDisplay(trasporto)}</TableCell>
                                    <TableCell>{getVettoreDisplay(trasporto)}</TableCell>
                                    <TableCell>{getPrezzoDisplay(trasporto)}</TableCell>
                                    <TableCell>{getDataDisplay(trasporto)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {/* Azioni contestuali per stato */}
                                            {stato === 'richiesto' && onConferma && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => onConferma(trasporto.id_trasporto)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Conferma
                                                </Button>
                                            )}

                                            {stato === 'confermato' && onCompleta && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => onCompleta(trasporto.id_trasporto)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Completa
                                                </Button>
                                            )}

                                            {stato === 'completato' && onDettaglio && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onDettaglio(trasporto.id_trasporto)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Dettaglio
                                                </Button>
                                            )}

                                            {/* Azioni comuni */}
                                            {stato !== 'completato' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onModifica(trasporto.id_trasporto)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Modifica
                                                </Button>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => onElimina(trasporto.id_trasporto)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Elimina
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
