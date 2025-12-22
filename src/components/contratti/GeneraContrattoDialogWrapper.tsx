import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContrattoPreviewDialog } from "./ContrattoPreviewDialog";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GeneraContrattoDialogWrapperProps {
    noleggioId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function GeneraContrattoDialogWrapper({
    noleggioId,
    open,
    onOpenChange,
    onSuccess,
}: GeneraContrattoDialogWrapperProps) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (open && noleggioId) {
            fetchData();
        }
    }, [open, noleggioId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Noleggio + Mezzo + Cliente
            const { data: noleggio, error: noleggioError } = await supabase
                .from("Noleggi")
                .select(`
          *,
          Mezzi (*),
          Anagrafiche (*)
        `)
                .eq("id_noleggio", noleggioId)
                .single();

            if (noleggioError) throw noleggioError;

            // 1. Fetch Existing contract first to get more info
            const { data: existingContract } = await supabase
                .from("contratti_noleggio")
                .select("*")
                .eq("id_noleggio", noleggioId)
                .maybeSingle();

            // 2. Fetch Owner completo (con fallback multipli)
            let owner: any = null;

            // Strategia A: Se abbiamo già un contratto, usiamo quell'ID fornitore
            if (existingContract?.id_anagrafica_fornitore) {
                const { data } = await supabase
                    .from("vw_anagrafiche_complete")
                    .select("*")
                    .eq("id_anagrafica", existingContract.id_anagrafica_fornitore)
                    .maybeSingle();
                owner = data;
            }

            // Strategia B: Cerchiamo l'owner marcato (is_owner = true)
            if (!owner) {
                // 1. Fetch Owner Data (Using dedicated view)
                const { data: fetchedOwner, error: ownerError } = await (supabase
                    .from("vw_owner_info" as any)
                    .select("*")
                    .limit(1)
                    .maybeSingle() as any);

                if (ownerError) {
                    console.error("Errore fetch owner:", ownerError);
                    toast({
                        title: "Errore",
                        description: "Impossibile recuperare i dati del fornitore.",
                        variant: "destructive",
                    });
                }
                owner = fetchedOwner;
            }

            // 2. Fetch Client Data (Using aggregated view)
            const { data: cliente, error: clienteError } = await (supabase
                .from("vw_anagrafiche_complete" as any)
                .select("*")
                .eq("id_anagrafica", noleggio.id_anagrafica)
                .maybeSingle() as any);

            if (clienteError) {
                console.error("Errore fetch cliente:", clienteError);
            }

            // Prepara i dati per il PDF
            const formattedData = {
                existingContract: existingContract,
                datiOwner: owner || {
                    ragione_sociale: "Azienda Owner",
                    sede_legale_indirizzo: "",
                    sede_legale_citta: "",
                    sede_legale_cap: "",
                    sede_legale_provincia: "",
                    partita_iva: "",
                },
                datiCliente: {
                    ragione_sociale: noleggio.Anagrafiche.ragione_sociale,
                    p_iva: noleggio.Anagrafiche.partita_iva || "",
                    indirizzo: cliente?.sede_legale?.indirizzo || "",
                    citta: cliente?.sede_legale?.citta || "",
                    cap: (cliente?.sede_legale?.cap || "").toString(),
                    provincia: cliente?.sede_legale?.provincia || "",
                    telefono: cliente?.contatti?.[0]?.telefono || "",
                    email: cliente?.contatti?.[0]?.email || "",
                    pec: cliente?.pec || "",
                    codice_univoco: cliente?.codice_univoco || "",
                },
                datiMezzo: {
                    marca: noleggio.Mezzi.marca,
                    modello: noleggio.Mezzi.modello,
                    matricola: noleggio.Mezzi.matricola,
                    targa: "", // TODO: Add targa if exists
                    telaio: "",
                    anno: noleggio.Mezzi.anno,
                    ore_moto: noleggio.Mezzi.ore_moto,
                },
                noleggioData: {
                    id_mezzo: noleggio.id_mezzo,
                    id_anagrafica: noleggio.id_anagrafica,
                    id_anagrafica_fornitore: (owner as any)?.id_anagrafica || null,
                    sede_operativa: noleggio.sede_operativa,
                    data_inizio: noleggio.data_inizio,
                    data_fine: noleggio.data_fine,
                    tempo_indeterminato: noleggio.tempo_indeterminato,
                    prezzo_noleggio: noleggio.prezzo_noleggio,
                    prezzo_trasporto: noleggio.prezzo_trasporto,
                    tipo_canone: noleggio.tipo_canone,
                    note: noleggio.note,
                },
            };

            setData(formattedData);
        } catch (error) {
            console.error("Error fetching data for contract:", error);
            toast({
                title: "Errore",
                description: "Impossibile recuperare i dati per il contratto",
                variant: "destructive",
            });
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2" />
                    <p className="text-sm text-muted-foreground">Caricamento dati contratto...</p>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <ContrattoPreviewDialog
            open={open}
            onOpenChange={onOpenChange}
            datiOwner={data.datiOwner}
            datiCliente={data.datiCliente}
            datiMezzo={data.datiMezzo}
            noleggioData={data.noleggioData}
            onSuccess={onSuccess}
            existingNoleggioId={noleggioId}
            existingContract={data.existingContract}
        />
    );
}
