import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, ArrowLeft, FileText, Plus } from "lucide-react";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { TableActions } from "@/components/ui/table-actions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NuovoNoleggioForm } from "@/components/form/nuovo_noleggio_form";
import { useNavigate } from "react-router-dom";
import { MezzoClickable } from "@/components/mezzo-clickable";
import { calcolaStatoNoleggio, isMezzoDisponibilePerNoleggio } from "@/utils/noleggioStatus";


interface MezzoDisponibile {
  id_mezzo: string;
  marca: string | null;
  modello: string | null;
  matricola: string | null;
  id_interno: string | null;
  categoria: string | null;
  anno: string | null;
  id_anagrafica: string | null;
  owner_ragione_sociale: string | null;
  owner_partita_iva: string | null;

  // Sede Ubicazione
  sede_ubicazione_nome: string | null;
  sede_ubicazione_completa: string | null;

  // Noleggio attivo (se presente)
  id_noleggio: string | null;
  noleggio_data_inizio: string | null;
  noleggio_data_fine: string | null;
  noleggio_tempo_indeterminato: boolean | null;
  noleggio_is_terminato: boolean | null;
  stato_noleggio: "futuro" | "attivo" | "scaduto" | "archiviato" | "terminato" | null;

  // Cliente noleggio
  cliente_ragione_sociale: string | null;
  cliente_piva: string | null;
}
export default function Noleggi() {
  const navigate = useNavigate();
  const [mezziDisponibili, setMezziDisponibili] = useState<MezzoDisponibile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoleggioForm, setShowNoleggioForm] = useState(false);
  const [formMode, setFormMode] = useState<"noleggio" | "preventivo">("noleggio");
  const [mezzoSelezionato, setMezzoSelezionato] = useState<MezzoDisponibile | null>(null);

  useEffect(() => {
    loadMezziDisponibili();
  }, []);

  async function loadMezziDisponibili() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vw_mezzi_disponibili_noleggio" as any)
        .select("*");

      if (error) throw error;

      // Ordina: prima mezzi disponibili (senza noleggio), poi con noleggio
      const sorted = (data || []).sort((a: any, b: any) => {
        const aHasNoleggio = a.stato_noleggio ? 1 : 0;
        const bHasNoleggio = b.stato_noleggio ? 1 : 0;

        // Prima mezzi senza noleggio (0), poi con noleggio (1)
        if (aHasNoleggio !== bHasNoleggio) {
          return aHasNoleggio - bHasNoleggio;
        }

        // All'interno dello stesso gruppo, ordina per marca
        const marcaA = (a.marca || "").toLowerCase();
        const marcaB = (b.marca || "").toLowerCase();
        return marcaA.localeCompare(marcaB);
      });

      setMezziDisponibili((sorted as unknown as MezzoDisponibile[]) || []);

    } catch (error) {
      console.error("Error loading mezzi disponibili:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i mezzi disponibili a noleggio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleNoleggiaMezzo(mezzo: MezzoDisponibile) {
    setMezzoSelezionato(mezzo);
    setFormMode("noleggio");
    setShowNoleggioForm(true);
  }

  function handlePreventivoMezzo(mezzo: MezzoDisponibile) {
    setMezzoSelezionato(mezzo);
    setFormMode("preventivo");
    setShowNoleggioForm(true);
  }

  function handleCloseForm() {
    setShowNoleggioForm(false);
    setMezzoSelezionato(null);
  }

  function handleSuccess() {
    handleCloseForm();
    if (formMode === "preventivo") {
      navigate("/noleggi/preventivi");
    } else {
      navigate("/noleggi/attivi");
    }
  }
  const columns: DataTableColumn<MezzoDisponibile>[] = [
    {
      key: "displayName",
      label: "Mezzo",
      render: (_, mezzo) => (
        <MezzoClickable mezzoId={mezzo.id_mezzo} className="font-medium">
          {mezzo.marca} {mezzo.modello}
        </MezzoClickable>
      ),
    },
    {
      key: "matricola",
      label: "Identificazione",
      render: (_, mezzo) => (
        <div className="text-sm">
          <div className="font-medium">{mezzo.matricola || "-"}</div>
          <div className="text-xs text-muted-foreground">{mezzo.id_interno || "-"}</div>
        </div>
      ),
    },
    {
      key: "ubicazione",
      label: "Ubicazione",
      render: (_, mezzo) => {
        if (!mezzo.sede_ubicazione_nome && !mezzo.sede_ubicazione_completa) return "-";
        return (
          <div className="text-sm max-w-[250px]">
            <div className="font-medium truncate">{mezzo.sede_ubicazione_nome || "-"}</div>
            <div className="text-xs text-muted-foreground truncate">{mezzo.sede_ubicazione_completa || "-"}</div>
          </div>
        );
      },
    },
    {
      key: "stato_noleggio",
      label: "Stato",
      render: (_, mezzo) => {
        if (!mezzo.stato_noleggio) return <Badge variant="outline">Disponibile</Badge>;
        const { label, variant, className } = calcolaStatoNoleggio({
          stato_noleggio: mezzo.stato_noleggio,
          is_terminato: mezzo.noleggio_is_terminato || false
        });
        return <Badge variant={variant} className={className}>{label}</Badge>;
      },
    },
    {
      key: "proprietario",
      label: "Proprietario",
      render: (_, mezzo) => (
        <div className="text-sm">
          <div className="font-medium">{mezzo.owner_ragione_sociale || "-"}</div>
          <div className="text-muted-foreground">P.IVA: {mezzo.owner_partita_iva || "-"}</div>
        </div>
      ),
    },
  ];

  const renderActions = (mezzo: MezzoDisponibile) => {
    const isDisponibile = isMezzoDisponibilePerNoleggio({
      stato_noleggio: mezzo.stato_noleggio,
      is_terminato: mezzo.noleggio_is_terminato || false
    });

    const actions = [
      {
        label: "Preventivo",
        icon: <FileText className="h-4 w-4" />,
        onClick: () => handlePreventivoMezzo(mezzo),
      },
    ];

    // Aggiungi bottone Noleggia solo se mezzo disponibile
    if (isDisponibile) {
      actions.push({
        label: "Noleggia",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => handleNoleggiaMezzo(mezzo),
      });
    }

    return <TableActions customActions={actions} />;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gestione Noleggi</h1>
              <p className="text-muted-foreground">
                Mezzi disponibili per il noleggio
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Mezzi Disponibili a Noleggio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : mezziDisponibili.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nessun mezzo disponibile a noleggio</p>
              </div>
            ) : (
              <DataTable
                data={mezziDisponibili}
                columns={columns}
                actions={renderActions}
                searchPlaceholder="Cerca mezzo, matricola o categoria..."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showNoleggioForm} onOpenChange={setShowNoleggioForm}>
        <DialogContent className="max-w-4xl">
          {mezzoSelezionato && (
            <NuovoNoleggioForm
              mezzo={{
                ...mezzoSelezionato,
                Anagrafiche: {
                  ragione_sociale: mezzoSelezionato.owner_ragione_sociale,
                  partita_iva: mezzoSelezionato.owner_partita_iva,
                },
              }}
              mode={formMode}
              onClose={handleCloseForm}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
}
