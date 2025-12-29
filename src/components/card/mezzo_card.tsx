import { useEffect, useState } from "react";
import { Truck, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { InfoModal } from "@/components/ui/responsive-modal";
import { ModMezzoForm } from "@/components/form/mod_mezzo_form";
import { cn } from "@/lib/utils";

interface MezzoCardProps {
    mezzoId: string;
    onClose: () => void;
}

interface MezzoCardData {
    // Dati Base Mezzo
    id_mezzo: string;
    marca: string | null;
    modello: string | null;
    matricola: string | null;
    id_interno: string | null;
    anno: string | null;
    ore_moto: number | null;
    categoria: string | null;
    stato_funzionamento: string | null;
    stato_funzionamento_descrizione: string | null;

    // Proprietario
    owner_ragione_sociale: string | null;

    // Sede Assegnata
    sede_assegnata_nome: string | null;
    sede_assegnata_ubicazione_completa: string | null;

    // Sede Ubicazione
    sede_ubicazione_nome: string | null;
    sede_ubicazione_completa: string | null;

    // Subnoleggio
    id_subnoleggio: string | null;
    subnoleggio_data_inizio: string | null;
    subnoleggio_data_fine: string | null;
    subnoleggio_tempo_indeterminato: boolean | null;
    costo_subnoleggio: number | null;
    subnoleggio_valore_residuo: number | null;
    fornitore_ragione_sociale: string | null;

    // Noleggio
    id_noleggio: string | null;
    noleggio_data_inizio: string | null;
    noleggio_data_fine: string | null;
    noleggio_tempo_indeterminato: boolean | null;
    prezzo_noleggio: number | null;
    tipo_canone: string | null;
    cliente_ragione_sociale: string | null;
    cliente_piva: string | null;
    noleggio_sede_nome: string | null;
    noleggio_sede_citta: string | null;

    // Margine (calcolato in DB view)
    margine_noleggio: number | null;
    margine_percentuale: number | null;
}

export function MezzoCard({ mezzoId, onClose }: MezzoCardProps) {
    const [cardData, setCardData] = useState<MezzoCardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const [datiTecniciExpanded, setDatiTecniciExpanded] = useState(false);

    useEffect(() => {
        fetchMezzoData();
    }, [mezzoId]);

    async function fetchMezzoData() {
        try {
            setLoading(true);

            const { data, error } = await (supabase
                .from("vw_card_mezzo" as any)
                .select("*")
                .eq("id_mezzo", mezzoId)
                .single() as any);

            if (error) throw error;
            setCardData(data as MezzoCardData);
        } catch (error) {
            console.error("Error fetching mezzo:", error);
        } finally {
            setLoading(false);
        }
    }

    if (showEditForm) {
        return (
            <ModMezzoForm
                mezzoId={mezzoId}
                onClose={() => setShowEditForm(false)}
                onSuccess={() => {
                    setShowEditForm(false);
                    fetchMezzoData();
                }}
            />
        );
    }

    if (loading) {
        return (
            <InfoModal
                open={true}
                onOpenChange={(v) => !v && onClose()}
                title="Caricamento..."
                width="wide"
            >
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
            </InfoModal>
        );
    }

    if (!cardData) {
        return (
            <InfoModal
                open={true}
                onOpenChange={(v) => !v && onClose()}
                title="Errore"
            >
                <p>Mezzo non trovato</p>
            </InfoModal>
        );
    }

    const getStatoBadgeVariant = (stato: string | null) => {
        if (!stato) return "secondary";
        switch (stato.toLowerCase()) {
            case "funzionante":
                return "default" as const;
            case "intervenire":
                return "secondary" as const;
            case "ritirare":
                return "destructive" as const;
            default:
                return "secondary" as const;
        }
    };

    const isUbicazioneDiversa = cardData.sede_ubicazione_nome !== cardData.sede_assegnata_nome;


    return (
        <InfoModal
            open={true}
            onOpenChange={(v) => !v && onClose()}
            title={
                <div className="flex items-center gap-3">
                    <Truck className="h-6 w-6 text-primary" />
                    <span>Dettagli Mezzo</span>
                </div>
            }
            width="wide"
        >
            <div className="space-y-8">
                {/* HERO SECTION */}
                <section className="bg-muted/30 -mx-6 -mt-6 px-8 py-6 rounded-t-lg">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 space-y-3">
                            <h1 className="text-3xl font-bold text-foreground">
                                {cardData.marca} {cardData.modello}
                            </h1>

                            <div className="flex items-center gap-4 text-base text-muted-foreground">
                                {cardData.matricola && (
                                    <span>Matricola: <span className="font-medium text-foreground">{cardData.matricola}</span></span>
                                )}
                                {cardData.id_interno && (
                                    <span>ID: <span className="font-medium text-foreground">{cardData.id_interno}</span></span>
                                )}
                            </div>

                            {cardData.stato_funzionamento && (
                                <Badge
                                    variant={getStatoBadgeVariant(cardData.stato_funzionamento)}
                                    className="text-xs"
                                >
                                    {cardData.stato_funzionamento}
                                </Badge>
                            )}
                        </div>

                        <Button
                            onClick={() => setShowEditForm(true)}
                            size="default"
                            className="gap-2 shrink-0"
                        >
                            <Edit className="h-4 w-4" />
                            Modifica
                        </Button>
                    </div>
                </section>

                {/* PROPRIETARIO + UBICAZIONE (2 colonne) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Proprietario */}
                    {cardData.owner_ragione_sociale && (
                        <div className="space-y-2">
                            <h2 className="text-base font-semibold text-muted-foreground">Proprietario</h2>
                            <p className="text-xl font-bold">{cardData.owner_ragione_sociale}</p>
                        </div>
                    )}

                    {/* Ubicazione */}
                    {cardData.sede_ubicazione_completa && (
                        <div className="space-y-2">
                            <h2 className="text-base font-semibold text-muted-foreground">Ubicazione</h2>
                            <div>
                                <p className="text-xl font-bold">{cardData.sede_ubicazione_completa}</p>
                                {isUbicazioneDiversa && cardData.sede_assegnata_ubicazione_completa && (
                                    <p className="text-xs text-destructive mt-1">
                                        Sede assegnata: {cardData.sede_assegnata_ubicazione_completa}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* DATI TECNICI (Collapsabile) */}
                {(cardData.anno || cardData.ore_moto || cardData.categoria || cardData.stato_funzionamento_descrizione) && (
                    <div className="border border-border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setDatiTecniciExpanded(!datiTecniciExpanded)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                            <span className="text-base font-medium text-muted-foreground">Dati Tecnici</span>
                            {datiTecniciExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                        </button>

                        {datiTecniciExpanded && (
                            <div className="px-4 py-4 border-t border-border space-y-4">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {cardData.anno && (
                                        <div>
                                            <span className="text-sm text-muted-foreground block mb-1">Anno</span>
                                            <p className="font-medium">{cardData.anno}</p>
                                        </div>
                                    )}
                                    {cardData.ore_moto && (
                                        <div>
                                            <span className="text-sm text-muted-foreground block mb-1">Ore Motore</span>
                                            <p className="font-medium">{cardData.ore_moto}</p>
                                        </div>
                                    )}
                                    {cardData.categoria && (
                                        <div>
                                            <span className="text-sm text-muted-foreground block mb-1">Categoria</span>
                                            <p className="font-medium capitalize">{cardData.categoria}</p>
                                        </div>
                                    )}
                                </div>

                                {cardData.stato_funzionamento_descrizione && (
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Note Stato</span>
                                        <p className="text-sm">{cardData.stato_funzionamento_descrizione}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* NOLEGGIO + SUBNOLEGGIO (Card-in-Card) */}
                {(cardData.id_noleggio || cardData.id_subnoleggio) && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* NOLEGGIO */}
                            {cardData.id_noleggio && (
                                <div className="bg-primary/10 border border-warning rounded-xl p-5 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold">Noleggio</h3>
                                        <Badge variant="default" className="text-xs">Attivo</Badge>
                                    </div>

                                    <div>
                                        <p className="text-lg font-bold">{cardData.cliente_ragione_sociale}</p>
                                        {cardData.cliente_piva && (
                                            <p className="text-xs text-muted-foreground mt-1">P.IVA: {cardData.cliente_piva}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                        {cardData.noleggio_data_inizio && (
                                            <div>
                                                <span className="text-xs text-muted-foreground block mb-1">Data Inizio</span>
                                                <p className="text-sm font-medium">{new Date(cardData.noleggio_data_inizio).toLocaleDateString('it-IT')}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">
                                                {cardData.noleggio_tempo_indeterminato ? "Durata" : "Data Fine"}
                                            </span>
                                            <p className="text-sm font-medium">
                                                {cardData.noleggio_tempo_indeterminato
                                                    ? "Tempo Indeterminato"
                                                    : cardData.noleggio_data_fine
                                                        ? new Date(cardData.noleggio_data_fine).toLocaleDateString('it-IT')
                                                        : "-"
                                                }
                                            </p>
                                        </div>
                                        {cardData.prezzo_noleggio && (
                                            <div>
                                                <span className="text-xs text-muted-foreground block mb-1">Prezzo</span>
                                                <p className="text-sm font-medium">
                                                    € {cardData.prezzo_noleggio.toFixed(2)} / {cardData.tipo_canone || "mensile"}
                                                </p>
                                            </div>
                                        )}
                                        {cardData.noleggio_sede_nome && (
                                            <div>
                                                <span className="text-xs text-muted-foreground block mb-1">Sede Operativa</span>
                                                <p className="text-sm font-medium">{cardData.noleggio_sede_nome}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* SUBNOLEGGIO */}
                            {cardData.id_subnoleggio && (
                                <div className="bg-muted/30 border border-primary rounded-xl p-5 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold">Subnoleggio</h3>
                                        <Badge variant="secondary" className="text-xs">Attivo</Badge>
                                    </div>

                                    <div>
                                        <p className="text-lg font-bold">{cardData.fornitore_ragione_sociale}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                        {cardData.subnoleggio_data_inizio && (
                                            <div>
                                                <span className="text-xs text-muted-foreground block mb-1">Data Inizio</span>
                                                <p className="text-sm font-medium">{new Date(cardData.subnoleggio_data_inizio).toLocaleDateString('it-IT')}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">
                                                {cardData.subnoleggio_tempo_indeterminato ? "Durata" : "Data Fine"}
                                            </span>
                                            <p className="text-sm font-medium">
                                                {cardData.subnoleggio_tempo_indeterminato
                                                    ? "Tempo Indeterminato"
                                                    : cardData.subnoleggio_data_fine
                                                        ? new Date(cardData.subnoleggio_data_fine).toLocaleDateString('it-IT')
                                                        : "-"
                                                }
                                            </p>
                                        </div>
                                        {cardData.costo_subnoleggio && (
                                            <div>
                                                <span className="text-xs text-muted-foreground block mb-1">Costo</span>
                                                <p className="text-sm font-medium">
                                                    € {cardData.costo_subnoleggio.toFixed(2)} / mensile
                                                </p>
                                            </div>
                                        )}
                                        {cardData.subnoleggio_valore_residuo && (
                                            <div>
                                                <span className="text-xs text-muted-foreground block mb-1">Valore Residuo</span>
                                                <p className="text-sm font-medium">€ {cardData.subnoleggio_valore_residuo.toFixed(2)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MARGINE */}
                        {cardData.margine_noleggio !== null && (
                            <div className="bg-success/10 border border-success rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-semibold">Margine</span>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-success">
                                            € {cardData.margine_noleggio.toFixed(2)}
                                        </p>
                                        {cardData.margine_percentuale !== null && (
                                            <p className="text-sm text-muted-foreground">
                                                {cardData.margine_percentuale.toFixed(1)}%
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </InfoModal>
    );
}
