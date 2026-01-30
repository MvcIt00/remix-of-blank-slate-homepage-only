import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText, Upload, Truck, Package, Eye, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NoleggioConAllarmi, type Allarmi } from "@/hooks/useNoleggiStats";
import { formatDateIT } from "@/lib/utils";
import { ContrattoPreviewDialog } from "@/components/contratti/ContrattoPreviewDialog";
import { ContrattoUploadDialog } from "@/components/contratti/ContrattoUploadDialog";
import { RichiediTrasportoDialog } from "@/components/trasporti/RichiediTrasportoDialog";
import { ConfermaTrasportoDialog } from "@/components/trasporti/ConfermaTrasportoDialog";
import { CompletaTrasportoDialog } from "@/components/trasporti/CompletaTrasportoDialog";
import { RentalDetailSheet } from "@/components/noleggi/RentalDetailSheet";
import { DatiAziendaOwner } from "@/components/pdf/LetterheadPDF";

/**
 * FILOSOFIA (AX04 + AX06):
 * Dialog filtrato che mostra SOLO i noleggi rilevanti per la vista richiesta.
 * Azioni CONTESTUALI: ogni record mostra solo le azioni che hanno senso operativo.
 */

interface NoleggiFilteredDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filterType: "stato" | "allarme";
    filterValue: string;
    title: string;
    noleggi: NoleggioConAllarmi[];
    onRefresh?: () => void; // Callback per refresh stats
}

interface AzioneButton {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
}

/**
 * Hook per fetch owner data dinamico da DB
 */
function useOwnerData() {
    return useQuery({
        queryKey: ["owner-data"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("Anagrafiche")
                .select("*")
                .eq("is_owner", true)
                .single();

            if (error) {
                console.error("Error fetching owner:", error);
                // Fallback a dati hardcoded
                return {
                    ragione_sociale: "MVC Toscana Carrelli",
                    partita_iva: "12345678901",
                    indirizzo: "Viale Magri 115",
                    citta: "Livorno",
                    cap: "57100",
                    provincia: "LI",
                    telefono: "0586.000000",
                    email: "info@mvctoscanacarrelli.it",
                    pec: null,
                    codice_univoco: null,
                    iban: null,
                } as DatiAziendaOwner;
            }

            // Cast as any perché tabella Anagrafiche non ha tutti i campi (probabilmente in Sedi)
            const anagrafica = data as any;

            return {
                ragione_sociale: anagrafica.ragione_sociale || "",
                partita_iva: anagrafica.partita_iva || null,
                indirizzo: anagrafica.indirizzo || null,
                citta: anagrafica.citta || null,
                cap: anagrafica.cap || null,
                provincia: anagrafica.provincia || null,
                telefono: anagrafica.telefono || null,
                email: anagrafica.email || null,
                pec: anagrafica.pec || null,
                codice_univoco: anagrafica.codice_univoco || null,
                iban: anagrafica.iban || null,
            } as DatiAziendaOwner;
        },
        staleTime: 1000 * 60 * 10, // Cache 10 minuti
    });
}

