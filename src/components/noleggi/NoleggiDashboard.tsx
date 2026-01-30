import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, FileText, FileEdit, Truck, Package } from "lucide-react";
import { useNoleggiStats } from "@/hooks/useNoleggiStats";
import { NoleggiFilteredDialog } from "./NoleggiFilteredDialog";
import { cn } from "@/lib/utils";

/**
 * CONFIGURAZIONE STATI E ALLARMI
 * Pattern AX04: informazione stratificata senza filtri interattivi
 */

const STATI_NOLEGGIO = [
    { key: 'futuri', label: 'Futuri', stato: 'futuro', color: 'text-blue-600' },
    { key: 'attivi', label: 'Attivi', stato: 'attivo', color: 'text-green-600' },
    { key: 'scaduti', label: 'Scaduti', stato: 'scaduto', color: 'text-orange-600' },
    { key: 'terminati', label: 'Terminati', stato: 'terminato', color: 'text-gray-500' },
] as const;

const ALLARMI = [
    {
        key: 'contrattiDaGenerare',
        label: 'contratti da generare',
        Icon: FileText,
    },
    {
        key: 'contrattiDaAllegare',
        label: 'contratti da allegare',
        Icon: FileEdit,
    },
    {
        key: 'trasportiConsegnaPendenti',
        label: 'noleggi senza consegna',
        Icon: Truck,
    },
    {
        key: 'trasportiRitiroPendenti',
        label: 'terminati senza ritiro',
        Icon: Package,
    },
] as const;

export function NoleggiDashboard() {
    const { stats, noleggiConAllarmi, loading, refetch } = useNoleggiStats();

    const [filterDialog, setFilterDialog] = useState<{
        open: boolean;
        filterType: 'stato' | 'allarme';
        filterValue: string;
        title: string;
    }>({
        open: false,
        filterType: 'stato',
        filterValue: '',
        title: ''
    });

    const handleOpenDialog = (
        type: 'stato' | 'allarme',
        value: string,
        label: string
    ) => {
        setFilterDialog({
            open: true,
            filterType: type,
            filterValue: value,
            title: label,
        });
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-4">
                    <div className="flex gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!stats) return null;

    // Calcola se ci sono allarmi da mostrare
    const hasAllarmi = ALLARMI.some((a) => stats[a.key] > 0);

    return (
        <>
            <Card>
                <CardContent className="pt-4 space-y-4">
                    {/* RIGA 1: Contatori Stati (cliccabili) */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        {STATI_NOLEGGIO.map((voce) => {
                            const count = stats[voce.key];
                            return (
                                <button
                                    key={voce.key}
                                    onClick={() => handleOpenDialog('stato', voce.stato, voce.label)}
                                    className={cn(
                                        "flex items-center gap-2 transition-colors hover:opacity-70",
                                        voce.color
                                    )}
                                >
                                    <div className={cn(
                                        "flex items-center justify-center h-7 w-7 rounded-full font-semibold text-sm",
                                        voce.key === 'futuri' && "bg-blue-100",
                                        voce.key === 'attivi' && "bg-green-100",
                                        voce.key === 'scaduti' && "bg-orange-100",
                                        voce.key === 'terminati' && "bg-gray-100"
                                    )}>
                                        {count}
                                    </div>
                                    <span className="text-sm font-medium">{voce.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* RIGA 2: Allarmi Operativi (solo se > 0) */}
                    {hasAllarmi && (
                        <>
                            <Separator />
                            <div className="flex items-center gap-2 text-sm text-amber-700">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">Richiede attenzione:</span>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {ALLARMI.filter((a) => stats[a.key] > 0).map((allarme) => {
                                    const count = stats[allarme.key];
                                    return (
                                        <button
                                            key={allarme.key}
                                            onClick={() => handleOpenDialog('allarme', allarme.key, `${count} ${allarme.label}`)}
                                            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full 
                                 bg-amber-50 text-amber-800 hover:bg-amber-100 
                                 transition-colors cursor-pointer border border-amber-200"
                                        >
                                            <allarme.Icon className="h-3.5 w-3.5" />
                                            <span className="font-medium">{count}</span>
                                            <span>{allarme.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Dialog Filtrato */}
            <NoleggiFilteredDialog
                open={filterDialog.open}
                onOpenChange={(open) => setFilterDialog((prev) => ({ ...prev, open }))}
                filterType={filterDialog.filterType}
                filterValue={filterDialog.filterValue}
                title={filterDialog.title}
                noleggi={noleggiConAllarmi}
                onRefresh={refetch}
            />
        </>
    );
}
