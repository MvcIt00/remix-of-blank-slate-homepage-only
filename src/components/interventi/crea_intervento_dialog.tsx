import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ProdottoSelettore from "@/components/selettori/prodotto_selettore";

interface Mezzo {
  id_mezzo: string;
  marca: string | null;
  modello: string | null;
  matricola: string | null;
  id_interno: string | null;
  ubicazione: string | null;
  id_anagrafica: string | null;
  stato_funzionamento_descrizione: string | null;
}

interface CreaInterventoDialogProps {
  mezzo: Mezzo;
  onSuccess?: () => void;
}

export const CreaInterventoDialog = ({ mezzo, onSuccess }: CreaInterventoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Campi intervento
  const [descrizioneIntervento, setDescrizioneIntervento] = useState("");
  
  // Campi lavorazione
  const [nomeLavorazione, setNomeLavorazione] = useState("");
  const [descrizioneLavorazione, setDescrizioneLavorazione] = useState("");
  const [dataDa, setDataDa] = useState<Date>();
  const [dataA, setDataA] = useState<Date>();
  const [durataOre, setDurataOre] = useState("");
  const [numTecnici, setNumTecnici] = useState("");
  const [prodottiLavorazione, setProdottiLavorazione] = useState<Array<{
    id_prodotto: string;
    codice: string | null;
    nome: string | null;
    marca: string | null;
    modello: string | null;
    costo_prodotto: number | null;
    prezzo_prodotto: number | null;
    quantita: number;
    costo_lavorazione: number;
    prezzo_lavorazione: number;
  }>>([]);

  const handleCreaIntervento = async (tipo: 'intervento' | 'preventivo') => {
    // Validazione
    if (!nomeLavorazione.trim()) {
      toast({
        title: "Errore",
        description: "Il nome della lavorazione è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Crea l'intervento con logica separata per stato_intervento e stato_preventivo
      const descrizioneCompleta = mezzo.stato_funzionamento_descrizione
        ? `${descrizioneIntervento ? descrizioneIntervento + "\n" : ""}Stato funzionamento: ${mezzo.stato_funzionamento_descrizione}`
        : descrizioneIntervento || null;

      const { data: interventoData, error: interventoError } = await supabase
        .from("Interventi")
        .insert({
          id_mezzo: mezzo.id_mezzo,
          id_anagrafica: mezzo.id_anagrafica,
          descrizione_intervento: descrizioneCompleta,
          // Se tipo='intervento', imposta stato_intervento='aperto' e stato_preventivo='non preventivato'
          // Se tipo='preventivo', imposta stato_intervento='preventivazione' e stato_preventivo='bozza'
          stato_intervento: tipo === 'intervento' ? 'aperto' : 'preventivazione',
          stato_preventivo: tipo === 'intervento' ? 'non preventivato' : 'bozza'
        })
        .select()
        .single();

      if (interventoError) throw interventoError;

      // 2. Crea la prima lavorazione
      const { data: lavorazioneData, error: lavorazioneError } = await supabase
        .from("int_lavorazioni")
        .insert({
          id_intervento: interventoData.id_intervento,
          nome_lavorazione: nomeLavorazione,
          descrizione_lavorazione: descrizioneLavorazione || null,
          data_da_prevista: dataDa ? format(dataDa, "yyyy-MM-dd") : null,
          data_a_prevista: dataA ? format(dataA, "yyyy-MM-dd") : null,
          durata_prevista: durataOre || null,
          n_tecnici_previsti: numTecnici ? parseFloat(numTecnici) : null,
        })
        .select()
        .single();

      if (lavorazioneError) throw lavorazioneError;

      // 3. Inserisci i prodotti della lavorazione
      if (prodottiLavorazione.length > 0) {
        const prodottiToInsert = prodottiLavorazione.map(p => ({
          id_lavorazione: lavorazioneData.id_lavorazione,
          id_prodotto: p.id_prodotto,
          n_prodotto_uscita_prevista: p.quantita,
          costo_prodotto_lavorazione: p.costo_lavorazione,
          prezzo_prodotto_lavorazione: p.prezzo_lavorazione,
        }));

        const { error: prodottiError } = await supabase
          .from("int_lav_prod")
          .insert(prodottiToInsert);

        if (prodottiError) throw prodottiError;
      }

      const messaggioStato = tipo === 'intervento' 
        ? 'come intervento aperto (non preventivato)' 
        : 'in preventivazione con bozza';
      toast({
        title: "Intervento creato",
        description: `Intervento ${interventoData.codice_intervento} creato ${messaggioStato}`,
      });

      // Reset form
      setDescrizioneIntervento("");
      setNomeLavorazione("");
      setDescrizioneLavorazione("");
      setDataDa(undefined);
      setDataA(undefined);
      setDurataOre("");
      setNumTecnici("");
      setProdottiLavorazione([]);
      
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Errore nella creazione intervento:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare l'intervento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Crea Intervento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Intervento</DialogTitle>
          <DialogDescription>
            Mezzo: {mezzo.marca} {mezzo.modello} - {mezzo.matricola}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Descrizione Intervento (opzionale)</Label>
            <Textarea
              value={descrizioneIntervento}
              onChange={(e) => setDescrizioneIntervento(e.target.value)}
              placeholder="Descrizione generale dell'intervento..."
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Prima Lavorazione</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Lavorazione *</Label>
                <Input
                  value={nomeLavorazione}
                  onChange={(e) => setNomeLavorazione(e.target.value)}
                  placeholder="Es: Riparazione motore"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Descrizione Lavorazione</Label>
                <Textarea
                  value={descrizioneLavorazione}
                  onChange={(e) => setDescrizioneLavorazione(e.target.value)}
                  placeholder="Dettagli della lavorazione..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Inizio Prevista</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataDa && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataDa ? format(dataDa, "dd/MM/yyyy") : "Seleziona data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataDa}
                        onSelect={setDataDa}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Data Fine Prevista</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataA && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataA ? format(dataA, "dd/MM/yyyy") : "Seleziona data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataA}
                        onSelect={setDataA}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Durata (ore)</Label>
                  <Input
                    type="text"
                    value={durataOre}
                    onChange={(e) => setDurataOre(e.target.value)}
                    placeholder="Es: 8 ore"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Numero Tecnici</Label>
                  <Input
                    type="number"
                    value={numTecnici}
                    onChange={(e) => setNumTecnici(e.target.value)}
                    placeholder="Es: 2"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Prodotti/Ricambi</Label>
                  <ProdottoSelettore
                    onSelect={(prodotto) => {
                      const nuovoProdotto = {
                        id_prodotto: prodotto.id_prodotto,
                        codice: prodotto.codice,
                        nome: prodotto.nome,
                        marca: prodotto.marca,
                        modello: prodotto.modello,
                        costo_prodotto: prodotto.costo_prodotto,
                        prezzo_prodotto: prodotto.prezzo_prodotto,
                        quantita: 1,
                        costo_lavorazione: prodotto.costo_prodotto || 0,
                        prezzo_lavorazione: prodotto.prezzo_prodotto || 0,
                      };
                      setProdottiLavorazione([...prodottiLavorazione, nuovoProdotto]);
                    }}
                  />
                </div>

                {prodottiLavorazione.length > 0 && (
                  <div className="space-y-2 border rounded-lg p-3">
                    {prodottiLavorazione.map((prodotto, index) => (
                      <div key={index} className="border rounded p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{prodotto.nome || "N/D"}</p>
                            <p className="text-xs text-muted-foreground">
                              {prodotto.codice} - {prodotto.marca} {prodotto.modello}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setProdottiLavorazione(prodottiLavorazione.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Quantità</Label>
                            <Input
                              type="number"
                              min="1"
                              value={prodotto.quantita}
                              onChange={(e) => {
                                const newProdotti = [...prodottiLavorazione];
                                newProdotti[index].quantita = parseFloat(e.target.value) || 1;
                                setProdottiLavorazione(newProdotti);
                              }}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Costo €</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={prodotto.costo_lavorazione}
                              onChange={(e) => {
                                const newProdotti = [...prodottiLavorazione];
                                newProdotti[index].costo_lavorazione = parseFloat(e.target.value) || 0;
                                setProdottiLavorazione(newProdotti);
                              }}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Prezzo €</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={prodotto.prezzo_lavorazione}
                              onChange={(e) => {
                                const newProdotti = [...prodottiLavorazione];
                                newProdotti[index].prezzo_lavorazione = parseFloat(e.target.value) || 0;
                                setProdottiLavorazione(newProdotti);
                              }}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Annulla
            </Button>
            <Button 
              onClick={() => handleCreaIntervento('intervento')} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? "Creazione..." : "Crea Intervento"}
            </Button>
            <Button 
              onClick={() => handleCreaIntervento('preventivo')} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Creazione..." : "Crea Preventivo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