export function NoleggiFilteredDialog({
    open,
    onOpenChange,
    filterType,
    filterValue,
    title,
    noleggi,
    onRefresh,
}: NoleggiFilteredDialogProps) {
    // Fetch owner data
    const { data: ownerData } = useOwnerData();

    // State per dialog azioni
    const [contrattoDialog, setContrattoDialog] = useState<{
        open: boolean;
        noleggio: NoleggioConAllarmi | null;
    }>({ open: false, noleggio: null });

    const [uploadDialog, setUploadDialog] = useState<{
        open: boolean;
        noleggioId: string | null;
        documentId: string | null;
    }>({ open: false, noleggioId: null, documentId: null });

    const [trasportoDialog, setTrasportoDialog] = useState<{
        open: boolean;
        noleggioId: string | null;
        trasportoId: string | null; // Per edit mode
    }>({ open: false, noleggioId: null, trasportoId: null });

    const [confermaTrasportoDialog, setConfermaTrasportoDialog] = useState<{
        open: boolean;
        trasportoId: string | null;
    }>({ open: false, trasportoId: null });

    const [completaTrasportoDialog, setCompletaTrasportoDialog] = useState<{
        open: boolean;
        trasportoId: string | null;
    }>({ open: false, trasportoId: null });

    const [detailSheet, setDetailSheet] = useState<{
        open: boolean;
        noleggio: NoleggioConAllarmi | null;
    }>({ open: false, noleggio: null });

    // FILTRAGGIO
    const noleggiFiltrati = useMemo(() => {
        if (filterType === "stato") {
            return noleggi.filter((n) => n.stato_noleggio === filterValue);
        }

        // Filtraggio per allarme
        if (filterType === "allarme") {
            return noleggi.filter((n) => {
                switch (filterValue) {
                    case "contrattiDaGenerare":
                        return n.allarmi.contrattoDaGenerare;
                    case "contrattiDaAllegare":
                        return n.allarmi.contrattoDaAllegare;
                    case "trasportiConsegnaPendenti":
                        return n.allarmi.trasportoConsegnaPendente;
                    case "trasportiRitiroPendenti":
                        return n.allarmi.trasportoRitiroPendente;
                    default:
                        return false;
                }
            });
        }

        return noleggi;
    }, [noleggi, filterType, filterValue]);

    // Handler refresh completo
    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
            toast({
                title: "Dashboard aggiornata",
                description: "I dati sono stati aggiornati con successo",
            });
        }
    };

    // AZIONI CONTESTUALI
    const getAzioni = (noleggio: NoleggioConAllarmi): AzioneButton[] => {
        const azioni: AzioneButton[] = [];

        // ========================================================================
        // FILTRAGGIO AZIONI BASATO SU TIPO ALLARME CLICCATO
        // ========================================================================
        const isAlarmeTrasporti =
            filterType === "allarme" &&
            (filterValue === "trasportiConsegnaPendenti" ||
                filterValue === "trasportiRitiroPendenti");

        const isAllarmeContratti =
            filterType === "allarme" &&
            (filterValue === "contrattiDaGenerare" || filterValue === "contrattiDaAllegare");

        // ========================================================================
        // AZIONI CONTRATTI (solo se NON allarme trasporti)
        // ========================================================================
        if (!isAlarmeTrasporti) {
            // Azione: Genera Contratto
            if (noleggio.allarmi.contrattoDaGenerare) {
                azioni.push({
                    icon: <FileText className="h-4 w-4" />,
                    label: "Genera",
                    onClick: () => setContrattoDialog({ open: true, noleggio }),
                    variant: "default",
                });
            }

            // Azione: Upload Contratto Firmato
            if (noleggio.allarmi.contrattoDaAllegare) {
                azioni.push({
                    icon: <Upload className="h-4 w-4" />,
                    label: "Upload",
                    onClick: () => {
                        if (noleggio.contratto_bozza_info) {
                            setUploadDialog({
                                open: true,
                                noleggioId: noleggio.id_noleggio,
                                documentId: noleggio.contratto_bozza_info.id_contratto,
                            });
                        }
                    },
                    variant: "outline",
                });
            }
        }

        // ========================================================================
        // AZIONI TRASPORTI (solo se NON allarme contratti)
        // ========================================================================
        if (!isAllarmeContratti) {
            // Determina tipo trasporto (consegna o ritiro basato su allarme attivo)
            const isConsegna = noleggio.allarmi.trasportoConsegnaPendente;
            const isRitiro = noleggio.allarmi.trasportoRitiroPendente;
            const trasportoInfo = isConsegna
                ? noleggio.allarmi.trasportoConsegnaInfo
                : noleggio.allarmi.trasportoRitiroInfo;

            if (isConsegna || isRitiro) {
                const icon = isConsegna ? (
                    <Truck className="h-4 w-4" />
                ) : (
                    <Package className="h-4 w-4" />
                );

                // CASO 1: Trasporto NON esiste → Richiedi Trasporto
                if (!trasportoInfo.exists) {
                    azioni.push({
                        icon,
                        label: "Richiedi Trasporto",
                        onClick: () =>
                            setTrasportoDialog({
                                open: true,
                                noleggioId: noleggio.id_noleggio,
                                trasportoId: null, // Create mode
                            }),
                        variant: "default",
                    });
                }

                // CASO 2: Trasporto RICHIESTO → Conferma + Modifica
                else if (trasportoInfo.stato === "richiesto") {
                    azioni.push({
                        icon,
                        label: "Conferma Trasporto",
                        onClick: () =>
                            setConfermaTrasportoDialog({
                                open: true,
                                trasportoId: trasportoInfo.trasportoId,
                            }),
                        variant: "default",
                    });
                    azioni.push({
                        icon: <Edit className="h-4 w-4" />,
                        label: "Modifica",
                        onClick: () =>
                            setTrasportoDialog({
                                open: true,
                                noleggioId: noleggio.id_noleggio,
                                trasportoId: trasportoInfo.trasportoId, // Edit mode
                            }),
                        variant: "ghost",
                    });
                }

                // CASO 3: Trasporto CONFERMATO → Completa + Modifica
                else if (trasportoInfo.stato === "confermato") {
                    azioni.push({
                        icon,
                        label: "Completa Trasporto",
                        onClick: () =>
                            setCompletaTrasportoDialog({
                                open: true,
                                trasportoId: trasportoInfo.trasportoId,
                            }),
                        variant: "default",
                    });
                    azioni.push({
                        icon: <Edit className="h-4 w-4" />,
                        label: "Modifica",
                        onClick: () =>
                            setTrasportoDialog({
                                open: true,
                                noleggioId: noleggio.id_noleggio,
                                trasportoId: trasportoInfo.trasportoId, // Edit mode
                            }),
                        variant: "ghost",
                    });
                }

                // CASO 4: Trasporto COMPLETATO → Nessuna azione (allarme non dovrebbe essere attivo)
            }
        }

        // Azione sempre disponibile: Visualizza
        azioni.push({
            icon: <Eye className="h-4 w-4" />,
            label: "Dettagli",
            onClick: () => setDetailSheet({ open: true, noleggio }),
            variant: "ghost",
        });

        return azioni;
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-6xl max-h-[85vh] p-0 flex flex-col">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle className="text-xl">
                            {title} ({noleggiFiltrati.length})
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="flex-1 px-6 pb-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Codice</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Mezzo</TableHead>
                                    <TableHead className="w-[200px]">Periodo</TableHead>
                                    <TableHead className="w-[100px] text-center">
                                        Allarmi
                                    </TableHead>
                                    <TableHead className="w-[240px] text-right">Azioni</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {noleggiFiltrati.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            Nessun noleggio trovato
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    noleggiFiltrati.map((noleggio) => {
                                        const azioni = getAzioni(noleggio);
                                        return (
                                            <TableRow key={noleggio.id_noleggio}>
                                                <TableCell className="font-medium">
                                                    {noleggio.codice_noleggio ||
                                                        noleggio.id_noleggio.slice(0, 8)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {noleggio.cliente_ragione_sociale}
                                                        </span>
                                                        {noleggio.sede_citta && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {noleggio.sede_citta}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {noleggio.mezzo_marca} {noleggio.mezzo_modello}
                                                        </span>
                                                        {noleggio.mezzo_matricola && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mat. {noleggio.mezzo_matricola}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-sm">
                                                        <span>
                                                            Dal:{" "}
                                                            {noleggio.data_inizio
                                                                ? formatDateIT(noleggio.data_inizio)
                                                                : "—"}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {noleggio.tempo_indeterminato
                                                                ? "A tempo indeterminato"
                                                                : noleggio.data_fine
                                                                    ? `Al: ${formatDateIT(noleggio.data_fine)}`
                                                                    : "—"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <AllarmiIcons allarmi={noleggio.allarmi} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {azioni.map((azione, idx) => (
                                                            <TooltipProvider key={idx}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            size="sm"
                                                                            variant={azione.variant || "outline"}
                                                                            onClick={azione.onClick}
                                                                            className="h-8 px-2"
                                                                        >
                                                                            {azione.icon}
                                                                            <span className="ml-1 hidden sm:inline">
                                                                                {azione.label}
                                                                            </span>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>{azione.label}</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Dialog Genera Contratto */}
            {contrattoDialog.noleggio && ownerData && (
                <ContrattoPreviewDialog
                    open={contrattoDialog.open}
                    onOpenChange={(open) =>
                        setContrattoDialog((prev) => ({ ...prev, open }))
                    }
                    datiOwner={ownerData}
                    datiCliente={{
                        ragione_sociale:
                            contrattoDialog.noleggio.cliente_ragione_sociale,
                        indirizzo: "",
                        citta: contrattoDialog.noleggio.sede_citta || "",
                        cap: "",
                        provincia: "",
                        p_iva: (contrattoDialog.noleggio as any).cliente_piva || "",
                        telefono: "",
                        email: "",
                    }}
                    datiMezzo={{
                        marca: contrattoDialog.noleggio.mezzo_marca || "",
                        modello: contrattoDialog.noleggio.mezzo_modello || "",
                        matricola: contrattoDialog.noleggio.mezzo_matricola || "",
                        anno: "",
                        targa: "",
                    }}
                    noleggioData={{
                        id_mezzo: contrattoDialog.noleggio.id_mezzo,
                        id_anagrafica: contrattoDialog.noleggio.id_anagrafica,
                        id_anagrafica_fornitore: null,
                        data_inizio: contrattoDialog.noleggio.data_inizio || undefined,
                        data_fine: contrattoDialog.noleggio.data_fine || undefined,
                        tempo_indeterminato:
                            contrattoDialog.noleggio.tempo_indeterminato || false,
                        prezzo_noleggio:
                            contrattoDialog.noleggio.prezzo_noleggio || undefined,
                        tipo_canone: contrattoDialog.noleggio.tipo_canone || undefined,
                    }}
                    existingNoleggioId={contrattoDialog.noleggio.id_noleggio}
                    onSuccess={() => {
                        setContrattoDialog({ open: false, noleggio: null });
                        handleRefresh();
                    }}
                />
            )}

            {/* Dialog Upload Firmato */}
            {uploadDialog.noleggioId && (
                <ContrattoUploadDialog
                    open={uploadDialog.open}
                    onOpenChange={(open) =>
                        setUploadDialog((prev) => ({ ...prev, open }))
                    }
                    noleggioId={uploadDialog.noleggioId}
                    existingDocumentId={uploadDialog.documentId || undefined}
                    onUploadSuccess={() => {
                        setUploadDialog({
                            open: false,
                            noleggioId: null,
                            documentId: null,
                        });
                        handleRefresh();
                    }}
                />
            )}

            {/* Dialog Richiedi Trasporti */}
            {trasportoDialog.noleggioId && (
                <RichiediTrasportoDialog
                    idNoleggio={trasportoDialog.noleggioId}
                    trasportoId={trasportoDialog.trasportoId}
                    open={trasportoDialog.open}
                    onOpenChange={(open) =>
                        setTrasportoDialog((prev) => ({ ...prev, open }))
                    }
                />
            )}

            {/* Dialog Conferma Trasporto */}
            {confermaTrasportoDialog.trasportoId && (
                <ConfermaTrasportoDialog
                    open={confermaTrasportoDialog.open}
                    onOpenChange={(open) =>
                        setConfermaTrasportoDialog((prev) => ({ ...prev, open }))
                    }
                    trasportoId={confermaTrasportoDialog.trasportoId}
                    onSuccess={handleRefresh}
                />
            )}

            {/* Dialog Completa Trasporto */}
            {completaTrasportoDialog.trasportoId && (
                <CompletaTrasportoDialog
                    open={completaTrasportoDialog.open}
                    onOpenChange={(open) =>
                        setCompletaTrasportoDialog((prev) => ({ ...prev, open }))
                    }
                    trasportoId={completaTrasportoDialog.trasportoId}
                    onSuccess={handleRefresh}
                />
            )}

            {/* Detail Sheet */}
            {detailSheet.noleggio && (
                <RentalDetailSheet
                    noleggio={detailSheet.noleggio as any} // Type compatibility
                    open={detailSheet.open}
                    onOpenChange={(open) =>
                        setDetailSheet((prev) => ({ ...prev, open }))
                    }
                    onEdit={() => {
                        // TODO: Implementare edit inline se necessario
                    }}
                    onTerminate={() => {
                        // TODO: Implementare terminazione inline se necessario
                    }}
                    onDelete={() => {
                        // TODO: Implementare eliminazione inline se necessario
                    }}
                    onRefetch={handleRefresh}
                />
            )}
        </>
    );
}

/**
 * Componente visualizzazione icone allarmi
 */
function AllarmiIcons({ allarmi }: { allarmi: Allarmi }) {
    const hasAllarmi = Object.values(allarmi).some((v) => typeof v === "boolean" && v);

    if (!hasAllarmi) {
        return (
            <Badge variant="outline" className="text-green-600 border-green-300">
                ✓ OK
            </Badge>
        );
    }

    return (
        <TooltipProvider>
            <div className="flex items-center justify-center gap-1">
                {allarmi.contrattoDaGenerare && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-lg cursor-help">📄</span>
                        </TooltipTrigger>
                        <TooltipContent>Contratto da generare</TooltipContent>
                    </Tooltip>
                )}
                {allarmi.contrattoDaAllegare && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-lg cursor-help">📝</span>
                        </TooltipTrigger>
                        <TooltipContent>Contratto da allegare</TooltipContent>
                    </Tooltip>
                )}
                {allarmi.trasportoConsegnaPendente && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-lg cursor-help">🚚</span>
                        </TooltipTrigger>
                        <TooltipContent>Trasporto consegna pendente</TooltipContent>
                    </Tooltip>
                )}
                {allarmi.trasportoRitiroPendente && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-lg cursor-help">📦</span>
                        </TooltipTrigger>
                        <TooltipContent>Trasporto ritiro pendente</TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    );
}
