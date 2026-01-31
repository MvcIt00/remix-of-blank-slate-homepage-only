import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { DocumentPreviewDialog } from "@/components/pdf";
import { ContrattoPDF, DatiCliente, DatiMezzo, DatiContratto } from "./ContrattoPDF";
import { DatiAziendaOwner } from "@/components/pdf";
import { uploadContrattoPDF } from "@/utils/noleggioStorage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ContrattoPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datiOwner: DatiAziendaOwner;
  datiCliente: DatiCliente;
  datiMezzo: DatiMezzo;
  noleggioData: {
    id_mezzo: string;
    id_anagrafica: string;
    id_anagrafica_fornitore: string | null;
    sede_operativa?: string;
    data_inizio?: string;
    data_fine?: string;
    tempo_indeterminato: boolean;
    prezzo_noleggio?: number;
    prezzo_trasporto?: number;
    tipo_canone?: string;
    note?: string;
  };
  onSuccess: () => void;
  // Props opzionali per modalità "upload su Storage" (quando contratto già esiste)
  existingNoleggioId?: string;
  existingContract?: any;
}

export function ContrattoPreviewDialog({
  open,
  onOpenChange,
  datiOwner,
  datiCliente,
  datiMezzo,
  noleggioData,
  onSuccess,
  existingNoleggioId,
  existingContract,
}: ContrattoPreviewDialogProps) {
  const [saving, setSaving] = useState(false);
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);

  // Dati contratto per preview - MEMOIZZATI per evitare loop infinito in BlobProvider
  const datiContratto = useMemo<DatiContratto>(() => ({
    codice_contratto: existingContract?.codice_contratto || "ANTEPRIMA",
    data_inizio: existingContract?.data_inizio || noleggioData.data_inizio || new Date().toISOString().split("T")[0],
    data_fine: existingContract?.data_fine || (noleggioData.tempo_indeterminato ? null : (noleggioData.data_fine || null)),
    tempo_indeterminato: existingContract?.tempo_indeterminato ?? noleggioData.tempo_indeterminato,
    canone_noleggio: existingContract?.canone_noleggio ?? (noleggioData.prezzo_noleggio || null),
    tipo_canone: existingContract?.tipo_canone ?? (noleggioData.tipo_canone || null),
    costo_trasporto: existingContract?.costo_trasporto ?? (noleggioData.prezzo_trasporto || null),
    deposito_cauzionale: existingContract?.deposito_cauzionale ?? null,
    modalita_pagamento: existingContract?.modalita_pagamento ?? null,
    termini_pagamento: existingContract?.termini_pagamento ?? null,
    clausole_speciali: existingContract?.clausole_speciali ?? null,
    data_creazione: existingContract?.data_creazione || new Date().toISOString(),
    tipo_tariffa: existingContract?.tipo_tariffa || noleggioData.tipo_canone || "mensile",
    canone_mensile: existingContract?.canone_mensile || noleggioData.prezzo_noleggio || 0,
  }), [
    existingContract?.codice_contratto,
    existingContract?.data_inizio,
    existingContract?.data_fine,
    existingContract?.tempo_indeterminato,
    existingContract?.canone_noleggio,
    existingContract?.tipo_canone,
    existingContract?.costo_trasporto,
    existingContract?.deposito_cauzionale,
    existingContract?.modalita_pagamento,
    existingContract?.termini_pagamento,
    existingContract?.clausole_speciali,
    existingContract?.data_creazione,
    existingContract?.tipo_tariffa,
    existingContract?.canone_mensile,
    noleggioData.data_inizio,
    noleggioData.data_fine,
    noleggioData.tempo_indeterminato,
    noleggioData.prezzo_noleggio,
    noleggioData.tipo_canone,
    noleggioData.prezzo_trasporto,
  ]);

  const handleSave = async () => {
    if (!currentBlob) {
      toast({
        title: "Errore",
        description: "PDF non ancora generato",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // MODALITÀ 1: Contratto esistente → Upload PDF bozza in storage
      if (existingContract?.id_contratto) {
        const path = await uploadContrattoPDF(
          currentBlob,
          existingContract.id_contratto,
          datiContratto.codice_contratto
        );

        // Aggiorna record contratto con path PDF
        const { error } = await supabase
          .from("contratti_noleggio")
          .update({ pdf_bozza_path: path })
          .eq("id_contratto", existingContract.id_contratto);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "PDF contratto salvato in storage",
        });
      }
      // MODALITÀ 2: Nuovo contratto → Crea noleggio + contratto + upload PDF
      else {
        let noleggioId = existingNoleggioId;

        // 1. Crea noleggio SE NON ESISTE
        if (!noleggioId) {
          const { data: noleggio, error: noleggioError } = await supabase
            .from("Noleggi")
            .insert({
              id_mezzo: noleggioData.id_mezzo,
              id_anagrafica: noleggioData.id_anagrafica,
              sede_operativa: noleggioData.sede_operativa || null,
              data_inizio: noleggioData.data_inizio || null,
              data_fine: noleggioData.tempo_indeterminato ? null : (noleggioData.data_fine || null),
              tempo_indeterminato: noleggioData.tempo_indeterminato,
              prezzo_noleggio: noleggioData.prezzo_noleggio || null,
              prezzo_trasporto: noleggioData.prezzo_trasporto || null,
              tipo_canone: noleggioData.tipo_canone as "giornaliero" | "mensile" | undefined,
              note: noleggioData.note || null,
            })
            .select()
            .single();

          if (noleggioError) throw noleggioError;
          noleggioId = noleggio.id_noleggio;
        }

        if (!noleggioId) throw new Error("ID Noleggio mancante");

        // 2. Crea contratto
        const { data: contratto, error: contrattoError } = await supabase
          .from("contratti_noleggio")
          .insert({
            id_noleggio: noleggioId,
            id_anagrafica_cliente: noleggioData.id_anagrafica,
            id_anagrafica_fornitore: noleggioData.id_anagrafica_fornitore || "",
            dati_cliente: datiCliente as unknown as Record<string, unknown>,
            dati_fornitore: datiOwner as unknown as Record<string, unknown>,
            dati_mezzo: datiMezzo as unknown as Record<string, unknown>,
            data_inizio: noleggioData.data_inizio || new Date().toISOString().split("T")[0],
            data_fine: noleggioData.tempo_indeterminato ? null : (noleggioData.data_fine || null),
            tempo_indeterminato: noleggioData.tempo_indeterminato,
            canone_noleggio: noleggioData.prezzo_noleggio || null,
            tipo_canone: noleggioData.tipo_canone as "giornaliero" | "mensile" | undefined,
            costo_trasporto: noleggioData.prezzo_trasporto || null,
          } as any)
          .select()
          .single();

        if (contrattoError) throw contrattoError;

        // 3. Upload PDF bozza in storage
        const path = await uploadContrattoPDF(
          currentBlob,
          contratto.id_contratto,
          contratto.codice_contratto
        );

        // 4. Aggiorna contratto con path PDF
        await supabase
          .from("contratti_noleggio")
          .update({ pdf_bozza_path: path })
          .eq("id_contratto", contratto.id_contratto);

        toast({
          title: "Successo",
          description: "Contratto registrato con successo. PDF salvato in storage.",
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Errore",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // MEMOIZZA il documento PDF per evitare rigenerazioni continue
  const pdfDocument = useMemo(() => (
    <ContrattoPDF
      datiOwner={datiOwner}
      datiCliente={datiCliente}
      datiMezzo={datiMezzo}
      datiContratto={datiContratto}
    />
  ), [datiOwner, datiCliente, datiMezzo, datiContratto]);

  // Etichetta dinamica basata sulla modalità
  const saveLabel = existingContract?.id_contratto ? "Salva PDF" : "Salva e Registra";

  const saveAction = (
    <Button size="sm" onClick={handleSave} disabled={saving || !currentBlob}>
      {saving ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Save className="h-4 w-4 mr-1" />
      )}
      {saveLabel}
    </Button>
  );

  return (
    <DocumentPreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={existingContract ? "Visualizza Contratto" : "Anteprima Contratto"}
      pdfDocument={pdfDocument}
      fileName={`contratto-${datiContratto.codice_contratto.replace(/\//g, "-")}.pdf`}
      actions={saveAction}
      onBlobReady={setCurrentBlob}
    />
  );
}
