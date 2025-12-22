import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RotateCcw, Clock } from "lucide-react";
import { RiattivaNoleggioDialog } from "@/components/noleggi/riattiva_noleggio_dialog";

interface StoricoRecord {
    id_storico: string;
    id_noleggio: string;
    mezzo_descrizione: string | null;
    ragione_sociale_cliente: string | null;
    sede_operativa_descrizione: string | null;
    data_inizio: string | null;
    data_fine: string | null;
    data_fine_periodo: string | null;
    data_terminazione_effettiva: string | null;
    tempo_indeterminato: boolean | null;
    prezzo_noleggio: number | null;
    prezzo_trasporto: number | null;
    tipo_canone: "giornaliero" | "mensile" | null;
    tipo_evento: "creazione" | "modifica" | "terminazione" | "cancellazione" | "riattivazione" | "cambio_sede";
    data_evento: string;
    note: string | null;
    is_terminato: boolean | null;
}

export default function StoricoNoleggi() {
    const [storico, setStorico] = useState<StoricoRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<StoricoRecord | null>(null);
    const [riattivaDialogOpen, setRiattivaDialogOpen] = useState(false);

    useEffect(() => {
        loadStorico();
    }, []);

    async function loadStorico() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("noleggi_storico")
                .select("*")
                .in("tipo_evento", ["terminazione", "cambio_sede", "cancellazione"])
                .order("data_evento", { ascending: false });

            if (error) throw error;
            setStorico((data as StoricoRecord[]) || []);
        } catch (error) {
            console.error("Error loading storico:", error);
            toast({
                title: "Errore",
                description: "Impossibile caricare lo storico noleggi",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    function formatDate(date: string | null): string {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("it-IT");
    }

    function formatDateTime(date: string): string {
        return new Date(date).toLocaleString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatPrezzo(prezzo: number | null, tipo: "giornaliero" | "mensile" | null): string {
        if (!prezzo) return "-";
        const suffix = tipo === "giornaliero" ? "/gg" : "/mese";
        return `€ ${prezzo.toFixed(2)}${suffix}`;
    }

    function getTipoEventoBadge(tipo: string) {
        switch (tipo) {
            case "terminazione":
                return <Badge variant="default" className="bg-red-500">Terminato</Badge>;
            case "cambio_sede":
                return <Badge variant="default" className="bg-blue-500">Cambio Sede</Badge>;
            case "cancellazione":
                return <Badge variant="destructive">Cancellato</Badge>;
            case "riattivazione":
                return <Badge variant="default" className="bg-green-500">Riattivato</Badge>;
            default:
                return <Badge variant="outline">{tipo}</Badge>;
        }
    }

    function handleRipristina(record: StoricoRecord) {
        setSelectedRecord(record);
        setRiattivaDialogOpen(true);
    }

    const columns: DataTableColumn<StoricoRecord>[] = [
        {
            key: "mezzo_descrizione",
            label: "Mezzo",
            sortable: true,
            render: (value) => value || "-",
        },
        {
            key: "ragione_sociale_cliente",
            label: "Cliente",
            sortable: true,
            render: (value) => value || "-",
        },
        {
            key: "sede_operativa_descrizione",
            label: "Sede Operativa",
            sortable: true,
            render: (value) => value || "-",
        },
        {
            key: "data_inizio",
            label: "Inizio Periodo",
            sortable: true,
            render: (value) => formatDate(value),
        },
        {
            key: "data_fine_periodo",
            label: "Fine Periodo",
            sortable: true,
            render: (value, row) => {
                if (row.tipo_evento === "terminazione") {
                    return formatDate(row.data_terminazione_effettiva || value);
                }
                return formatDate(value);
            },
        },
        {
            key: "prezzo_noleggio",
            label: "Canone",
            sortable: true,
            render: (value, row) => formatPrezzo(value, row.tipo_canone),
        },
        {
            key: "tipo_evento",
            label: "Tipo",
            sortable: true,
            render: (value) => getTipoEventoBadge(value),
        },
        {
            key: "data_evento",
            label: "Data Registrazione",
            sortable: true,
            render: (value) => formatDateTime(value),
        },
        {
            key: "note",
            label: "Note",
            render: (value) => {
                if (!value) return "-";
                return (
                    <span className="max-w-[200px] truncate block" title={value}>
                        {value}
                    </span>
                );
            },
        },
    ];

    const renderActions = (record: StoricoRecord) => {
        if (record.tipo_evento === "terminazione") {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRipristina(record)}
                    title="Ripristina noleggio (annulla terminazione)"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Storico Noleggi</h1>
                    <p className="text-muted-foreground">
                        Cronologia dei noleggi terminati e archivio eventi.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Archivio Periodi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={storico}
                        columns={columns}
                        actions={renderActions}
                        loading={loading}
                        searchPlaceholder="Cerca nello storico..."
                        emptyMessage="Nessun periodo completato trovato"
                    />
                </CardContent>
            </Card>

            <RiattivaNoleggioDialog
                open={riattivaDialogOpen}
                onOpenChange={setRiattivaDialogOpen}
                noleggioId={selectedRecord?.id_noleggio || ""}
                storicoId={selectedRecord?.id_storico || ""}
                onSuccess={() => {
                    setSelectedRecord(null);
                    loadStorico();
                }}
            />
        </div>
    );
}
