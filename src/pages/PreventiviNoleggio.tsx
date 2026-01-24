import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { ModificaPreventivoDialog, PreventivoStatusButton, ConfermaPreventivoDialog, PreventivoPreviewDialog } from "@/components/preventivi-noleggio";
import { usePreventiviNoleggio } from "@/hooks/usePreventiviNoleggio";
import { PreventivoNoleggio, PreventivoNoleggioInput, StatoPreventivo } from "@/types/preventiviNoleggio";
import { toast } from "@/hooks/use-toast";
import { TableActions } from "@/components/ui/table-actions";
import { FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statoBadgeVariant: Record<StatoPreventivo, "secondary" | "default" | "destructive" | "outline"> = {
  bozza: "secondary",
  inviato: "secondary",
  scaduto: "destructive", // Evidenzia preventivi scaduti
  in_revisione: "outline",
  approvato: "default",
  rifiutato: "destructive",
  concluso: "outline",
  archiviato: "secondary",
};

export default function PreventiviNoleggio() {
  const {
    preventivi,
    loading,
    creaPreventivo,
    aggiornaPreventivo,
    aggiornaStato,
    eliminaPreventivo,
    archiviaPreventivo,
    convertiInNoleggio,
  } = usePreventiviNoleggio();
  const [statoFiltro, setStatoFiltro] = useState<StatoPreventivo | "">("");
  const [preventivoSelezionato, setPreventivoSelezionato] = useState<PreventivoNoleggio | null>(null);
  const [preventivoDaModificare, setPreventivoDaModificare] = useState<PreventivoNoleggio | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [preventivoPerPDF, setPreventivoPerPDF] = useState<PreventivoNoleggio | null>(null);

  const filteredData = useMemo(() => {
    return statoFiltro ? preventivi.filter((p) => p.stato === statoFiltro) : preventivi;
  }, [preventivi, statoFiltro]);

  const columns: DataTableColumn<PreventivoNoleggio>[] = [
    {
      key: "codice",
      label: "Codice",
      render: (v) => <span className="font-mono text-xs font-bold">{v || "-"}</span>,
    },
    {
      key: "cliente",
      label: "Cliente",
      render: (_value, row) => row.Anagrafiche?.ragione_sociale ?? row.id_anagrafica,
    },
    {
      key: "sede_operativa",
      label: "Sede Operativa",
      render: (_value, row) => (
        <div className="flex flex-col text-sm max-w-[200px]">
          <span className="font-medium truncate" title={row.Sedi?.indirizzo || "-"}>
            {row.Sedi?.indirizzo || "-"}
          </span>
          <span className="text-xs text-muted-foreground truncate" title={`${row.Sedi?.citta || ""} ${row.Sedi?.cap || ""}`}>
            {row.Sedi?.citta || row.sede_operativa || "-"} {row.Sedi?.cap || ""}
          </span>
        </div>
      ),
    },
    {
      key: "mezzo",
      label: "Mezzo",
      render: (_value, row) =>
        row.Mezzi?.matricola
          ? `${row.Mezzi.marca ?? ""} ${row.Mezzi.modello ?? ""} (${row.Mezzi.matricola})`
          : row.id_mezzo,
    },
    {
      key: "periodo",
      label: "Periodo",
      render: (_value, row) =>
        row.tempo_indeterminato ? "Tempo indeterminato" : `${row.data_inizio ?? "-"} → ${row.data_fine ?? "-"}`,
    },
    {
      key: "canone",
      label: "Canone",
      render: (_value, row) => `${row.prezzo_noleggio ?? "-"} ${row.tipo_canone ?? ""}`,
    },
    {
      key: "id_preventivo",
      label: "Stato",
      render: (_value, row) => (
        <PreventivoStatusButton
          preventivo={row}
          onStatusChange={async (next) => {
            await aggiornaStato(row.id_preventivo, next);
            toast({ title: "Stato aggiornato", description: `Il preventivo è ora ${next}` });
          }}
          onGeneratePDF={() => {
            setPreventivoPerPDF(row);
            setPreviewOpen(true);
          }}
          onViewPDF={() => {
            setPreventivoPerPDF(row);
            setPreviewOpen(true);
          }}
          onConvert={() => {
            setPreventivoSelezionato(row);
            setConfirmOpen(true);
          }}
          onArchive={async () => {
            await archiviaPreventivo(row.id_preventivo);
            toast({ title: "Preventivo archiviato" });
          }}
          onUpdateSuccess={() => {
            // L'invalidazione viene già gestita dal hook useMutation 
            // ma forziamo un refresh per sicurezza se necessario
          }}
        />
      ),
    },
  ];

  const renderActions = (row: PreventivoNoleggio) => (
    <TableActions
      onEdit={() => setPreventivoDaModificare(row)}
      editDisabled={row.stato !== StatoPreventivo.BOZZA && row.stato !== StatoPreventivo.IN_REVISIONE}
      onDelete={
        !row.convertito_in_noleggio_id
          ? async () => {
            await eliminaPreventivo(row.id_preventivo);
            toast({ title: "Preventivo eliminato" });
          }
          : undefined
      }
    />
  );


  const handleConvert = async (preventivo: PreventivoNoleggio) => {
    await convertiInNoleggio(preventivo);
    toast({ title: "Preventivo convertito", description: "Noleggio attivo creato" });
  };

  const getPreviewData = () => {
    if (!preventivoPerPDF) return null;

    return {
      datiOwner: preventivoPerPDF.dati_azienda || {
        ragione_sociale: "Mvc Toscana Carrelli",
        indirizzo: "Viale magri 115",
        citta: "Livorno",
        cap: null,
        provincia: null,
        partita_iva: "000000001",
        email: "info@toscanacarrelli.it",
        telefono: "0586.000000",
        pec: null,
        codice_univoco: null,
        iban: null
      },
      datiCliente: {
        ragione_sociale: preventivoPerPDF.Anagrafiche?.ragione_sociale ?? "",
        partita_iva: preventivoPerPDF.Anagrafiche?.partita_iva ?? null,
        indirizzo: preventivoPerPDF.Sedi?.indirizzo ?? null,
        citta: preventivoPerPDF.Sedi?.citta ?? null,
        cap: preventivoPerPDF.Sedi?.cap ?? null,
        provincia: preventivoPerPDF.Sedi?.provincia ?? null,
        telefono: preventivoPerPDF.Anagrafiche?.telefono ?? null,
        email: preventivoPerPDF.Anagrafiche?.email ?? null,
        pec: preventivoPerPDF.Anagrafiche?.pec ?? null,
        codice_univoco: preventivoPerPDF.Anagrafiche?.codice_univoco ?? null
      },
      datiMezzo: {
        marca: preventivoPerPDF.Mezzi?.marca ?? null,
        modello: preventivoPerPDF.Mezzi?.modello ?? null,
        matricola: preventivoPerPDF.Mezzi?.matricola ?? null,
        id_interno: null, // Added
        anno: preventivoPerPDF.Mezzi?.anno ? String(preventivoPerPDF.Mezzi.anno) : null,
        categoria: null, // Added
        ore_moto: preventivoPerPDF.Mezzi?.ore ?? null, // Fixed property name
      },
      datiPreventivo: {
        codice_preventivo: preventivoPerPDF.codice ?? "BOZZA",
        data_creazione: preventivoPerPDF.created_at ?? new Date().toISOString(),
        data_inizio: preventivoPerPDF.data_inizio ?? null,
        data_fine: preventivoPerPDF.data_fine ?? null,
        tempo_indeterminato: preventivoPerPDF.tempo_indeterminato ?? false,
        canone_noleggio: preventivoPerPDF.prezzo_noleggio ?? null, // Fixed property name
        tipo_canone: preventivoPerPDF.tipo_canone ?? "giornaliero",
        costo_trasporto: null, // Added
        note: preventivoPerPDF.note ?? null,
        validita_giorni: 30
      }
    };
  };

  const previewData = getPreviewData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Preventivi Noleggio</h1>
          <p className="text-muted-foreground">Crea, invia e converti i preventivi in noleggi attivi.</p>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-muted-foreground">Filtro stato</p>
            <Select value={statoFiltro || "tutti"} onValueChange={(v) => setStatoFiltro(v === "tutti" ? "" : (v as StatoPreventivo))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tutti gli stati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti</SelectItem>
                <SelectItem value="bozza">Bozza</SelectItem>
                <SelectItem value="inviato">Inviato</SelectItem>
                <SelectItem value="scaduto">Scaduto</SelectItem>
                <SelectItem value="approvato">Approvato</SelectItem>
                <SelectItem value="rifiutato">Rifiutato</SelectItem>
                <SelectItem value="concluso">Concluso</SelectItem>
                <SelectItem value="archiviato">Archiviato</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>

        <DataTable
          data={filteredData}
          columns={columns}
          actions={renderActions}
          loading={loading}
          searchPlaceholder="Cerca per cliente, mezzo o note"
          emptyMessage="Nessun preventivo registrato"
        />
      </Card>

      <ConfermaPreventivoDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        preventivo={preventivoSelezionato}
        onConfirm={handleConvert}
      />

      <ModificaPreventivoDialog
        open={!!preventivoDaModificare}
        onOpenChange={(open) => !open && setPreventivoDaModificare(null)}
        preventivo={preventivoDaModificare}
        onSave={async (values) => {
          if (!preventivoDaModificare) return;
          await aggiornaPreventivo(preventivoDaModificare.id_preventivo, values);
          toast({ title: "Preventivo aggiornato" });
          setPreventivoDaModificare(null);
        }}
      />

      {previewData && (
        <PreventivoPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          datiOwner={previewData.datiOwner}
          datiCliente={previewData.datiCliente}
          datiMezzo={previewData.datiMezzo}
          datiPreventivo={previewData.datiPreventivo}
          onSave={async () => {
            setPreviewOpen(false);
          }}
        />
      )}
    </div>
  );
}
