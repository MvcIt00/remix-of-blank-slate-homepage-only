import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { PreventivoStatusButton } from "./PreventivoStatusButton";
import { PreventivoNoleggio, StatoPreventivo } from "@/types/preventiviNoleggio";
import { TableActions } from "@/components/ui/table-actions";

export const statoBadgeVariant: Record<StatoPreventivo, "secondary" | "default" | "destructive" | "outline"> = {
  bozza: "secondary",
  inviato: "secondary",
  scaduto: "destructive",
  in_revisione: "outline",
  approvato: "default",
  rifiutato: "destructive",
  concluso: "outline",
  archiviato: "secondary",
};

interface PreventiviDataTableProps {
  data: PreventivoNoleggio[];
  loading?: boolean;
  onStatusChange: (id: string, stato: StatoPreventivo) => Promise<void>;
  onEdit: (preventivo: PreventivoNoleggio) => void;
  onDelete: (preventivo: PreventivoNoleggio) => Promise<void>;
  onGeneratePDF: (preventivo: PreventivoNoleggio) => void;
  onConvert: (preventivo: PreventivoNoleggio) => void;
  onArchive: (preventivo: PreventivoNoleggio) => Promise<void>;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function PreventiviDataTable({
  data,
  loading = false,
  onStatusChange,
  onEdit,
  onDelete,
  onGeneratePDF,
  onConvert,
  onArchive,
  searchPlaceholder = "Cerca per cliente, mezzo o note",
  emptyMessage = "Nessun preventivo registrato",
}: PreventiviDataTableProps) {
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
          onStatusChange={(next) => onStatusChange(row.id_preventivo, next)}
          onGeneratePDF={() => onGeneratePDF(row)}
          onViewPDF={() => onGeneratePDF(row)}
          onConvert={() => onConvert(row)}
          onArchive={() => onArchive(row)}
          onUpdateSuccess={() => {}}
        />
      ),
    },
  ];

  const renderActions = (row: PreventivoNoleggio) => (
    <TableActions
      onEdit={() => onEdit(row)}
      editDisabled={row.stato !== StatoPreventivo.BOZZA && row.stato !== StatoPreventivo.IN_REVISIONE}
      onDelete={
        !row.convertito_in_noleggio_id
          ? () => onDelete(row)
          : undefined
      }
    />
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      actions={renderActions}
      loading={loading}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
    />
  );
}
