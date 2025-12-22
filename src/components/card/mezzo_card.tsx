import { useEffect, useState } from "react";
import { Truck, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { InfoModal } from "@/components/ui/responsive-modal";
import { ModMezzoForm } from "@/components/form/mod_mezzo_form";

interface MezzoCardProps {
    mezzoId: string;
    onClose: () => void;
}

interface MezzoData {
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
    is_disponibile_noleggio: boolean | null;
    id_anagrafica: string | null;
    id_sede_assegnata: string | null;
    id_sede_ubicazione: string | null;
}

interface AnagraficaData {
    ragione_sociale: string;
}

interface SedeData {
    nome_sede: string | null;
    ubicazione_completa: string | null;
}

interface SubnoleggioData {
    id_subnoleggio: string;
    id_anagrafica: string | null;
    data_inizio: string | null;
    data_fine: string | null;
    tempo_indeterminato: boolean | null;
    costo_subnoleggio: number | null;
    valore_residuo: number | null;
    contratto: string | null;
    fornitore_ragione_sociale: string | null;
}

export function MezzoCard({ mezzoId, onClose }: MezzoCardProps) {
    const [mezzo, setMezzo] = useState<MezzoData | null>(null);
    const [anagrafica, setAnagrafica] = useState<AnagraficaData | null>(null);
    const [sedeAssegnata, setSedeAssegnata] = useState<SedeData | null>(null);
    const [sedeUbicazione, setSedeUbicazione] = useState<SedeData | null>(null);
    const [subnoleggio, setSubnoleggio] = useState<SubnoleggioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);

    useEffect(() => {
        fetchMezzoData();
    }, [mezzoId]);

    async function fetchMezzoData() {
        try {
            setLoading(true);

            // Fetch mezzo base
            const { data: mezzoData, error: mezzoError } = await supabase
                .from("Mezzi")
                .select("*")
                .eq("id_mezzo", mezzoId)
                .single();

            if (mezzoError) throw mezzoError;
            setMezzo(mezzoData);

            // Fetch anagrafica
            if (mezzoData.id_anagrafica) {
                const { data: anagraficaData } = await supabase
                    .from("Anagrafiche")
                    .select("ragione_sociale")
                    .eq("id_anagrafica", mezzoData.id_anagrafica)
                    .single();
                setAnagrafica(anagraficaData);
            }

            // Fetch sede assegnata
            if (mezzoData.id_sede_assegnata) {
                const { data: sedeData } = await supabase
                    .from("vw_sedi_tutte")
                    .select("nome_sede, ubicazione_completa")
                    .eq("id_sede", mezzoData.id_sede_assegnata)
                    .single();
                setSedeAssegnata(sedeData);
            }

            // Fetch sede ubicazione
            if (mezzoData.id_sede_ubicazione) {
                const { data: sedeData } = await supabase
                    .from("vw_sedi_tutte")
                    .select("nome_sede, ubicazione_completa")
                    .eq("id_sede", mezzoData.id_sede_ubicazione)
                    .single();
                setSedeUbicazione(sedeData);
            }

            // Fetch subnoleggio
            const { data: subnoleggioData } = await (supabase
                .from("vw_subnoleggi_completo" as any)
                .select("*")
                .eq("id_mezzo", mezzoId)
                .eq("is_cancellato", false)
                .maybeSingle() as any);

            setSubnoleggio(subnoleggioData as SubnoleggioData | null);
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

    if (!mezzo) {
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

    return (
        <InfoModal
            open={true}
            onOpenChange={(v) => !v && onClose()}
            title={
                <div className="flex items-center justify-between w-full pr-8">
                    <div className="flex items-center gap-3">
                        <Truck className="h-6 w-6 text-primary" />
                        <span>
                            {mezzo.marca} {mezzo.modello}
                        </span>
                    </div>
                    <Button onClick={() => setShowEditForm(true)} size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Modifica
                    </Button>
                </div>
            }
            width="wide"
        >
            <div className="space-y-6">
                {/* Dati Base Mezzo */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Truck className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Dati Base Mezzo</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {mezzo.matricola && (
                            <div>
                                <span className="text-muted-foreground">Matricola:</span>
                                <p className="font-medium">{mezzo.matricola}</p>
                            </div>
                        )}
                        {mezzo.id_interno && (
                            <div>
                                <span className="text-muted-foreground">ID Interno:</span>
                                <p className="font-medium">{mezzo.id_interno}</p>
                            </div>
                        )}
                        {mezzo.anno && (
                            <div>
                                <span className="text-muted-foreground">Anno:</span>
                                <p className="font-medium">{mezzo.anno}</p>
                            </div>
                        )}
                        {mezzo.ore_moto && (
                            <div>
                                <span className="text-muted-foreground">Ore Motore:</span>
                                <p className="font-medium">{mezzo.ore_moto}</p>
                            </div>
                        )}
                        {mezzo.categoria && (
                            <div>
                                <span className="text-muted-foreground">Categoria:</span>
                                <p className="font-medium">{mezzo.categoria}</p>
                            </div>
                        )}
                        {mezzo.stato_funzionamento && (
                            <div>
                                <span className="text-muted-foreground">Stato:</span>
                                <p className="font-medium">{mezzo.stato_funzionamento}</p>
                            </div>
                        )}
                    </div>
                    {mezzo.stato_funzionamento_descrizione && (
                        <div className="mt-4">
                            <span className="text-muted-foreground text-sm">Descrizione stato:</span>
                            <p className="text-sm mt-1">{mezzo.stato_funzionamento_descrizione}</p>
                        </div>
                    )}
                    <div className="mt-4">
                        {mezzo.is_disponibile_noleggio && (
                            <Badge variant="secondary">Disponibile a Noleggio</Badge>
                        )}
                    </div>
                </section>

                <Separator />

                {/* Proprietà */}
                {anagrafica && (
                    <>
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-lg font-semibold">Proprietà</h3>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Anagrafica:</span>
                                <p className="font-medium">{anagrafica.ragione_sociale}</p>
                            </div>
                        </section>
                        <Separator />
                    </>
                )}

                {/* Ubicazione */}
                {(mezzo.id_sede_assegnata || sedeAssegnata) && (
                    <>
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-lg font-semibold">Sede Assegnata</h3>
                            </div>
                            {sedeAssegnata && (
                                <div className="text-sm">
                                    <p className="font-medium">{sedeAssegnata.ubicazione_completa}</p>
                                </div>
                            )}
                        </section>
                        <Separator />
                    </>
                )}

                {/* Ubicazione Attuale */}
                {sedeUbicazione && (
                    <>
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-lg font-semibold">Ubicazione Attuale</h3>
                            </div>
                            <div className="text-sm">
                                <p className="font-medium">{sedeUbicazione.ubicazione_completa}</p>
                                {sedeUbicazione.nome_sede !== sedeAssegnata?.nome_sede && (
                                    <Badge variant="outline" className="mt-2">Ubicazione diversa dalla sede assegnata</Badge>
                                )}
                            </div>
                        </section>
                        <Separator />
                    </>
                )}

                {/* Subnoleggio */}
                {subnoleggio && (
                    <>
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-lg font-semibold">Subnoleggio</h3>
                            </div>
                            <div className="space-y-3">
                                {subnoleggio.fornitore_ragione_sociale && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Fornitore:</span>
                                        <p className="font-medium">{subnoleggio.fornitore_ragione_sociale}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {subnoleggio.data_inizio && (
                                        <div>
                                            <span className="text-muted-foreground">Data Inizio:</span>
                                            <p className="font-medium">{new Date(subnoleggio.data_inizio).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {subnoleggio.data_fine && (
                                        <div>
                                            <span className="text-muted-foreground">Data Fine:</span>
                                            <p className="font-medium">{new Date(subnoleggio.data_fine).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {subnoleggio.costo_subnoleggio && (
                                        <div>
                                            <span className="text-muted-foreground">Costo:</span>
                                            <p className="font-medium">€ {subnoleggio.costo_subnoleggio}</p>
                                        </div>
                                    )}
                                    {subnoleggio.valore_residuo && (
                                        <div>
                                            <span className="text-muted-foreground">Valore Residuo:</span>
                                            <p className="font-medium">€ {subnoleggio.valore_residuo}</p>
                                        </div>
                                    )}
                                </div>
                                {subnoleggio.contratto && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Contratto:</span>
                                        <p className="font-medium">{subnoleggio.contratto}</p>
                                    </div>
                                )}
                                {subnoleggio.tempo_indeterminato && (
                                    <Badge variant="secondary">Tempo Indeterminato</Badge>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </InfoModal>
    );
}
