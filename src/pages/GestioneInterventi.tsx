import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { StatoInterventoPopover } from "@/components/interventi/stato_intervento_popover";
import { AssegnaTecniciPopover } from "@/components/interventi/assegna_tecnici_popover";

interface Lavorazione {
  id_lavorazione: string;
  nome_lavorazione: string | null;
  durata_prevista: string | null;
  data_da_prevista: string | null;
  data_a_prevista: string | null;
  data_effettiva: string | null;
  n_tecnici_previsti: number | null;
}

interface InterventoAperto {
  id_intervento: string;
  codice_intervento: string | null;
  descrizione_intervento: string | null;
  created_at: string;
  stato_intervento: "aperto" | "in lavorazione" | "chiuso" | "preventivazione" | null;
  stato_preventivo: "non preventivato" | "bozza" | "inviato" | "approvato" | "rifiutato" | null;
  Mezzi: {
    id_mezzo: string;
    marca: string | null;
    modello: string | null;
    matricola: string | null;
    id_interno: string | null;
    ubicazione: string | null;
  } | null;
  Anagrafiche: {
    ragione_sociale: string;
  } | null;
  int_lavorazioni: Lavorazione[];
  // Additional fields from vw_gestione_interventi
  n_lavorazioni?: number;
  totale_tecnici_previsti?: number;
  totale_tecnici_assegnati?: number;
  nomi_tecnici_aggregati?: string | null;
}

export default function GestioneInterventi() {
  const navigate = useNavigate();
  const [interventi, setInterventi] = useState<InterventoAperto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterventi = async () => {
    try {
      const { data, error } = await supabase
        .from("vw_gestione_interventi")
        .select("*")
        .in("stato_intervento", ["aperto", "in lavorazione", "chiuso"])
        .order("prima_data_prevista", { ascending: true, nullsFirst: false });

      if (error) throw error;
      
      // Transform view data to match component interface
      const transformedData = (data || []).map(row => ({
        id_intervento: row.id_intervento,
        codice_intervento: row.codice_intervento,
        descrizione_intervento: row.descrizione_intervento,
        created_at: row.created_at,
        stato_intervento: row.stato_intervento,
        stato_preventivo: row.stato_preventivo,
        Mezzi: {
          id_mezzo: row.id_mezzo,
          marca: row.marca,
          modello: row.modello,
          matricola: row.matricola,
          id_interno: row.id_interno,
          ubicazione: row.ubicazione,
        },
        Anagrafiche: {
          ragione_sociale: row.ragione_sociale,
        },
        int_lavorazioni: [{
          id_lavorazione: row.id_intervento, // placeholder
          nome_lavorazione: null,
          durata_prevista: null,
          data_da_prevista: row.prima_data_prevista,
          data_a_prevista: row.ultima_data_prevista,
          data_effettiva: null,
          n_tecnici_previsti: row.totale_tecnici_previsti,
        }],
        // Additional fields from view
        n_lavorazioni: row.n_lavorazioni,
        totale_tecnici_previsti: row.totale_tecnici_previsti,
        totale_tecnici_assegnati: row.totale_tecnici_assegnati,
        nomi_tecnici_aggregati: row.nomi_tecnici_aggregati,
      }));
      
      setInterventi(transformedData as any);
    } catch (error) {
      console.error("Errore nel caricamento degli interventi:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli interventi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventi();
  }, []);

  const handleEliminaIntervento = async (idIntervento: string) => {
    try {
      const { error } = await supabase
        .from("Interventi")
        .update({ is_cancellato: true })
        .eq("id_intervento", idIntervento);

      if (error) throw error;

      toast({
        title: "Intervento eliminato",
        description: "L'intervento è stato eliminato con successo",
      });

      fetchInterventi();
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'intervento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Gestione Interventi</h1>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codice</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Mezzo</TableHead>
              <TableHead>Matricola</TableHead>
              <TableHead>Ubicazione</TableHead>
              <TableHead>N° Lavorazioni</TableHead>
              <TableHead>Date Previste</TableHead>
              <TableHead>Stato Intervento</TableHead>
              <TableHead>Tecnici</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Caricamento...
                </TableCell>
              </TableRow>
            ) : interventi.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Nessun intervento aperto trovato
                </TableCell>
              </TableRow>
            ) : (
              interventi.map((intervento) => {
                const primaLavorazione = intervento.int_lavorazioni?.[0];
                const numeroLavorazioni = intervento.n_lavorazioni || intervento.int_lavorazioni?.length || 0;
                const datePreviste = primaLavorazione?.data_da_prevista && primaLavorazione?.data_a_prevista
                  ? `${new Date(primaLavorazione.data_da_prevista).toLocaleDateString("it-IT")} - ${new Date(primaLavorazione.data_a_prevista).toLocaleDateString("it-IT")}`
                  : primaLavorazione?.data_da_prevista
                  ? new Date(primaLavorazione.data_da_prevista).toLocaleDateString("it-IT")
                  : "-";

                return (
                  <TableRow key={intervento.id_intervento}>
                    <TableCell className="font-medium">
                      {intervento.codice_intervento || "N/A"}
                    </TableCell>
                    <TableCell>
                      {intervento.Anagrafiche?.ragione_sociale || "N/A"}
                    </TableCell>
                    <TableCell>
                      {intervento.Mezzi ? (
                        `${intervento.Mezzi.marca || ""} ${intervento.Mezzi.modello || ""}`.trim() || "N/A"
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {intervento.Mezzi?.matricola || "N/A"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {intervento.Mezzi?.ubicazione || "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      {numeroLavorazioni}
                    </TableCell>
                    <TableCell>
                      {datePreviste}
                    </TableCell>
                    <TableCell>
                      <StatoInterventoPopover
                        statoCorrente={intervento.stato_intervento}
                        interventoId={intervento.id_intervento}
                        onStatoChange={fetchInterventi}
                      />
                    </TableCell>
                    <TableCell>
                      <AssegnaTecniciPopover
                        interventoId={intervento.id_intervento}
                        totaleTecniciPrevisti={intervento.totale_tecnici_previsti || 0}
                        totaleTecniciAssegnati={intervento.totale_tecnici_assegnati || 0}
                        onUpdate={fetchInterventi}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/interventi/${intervento.id_intervento}/modifica`)
                          }
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Modifica
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sei sicuro di voler eliminare questo intervento? Questa azione non
                                può essere annullata.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleEliminaIntervento(intervento.id_intervento)}
                              >
                                Elimina
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
