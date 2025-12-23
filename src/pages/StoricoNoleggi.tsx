import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { supabase } from "@/integrations/supabase/client";
import { RotateCcw, Clock, Loader2 } from "lucide-react";
import { RiattivaNoleggioDialog } from "@/components/noleggi/riattiva_noleggio_dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StoricoNoleggioView } from "@/types/database_views";

export default function StoricoNoleggi() {
    const [selectedRecord, setSelectedRecord] = useState<StoricoNoleggioView | null>(null);
    const [riattivaDialogOpen, setRiattivaDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    // Fetch con React Query e VIEW ottimizzata
    const { data: storico = [], isLoading } = useQuery({
        queryKey: ["storico_noleggi"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("vw_storico_noleggi" as any)
                .select("*")
                .order("data_evento", { ascending: false });

            if (error) throw error;
            return data as unknown as StoricoNoleggioView[];
        },
    });

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
                return <Badge variant="default" className="bg-red-500 hover:bg-red-600">Terminato</Badge>;
            case "cambio_sede":
                return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Cambio Sede</Badge>;
            case "cancellazione":
                return <Badge variant="destructive">Cancellato</Badge>;
            case "riattivazione":
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Riattivato</Badge>;
            default:
                return <Badge variant="outline">{tipo}</Badge>;
        }
    }

    function handleRipristina(record: StoricoNoleggioView) {
        setSelectedRecord(record);
        setRiattivaDialogOpen(true);
    }

    const columns: DataTableColumn<StoricoNoleggioView>[] = [
        {
            key: "mezzo_descrizione",
            label: "Mezzo",
            sortable: true,
            render: (value) => <span className="font-medium">{value || "-"}</span>,
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
            render: (value) => value || "-",
        },
        {
            key: "data_inizio",
            label: "Inizio",
            render: (value) => formatDate(value),
        },
        {
            key: "data_fine_periodo",
            label: "Fine",
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
            render: (value, row) => formatPrezzo(value, row.tipo_canone),
        },
        {
            key: "tipo_evento",
            label: "Tipo",
            render: (value) => getTipoEventoBadge(value),
        },
        {
            key: "data_evento",
            label: "Registrato il",
            sortable: true,
            render: (value) => <span className="text-xs text-muted-foreground">{formatDateTime(value)}</span>,
        },
        {
            key: "note",
            label: "Note",
            render: (value) => {
                if (!value) return "-";
                return (
                    <span className="max-w-[150px] truncate block text-xs" title={value}>
                        {value}
                    </span>
                );
            },
        },
    ];

    const renderActions = (record: StoricoNoleggioView) => {
        if (record.tipo_evento === "terminazione") {
            return (
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRipristina(record)}
                    title="Ripristina noleggio (annulla terminazione)"
                >
                    <RotateCcw className="h-4 w-4 text-blue-600" />
                </Button>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Storico Noleggi</h1>
                    <p className="text-muted-foreground">
                        Cronologia completa dei noleggi terminati e archivio eventi.
                    </p>
                </div>
            </div>

            <Card className="border-muted/50 shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/20">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-primary" />
                        Archivio Periodi
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <DataTable
                            data={storico}
                            columns={columns}
                            actions={renderActions}
                            searchPlaceholder="Cerca mezzo, cliente o note..."
                            emptyMessage="Nessun evento trovato nello storico."
                        />
                    )}
                </CardContent>
            </Card>

            <RiattivaNoleggioDialog
                open={riattivaDialogOpen}
                onOpenChange={setRiattivaDialogOpen}
                noleggioId={selectedRecord?.id_noleggio || ""}
                storicoId={selectedRecord?.id_storico || ""}
                onSuccess={() => {
                    setSelectedRecord(null);
                    queryClient.invalidateQueries({ queryKey: ["storico_noleggi"] });
                }}
            />
        </div>
    );
}
