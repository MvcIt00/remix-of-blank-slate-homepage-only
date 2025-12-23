import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { ModificaPreventivoDialog, StatoPreventivoNoleggioPopover, ConfermaPreventivoDialog } from "@/components/preventivi-noleggio";
import { usePreventiviNoleggio } from "@/hooks/usePreventiviNoleggio";
import { PreventivoNoleggio, PreventivoNoleggioInput, StatoPreventivo } from "@/types/preventiviNoleggio";
import { toast } from "@/hooks/use-toast";
import { TableActions } from "@/components/ui/table-actions";
import { PreventivoPreviewDialog } from "@/components/preventivi/PreventivoPreviewDialog";
import { FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statoBadgeVariant: Record<StatoPreventivo, "secondary" | "default" | "destructive" | "outline"> = {
  bozza: "secondary",
  inviato: "secondary",
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
      key: "stato",
      label: "Stato",
      render: (_value, row) => (
        <StatoPreventivoNoleggioPopover
          stato={row.stato}
          onChange={async (next) => {
            await aggiornaStato(row.id_preventivo, next);
            toast({
              title: "Stato aggiornato",
              description: `Il preventivo è ora ${next}`,
            });
          }}
          disabled={row.stato === StatoPreventivo.CONCLUSO || row.stato === StatoPreventivo.ARCHIVIATO}
        />
      ),
    },
  ];

  const renderActions = (row: PreventivoNoleggio) => (
    <TableActions
      onEdit={() => setPreventivoDaModificare(row)}
      editDisabled={row.stato === StatoPreventivo.CONCLUSO || row.stato === StatoPreventivo.ARCHIVIATO || !!row.convertito_in_noleggio_id}
      onComplete={
        row.stato === StatoPreventivo.APPROVATO && !row.convertito_in_noleggio_id
          ? () => {
            setPreventivoSelezionato(row);
            setConfirmOpen(true);
          }
          : undefined
      }
      completeDisabled={!!row.convertito_in_noleggio_id}
      onArchive={
        row.stato !== StatoPreventivo.ARCHIVIATO
          ? async () => {
            await archiviaPreventivo(row.id_preventivo);
            toast({ title: "Preventivo archiviato" });
          }
          : undefined
      }
      onDelete={
        !row.convertito_in_noleggio_id
          ? async () => {
            await eliminaPreventivo(row.id_preventivo);
            toast({ title: "Preventivo eliminato" });
          }
          : undefined
      }
      customActions={[
        {
          label: row.pdf_bozza_path ? "Visualizza PDF" : "Genera PDF",
          icon: row.pdf_bozza_path ? <Eye className="h-4 w-4" /> : <FileText className="h-4 w-4" />,
          onClick: () => {
            setPreventivoPerPDF(row);
            setPreviewOpen(true);
          },
          className: row.pdf_bozza_path ? "text-primary" : "text-muted-foreground",
        }
      ]}
    />
  );


  const handleConvert = async (preventivo: PreventivoNoleggio) => {
    await convertiInNoleggio(preventivo);
    toast({ title: "Preventivo convertito", description: "Noleggio attivo creato" });
  };

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
                <SelectItem value="approvato">Approvato</SelectItem>
                <SelectItem value="rifiutato">Rifiutato</SelectItem>
                <SelectItem value="concluso">Concluso</SelectItem>
                <SelectItem value="archiviato">Archiviato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 items-center">
            {([StatoPreventivo.BOZZA, StatoPreventivo.INVIATO, StatoPreventivo.APPROVATO, StatoPreventivo.RIFIUTATO, StatoPreventivo.CONCLUSO, StatoPreventivo.ARCHIVIATO]).map((stato) => (
              <Badge key={stato} variant={statoBadgeVariant[stato]}>
                {stato}
              </Badge>
            ))}
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

      <PreventivoPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        preventivo={preventivoPerPDF as any}
        onSuccess={() => {
          // hook invalida già la query
        }}
      />
    </div>
  );
}
