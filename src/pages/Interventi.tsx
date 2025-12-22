import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Building2 } from "lucide-react";
import { CreaInterventoDialog } from "@/components/interventi/crea_intervento_dialog";
import { StatoFunzionamentoPopover } from "@/components/interventi/stato_funzionamento_popover";
import { MezzoClickable } from "@/components/mezzo-clickable";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { TableActions } from "@/components/ui/table-actions";
import { PlusCircle } from "lucide-react";

interface MezzoIntervento {
  id_mezzo: string;
  marca: string | null;
  modello: string | null;
  matricola: string | null;
  id_interno: string | null;
  stato_funzionamento: "funzionante" | "intervenire" | "ritirare" | null;
  stato_funzionamento_descrizione: string | null;
  ubicazione: string | null;
  id_sede_ubicazione: string | null;
  id_anagrafica: string | null;
}

const Interventi = () => {
  const [mezzi, setMezzi] = useState<MezzoIntervento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStato, setFiltroStato] = useState<string>("all");

  const fetchMezzi = async () => {
    setLoading(true);

    // 1) Mezzi che hanno già un intervento creato
    const { data: interventiData } = await supabase.from("Interventi").select("id_mezzo").eq("is_cancellato", false);

    const mezziConIntervento = interventiData?.map((i) => i.id_mezzo) || [];

    // 2) Mezzi da gestire, escludendo quelli con intervento
    let query = supabase
      .from("Mezzi")
      .select(
        "id_mezzo, marca, modello, matricola, id_interno, stato_funzionamento, stato_funzionamento_descrizione, ubicazione, id_sede_ubicazione, id_anagrafica",
      )
      .eq("is_cancellato", false)
      .in("stato_funzionamento", ["intervenire", "ritirare"]);

    if (mezziConIntervento.length > 0) {
      // NOT IN (list) — per UUID è più robusto quotare
      const list = `(${mezziConIntervento.map((id) => `"${id}"`).join(",")})`;
      query = query.not("id_mezzo", "in", list);
    }

    if (filtroStato !== "all") {
      query = query.eq("stato_funzionamento", filtroStato as any);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Errore nel caricamento mezzi:", error);
    } else {
      setMezzi(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMezzi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroStato]);

  const columns: DataTableColumn<MezzoIntervento>[] = [
    {
      key: "mezzo",
      label: "Mezzo",
      render: (_, mezzo) => {
        const displayName =
          mezzo.marca && mezzo.modello
            ? `${mezzo.marca} ${mezzo.modello}`
            : mezzo.marca || mezzo.modello || "-";
        return (
          <MezzoClickable mezzoId={mezzo.id_mezzo}>
            <span className="underline-offset-4 hover:underline cursor-pointer font-medium">
              {displayName}
            </span>
          </MezzoClickable>
        );
      },
    },
    { key: "matricola", label: "Matricola" },
    { key: "id_interno", label: "ID Interno" },
    { key: "ubicazione", label: "Ubicazione", className: "max-w-xs truncate" },
    {
      key: "stato",
      label: "Stato",
      render: (_, mezzo) => (
        <StatoFunzionamentoPopover mezzo={mezzo} onUpdate={fetchMezzi} />
      ),
    },
  ];

  const renderInterventoAction = (mezzo: MezzoIntervento) => (
    <div className="flex justify-end items-center gap-2">
      <CreaInterventoDialog mezzo={mezzo} onSuccess={fetchMezzi} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Wrench className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mezzi Guasti</h1>
                <p className="text-sm text-muted-foreground">Mezzi che richiedono intervento</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              <Building2 className="h-4 w-4 mr-2" />
              Torna alla Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Mezzi da{" "}
              {filtroStato === "intervenire" ? "Intervenire" : filtroStato === "ritirare" ? "Ritirare" : "Gestire"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtra per stato:</span>
              <Select value={filtroStato} onValueChange={setFiltroStato}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="intervenire">Intervenire</SelectItem>
                  <SelectItem value="ritirare">Ritirare</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Caricamento...</div>
          ) : mezzi.length > 0 ? (
            <DataTable
              data={mezzi}
              columns={columns}
              actions={renderInterventoAction}
              searchPlaceholder="Cerca mezzo, matricola o ubicazione..."
            />
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filtroStato === "all"
                  ? "Nessun mezzo guasto al momento"
                  : `Nessun mezzo guasto nello stato "${filtroStato}"`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Interventi;
