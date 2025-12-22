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


interface MezzoDisponibile {
  id_mezzo: string;
  marca: string | null;
  modello: string | null;
  matricola: string | null;
  id_interno: string | null;
  categoria: string | null;
  anno: string | null;
  id_anagrafica: string | null;
  Anagrafiche: {
    ragione_sociale: string | null;
    partita_iva: string | null;
  } | null;
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
        .from("Mezzi")
        .select(`
          *,
          Anagrafiche (
            ragione_sociale,
            partita_iva
          )
        `)
        .eq("is_disponibile_noleggio", true)
        .eq("is_cancellato", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMezziDisponibili(data || []);
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
    { key: "matricola", label: "Matricola" },
    { key: "id_interno", label: "ID Interno" },
    {
      key: "categoria",
      label: "Categoria",
      render: (value) => value && <Badge variant="secondary">{value}</Badge>,
    },
    { key: "anno", label: "Anno" },
    {
      key: "proprietario",
      label: "Proprietario",
      render: (_, mezzo) => (
        <div className="text-sm">
          <div className="font-medium">{mezzo.Anagrafiche?.ragione_sociale || "-"}</div>
          <div className="text-muted-foreground">P.IVA: {mezzo.Anagrafiche?.partita_iva || "-"}</div>
        </div>
      ),
    },
  ];

  const renderActions = (mezzo: MezzoDisponibile) => (
    <TableActions
      customActions={[
        {
          label: "Preventivo",
          icon: <FileText className="h-4 w-4" />,
          onClick: () => handlePreventivoMezzo(mezzo),
        },
        {
          label: "Noleggia",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => handleNoleggiaMezzo(mezzo),
          variant: "default",
        },
      ]}
    />
  );

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
              mezzo={mezzoSelezionato}
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
