import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    FileText,
    Calendar,
    MapPin,
    Euro,
    Truck,
    ExternalLink,
    Ban,
    Pencil,
    Trash2,
    FileCheck,
    AlertTriangle,
    PackageOpen,
    Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContrattoStatusButton } from "@/components/contratti";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useTrasportiByNoleggio } from "@/hooks/useTrasporti";
import { useState } from "react";
import { TrasportiCollegatiSection } from "./TrasportiCollegatiSection";

// Importa le interfacce necessarie (o ridefiniscile se sono locali in NoleggiAttivi, meglio esportarle)
// Per ora uso 'any' per le parti complesse per non bloccarmi sui tipi, ma l'ideale è condividere Noleggio
// TODO: Centralizzare interfaccia Noleggio in types/noleggi.ts

interface RentalDetailSheetProps {
    noleggio: any; // Type Noleggio
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (noleggio: any) => void;
    onTerminate: (noleggio: any) => void;
    onDelete: (noleggio: any) => void;
    onRefetch: () => void;
}

export function RentalDetailSheet({
    noleggio,
    open,
    onOpenChange,
    onEdit,
    onTerminate,
    onDelete,
    onRefetch
}: RentalDetailSheetProps) {
    const navigate = useNavigate();

    if (!noleggio) return null;

    const isTerminato = noleggio.stato_noleggio === "terminato" || noleggio.is_terminato;
    const isArchiviato = noleggio.stato_noleggio === "archiviato";

    // Helper date
    const formatDate = (d: string | null) =>
        d ? format(new Date(d), "d MMMM yyyy", { locale: it }) : "-";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant={isTerminato ? "secondary" : "default"}>
                            {noleggio.stato_noleggio?.toUpperCase() || "ATTIVO"}
                        </Badge>
                        {noleggio.codice_noleggio && (
                            <span className="text-xs text-muted-foreground font-mono">
                                #{noleggio.codice_noleggio}
                            </span>
                        )}
                    </div>
                    <SheetTitle className="text-xl">
                        {noleggio.Mezzi?.marca} {noleggio.Mezzi?.modello}
                    </SheetTitle>
                    <SheetDescription>
                        Matricola: <span className="font-mono text-foreground">{noleggio.Mezzi?.matricola}</span>
                        <br />
                        Cliente: <span className="font-semibold text-foreground">{noleggio.Anagrafiche?.ragione_sociale}</span>
                    </SheetDescription>
                </SheetHeader>

                {/* --- SEZIONE COLLEGAMENTI (PREVENTIVO) --- */}
                {noleggio.id_preventivo && (
                    <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-lg dark:bg-blue-950/20 dark:border-blue-900">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md mt-1">
                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Preventivo Collegato</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                        Questo noleggio è stato generato dal preventivo (RIF: {noleggio.rif_preventivo || "N/A"})
                                    </p>
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                        onClick={() => navigate(`/preventivi-noleggio?id=${noleggio.id_preventivo}`)} // Assumendo route
                                    >
                                        Apri Preventivo <ExternalLink className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-6">

                    {/* --- DETTAGLI --- */}
                    <section>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Periodo e Costi
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block text-xs">Data Inizio</span>
                                <span className="font-medium">{formatDate(noleggio.data_inizio)}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Data Fine</span>
                                <span className="font-medium">
                                    {noleggio.tempo_indeterminato ? "Indeterminato" : formatDate(noleggio.data_fine)}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Canone</span>
                                <span className="font-medium">€ {noleggio.prezzo_noleggio?.toFixed(2)} / {noleggio.tipo_canone === 'giornaliero' ? 'gg' : 'mese'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Trasporto</span>
                                <span className="font-medium">{noleggio.prezzo_trasporto ? `€ ${noleggio.prezzo_trasporto.toFixed(2)}` : "-"}</span>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* --- SEDE --- */}
                    <section>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Luogo di Utilizzo
                        </h3>
                        <div className="bg-muted/40 p-3 rounded-md text-sm">
                            <p className="font-medium">{noleggio.Sedi?.nome_sede || "Sede Principale"}</p>
                            <p className="text-muted-foreground">{noleggio.Sedi?.indirizzo}</p>
                            <p className="text-muted-foreground">{noleggio.Sedi?.citta}</p>
                        </div>
                    </section>

                    <Separator />

                    {/* --- CONTRATTO (Action Complex) --- */}
                    <section>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                            <FileCheck className="h-4 w-4" /> Gestione Contratto
                        </h3>
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Stato del documento formale. Puoi generare, scaricare o caricare il contratto firmato qui.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <ContrattoStatusButton
                                    noleggioId={noleggio.id_noleggio}
                                    contrattoFirmato={noleggio.documenti_noleggio?.[0] || null}
                                    richiedeContratto={noleggio.Anagrafiche?.richiede_contratto_noleggio !== false}
                                    hasDraftContract={(noleggio.contratti_noleggio && noleggio.contratti_noleggio.length > 0) || false}
                                    onUploadSuccess={onRefetch}
                                    fullWidth // Custom prop to make it block? Or just style it
                                />
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* --- TRASPORTI COLLEGATI --- */}
                    <TrasportiCollegatiSection noleggioId={noleggio.id_noleggio} />
                </div>

                <SheetFooter className="mt-12 flex-col gap-2 sm:flex-col sm:space-x-0 border-t pt-6">
                    {!isTerminato && !isArchiviato && (
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <Button variant="outline" onClick={() => onEdit(noleggio)}>
                                <Pencil className="mr-2 h-4 w-4" /> Modifica
                            </Button>
                            <Button variant="secondary" onClick={() => onTerminate(noleggio)} className="bg-amber-100 text-amber-900 hover:bg-amber-200 border-amber-200">
                                <Ban className="mr-2 h-4 w-4" /> Termina
                            </Button>
                        </div>
                    )}

                    <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full" onClick={() => onDelete(noleggio)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Elimina Noleggio
                    </Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    );
}
