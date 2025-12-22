import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Popover as DatePopover,
  PopoverContent as DatePopoverContent,
  PopoverTrigger as DatePopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Lavorazione {
  id_lavorazione: string;
  nome_lavorazione: string | null;
  durata_prevista: string | null;
  n_tecnici_previsti: number | null;
  data_da_prevista: string | null;
  data_a_prevista: string | null;
  data_effettiva: string | null;
}

interface Tecnico {
  id_tecnico: string;
  nome: string | null;
  cognome: string | null;
}

interface AssegnaTecniciPopoverProps {
  interventoId: string;
  lavorazioni?: Lavorazione[]; // Made optional since we'll fetch real data
  totaleTecniciPrevisti?: number;
  totaleTecniciAssegnati?: number;
  onUpdate?: () => void;
}

export function AssegnaTecniciPopover({
  interventoId,
  totaleTecniciPrevisti = 0,
  totaleTecniciAssegnati = 0,
  onUpdate,
}: AssegnaTecniciPopoverProps) {
  const [open, setOpen] = useState(false);
  const [tecnici, setTecnici] = useState<Tecnico[]>([]);
  const [lavorazioni, setLavorazioni] = useState<Lavorazione[]>([]);
  const [assegnazioni, setAssegnazioni] = useState<
    Record<string, { tecnici: string[]; dataEffettiva: Date | undefined; tecniciNames: string[] }>
  >({});

  // Calculate totals from fetched lavorazioni (when popover is open)
  const totaleTecniciPrevistiInterno = lavorazioni.reduce(
    (sum, lav) => sum + (lav.n_tecnici_previsti || 0),
    0
  );

  const totaleTecniciAssegnatiInterno = lavorazioni.reduce((sum, lav) => {
    return sum + (assegnazioni[lav.id_lavorazione]?.tecnici?.length || 0);
  }, 0);

  // Use props data initially, then switch to internal data when popover is open
  const displayTecniciPrevisti = open ? totaleTecniciPrevistiInterno : totaleTecniciPrevisti;
  const displayTecniciAssegnati = open ? totaleTecniciAssegnatiInterno : totaleTecniciAssegnati;

  // Check if all expected technicians are assigned
  const isFullyAssigned = displayTecniciAssegnati >= displayTecniciPrevisti && displayTecniciPrevisti > 0;

  useEffect(() => {
    if (open) {
      fetchLavorazioni();
      fetchTecnici();
    }
  }, [open, interventoId]);

  const fetchLavorazioni = async () => {
    try {
      const { data, error } = await supabase
        .from("vw_int_lavorazioni_dettaglio")
        .select("*")
        .eq("id_intervento", interventoId);

      if (error) throw error;
      
      const lavorazioniData: Lavorazione[] = (data || []).map(row => ({
        id_lavorazione: row.id_lavorazione!,
        nome_lavorazione: row.nome_lavorazione,
        durata_prevista: row.durata_prevista,
        n_tecnici_previsti: row.n_tecnici_previsti ? Number(row.n_tecnici_previsti) : null,
        data_da_prevista: row.data_da_prevista,
        data_a_prevista: row.data_a_prevista,
        data_effettiva: row.data_effettiva,
      }));
      
      setLavorazioni(lavorazioniData);
      
      // After fetching lavorazioni, fetch assegnazioni
      if (lavorazioniData.length > 0) {
        fetchAssegnazioni(lavorazioniData);
      }
    } catch (error) {
      console.error("Errore nel caricamento delle lavorazioni:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le lavorazioni",
        variant: "destructive",
      });
    }
  };

  const fetchTecnici = async () => {
    try {
      const { data, error } = await supabase
        .from("tecnici")
        .select("id_tecnico, nome, cognome")
        .order("nome");

      if (error) throw error;
      setTecnici(data || []);
    } catch (error) {
      console.error("Errore nel caricamento dei tecnici:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i tecnici",
        variant: "destructive",
      });
    }
  };

  const fetchAssegnazioni = async (lavorazioniData: Lavorazione[]) => {
    try {
      const lavIds = lavorazioniData.map((l) => l.id_lavorazione);
      
      if (lavIds.length === 0) return;
      
      const { data, error } = await supabase
        .from("lav_tecnici")
        .select(`
          id_lavorazione, 
          id_tecnico,
          tecnici (
            nome,
            cognome
          )
        `)
        .in("id_lavorazione", lavIds);

      if (error) throw error;

      const assegnazioniMap: Record<
        string,
        { tecnici: string[]; dataEffettiva: Date | undefined; tecniciNames: string[] }
      > = {};

      lavorazioniData.forEach((lav) => {
        const tecniciAssegnati =
          data?.filter((a) => a.id_lavorazione === lav.id_lavorazione) || [];
        
        const tecniciIds = tecniciAssegnati.map((a) => a.id_tecnico);
        const tecniciNames = tecniciAssegnati.map((a) => {
          const tecnico = a.tecnici as any;
          return tecnico ? `${tecnico.nome || ''} ${tecnico.cognome || ''}`.trim() : '';
        }).filter(Boolean);

        assegnazioniMap[lav.id_lavorazione] = {
          tecnici: tecniciIds,
          tecniciNames: tecniciNames,
          dataEffettiva: lav.data_effettiva
            ? new Date(lav.data_effettiva)
            : undefined,
        };
      });

      setAssegnazioni(assegnazioniMap);
    } catch (error) {
      console.error("Errore nel caricamento delle assegnazioni:", error);
    }
  };

  const handleTecnicoToggle = async (
    lavorazioneId: string,
    tecnicoId: string
  ) => {
    const current = assegnazioni[lavorazioneId]?.tecnici || [];
    const isAssigned = current.includes(tecnicoId);

    try {
      if (isAssigned) {
        const { error } = await supabase
          .from("lav_tecnici")
          .delete()
          .eq("id_lavorazione", lavorazioneId)
          .eq("id_tecnico", tecnicoId);

        if (error) throw error;

        const updatedTecnici = current.filter((id) => id !== tecnicoId);
        const updatedNames = assegnazioni[lavorazioneId]?.tecniciNames?.filter((_, idx) => 
          current[idx] !== tecnicoId
        ) || [];
        
        setAssegnazioni({
          ...assegnazioni,
          [lavorazioneId]: {
            ...assegnazioni[lavorazioneId],
            tecnici: updatedTecnici,
            tecniciNames: updatedNames,
          },
        });
      } else {
        const { error } = await supabase.from("lav_tecnici").insert({
          id_lavorazione: lavorazioneId,
          id_tecnico: tecnicoId,
        });

        if (error) throw error;

        const tecnico = tecnici.find(t => t.id_tecnico === tecnicoId);
        const tecnicoName = tecnico ? `${tecnico.nome || ''} ${tecnico.cognome || ''}`.trim() : '';
        
        setAssegnazioni({
          ...assegnazioni,
          [lavorazioneId]: {
            ...assegnazioni[lavorazioneId],
            tecnici: [...current, tecnicoId],
            tecniciNames: [...(assegnazioni[lavorazioneId]?.tecniciNames || []), tecnicoName],
          },
        });
      }

      toast({
        title: "Successo",
        description: isAssigned
          ? "Tecnico rimosso dalla lavorazione"
          : "Tecnico assegnato alla lavorazione",
      });

      onUpdate?.();
    } catch (error) {
      console.error("Errore nell'assegnazione:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'assegnazione",
        variant: "destructive",
      });
    }
  };

  const handleDataEffettivaChange = async (
    lavorazioneId: string,
    date: Date | undefined
  ) => {
    try {
      // Format date to local YYYY-MM-DD to avoid timezone issues
      const formattedDate = date ? 
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` 
        : null;

      const { error } = await supabase
        .from("int_lavorazioni")
        .update({ data_effettiva: formattedDate })
        .eq("id_lavorazione", lavorazioneId);

      if (error) throw error;

      setAssegnazioni({
        ...assegnazioni,
        [lavorazioneId]: {
          ...assegnazioni[lavorazioneId],
          dataEffettiva: date,
        },
      });

      toast({
        title: "Successo",
        description: "Data effettiva aggiornata",
      });

      onUpdate?.();
    } catch (error) {
      console.error("Errore nell'aggiornamento della data:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la data effettiva",
        variant: "destructive",
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          {isFullyAssigned && open ? (
            <span className="text-xs truncate max-w-[200px]">
              {lavorazioni
                .flatMap((lav) => assegnazioni[lav.id_lavorazione]?.tecniciNames || [])
                .join(", ")}
            </span>
          ) : (
            <>
              <span>{displayTecniciAssegnati}/{displayTecniciPrevisti}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {lavorazioni.map((lavorazione) => (
              <div
                key={lavorazione.id_lavorazione}
                className="border rounded-lg p-3 space-y-3"
              >
                <div>
                  <div className="font-medium">
                    {lavorazione.nome_lavorazione || "Lavorazione senza nome"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ore previste: {lavorazione.durata_prevista || "N/A"} • Tecnici:{" "}
                    {lavorazione.n_tecnici_previsti || 0}
                  </div>
                  {lavorazione.data_da_prevista && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Date previste: {new Date(lavorazione.data_da_prevista).toLocaleDateString("it-IT")}
                      {lavorazione.data_a_prevista && ` - ${new Date(lavorazione.data_a_prevista).toLocaleDateString("it-IT")}`}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tecnici</label>
                    <div className="space-y-1">
                      {tecnici.map((tecnico) => {
                        const isAssigned =
                          assegnazioni[lavorazione.id_lavorazione]?.tecnici?.includes(
                            tecnico.id_tecnico
                          ) || false;

                        return (
                          <label
                            key={tecnico.id_tecnico}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() =>
                                handleTecnicoToggle(
                                  lavorazione.id_lavorazione,
                                  tecnico.id_tecnico
                                )
                              }
                              className="rounded"
                            />
                            <span className="text-sm">
                              {tecnico.nome} {tecnico.cognome}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Effettiva</label>
                    <DatePopover>
                      <DatePopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !assegnazioni[lavorazione.id_lavorazione]
                              ?.dataEffettiva && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {assegnazioni[lavorazione.id_lavorazione]
                            ?.dataEffettiva ? (
                            format(
                              assegnazioni[lavorazione.id_lavorazione]
                                .dataEffettiva,
                              "PPP",
                              { locale: it }
                            )
                          ) : (
                            <span>Seleziona data</span>
                          )}
                        </Button>
                      </DatePopoverTrigger>
                      <DatePopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            assegnazioni[lavorazione.id_lavorazione]
                              ?.dataEffettiva
                          }
                          onSelect={(date) =>
                            handleDataEffettivaChange(
                              lavorazione.id_lavorazione,
                              date
                            )
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </DatePopoverContent>
                    </DatePopover>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
