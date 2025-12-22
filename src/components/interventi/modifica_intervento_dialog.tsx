import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit, Plus, Trash2 } from "lucide-react";
import ProdottoSelettore from "@/components/selettori/prodotto_selettore";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface Prodotto {
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
  id_lav_prod?: string;
}

interface Lavorazione {
  id_lavorazione: string;
  nome_lavorazione: string | null;
  descrizione_lavorazione: string | null;
  data_da_prevista: string | null;
  data_a_prevista: string | null;
  durata_prevista: string | null;
  n_tecnici_previsti: number | null;
  prodotti?: Prodotto[];
}

interface ModificaInterventoDialogProps {
  interventoId: string;
  onSuccess?: () => void;
}

export const ModificaInterventoDialog = ({ interventoId, onSuccess }: ModificaInterventoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [descrizioneIntervento, setDescrizioneIntervento] = useState("");
  const [lavorazioni, setLavorazioni] = useState<Lavorazione[]>([]);
  
  // Nuova lavorazione
  const [showNuovaLavorazione, setShowNuovaLavorazione] = useState(false);
  const [nomeLavorazione, setNomeLavorazione] = useState("");
  const [descrizioneLavorazione, setDescrizioneLavorazione] = useState("");
  const [dataDa, setDataDa] = useState<Date>();
  const [dataA, setDataA] = useState<Date>();
  const [durataOre, setDurataOre] = useState("");
  const [numTecnici, setNumTecnici] = useState("");
  
  // Gestione prodotti lavorazione in modifica
  const [lavorazioneInModifica, setLavorazioneInModifica] = useState<string | null>(null);
  const [prodottiLavorazioneCorrente, setProdottiLavorazioneCorrente] = useState<Prodotto[]>([]);

  useEffect(() => {
    if (open) {
      loadIntervento();
    }
  }, [open, interventoId]);

  const loadIntervento = async () => {
    setLoading(true);

    // Carica dati intervento
    const { data: interventoData, error: interventoError } = await supabase
      .from("Interventi")
      .select("descrizione_intervento")
      .eq("id_intervento", interventoId)
      .single();

    if (interventoError) {
      console.error("Errore caricamento intervento:", interventoError);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'intervento",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setDescrizioneIntervento(interventoData.descrizione_intervento || "");

    // Carica lavorazioni
    const { data: lavorazioniData, error: lavorazioniError } = await supabase
      .from("int_lavorazioni")
      .select("*")
      .eq("id_intervento", interventoId)
      .eq("is_cancellato", false)
      .order("created_at", { ascending: true });

    if (lavorazioniError) {
      console.error("Errore caricamento lavorazioni:", lavorazioniError);
      setLoading(false);
      return;
    }

    // Carica i prodotti per ogni lavorazione
    const lavorazioniConProdotti = await Promise.all(
      (lavorazioniData || []).map(async (lav) => {
        const { data: prodottiData } = await supabase
          .from("int_lav_prod")
          .select(`
            id_lav_prod,
            n_prodotto_uscita_prevista,
            costo_prodotto_lavorazione,
            prezzo_prodotto_lavorazione,
            Prodotti (
              id_prodotto,
              codice,
              nome,
              marca,
              modello,
              costo_prodotto,
              prezzo_prodotto
            )
          `)
          .eq("id_lavorazione", lav.id_lavorazione);

        const prodotti = (prodottiData || []).map((p: any) => ({
          id_prodotto: p.Prodotti.id_prodotto,
          codice: p.Prodotti.codice,
          nome: p.Prodotti.nome,
          marca: p.Prodotti.marca,
          modello: p.Prodotti.modello,
          costo_prodotto: p.Prodotti.costo_prodotto,
          prezzo_prodotto: p.Prodotti.prezzo_prodotto,
          quantita: p.n_prodotto_uscita_prevista || 0,
          costo_lavorazione: p.costo_prodotto_lavorazione || 0,
          prezzo_lavorazione: p.prezzo_prodotto_lavorazione || 0,
          id_lav_prod: p.id_lav_prod,
        }));

        return { ...lav, prodotti };
      })
    );

    setLavorazioni(lavorazioniConProdotti);
    setLoading(false);
  };

  const handleUpdateIntervento = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("Interventi")
      .update({ descrizione_intervento: descrizioneIntervento || null })
      .eq("id_intervento", interventoId);

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'intervento",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Intervento aggiornato",
        description: "Le modifiche sono state salvate con successo",
      });
      onSuccess?.();
    }

    setLoading(false);
  };

  const handleAggiungiLavorazione = async () => {
    if (!nomeLavorazione.trim()) {
      toast({
        title: "Errore",
        description: "Il nome della lavorazione è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("int_lavorazioni")
      .insert({
        id_intervento: interventoId,
        nome_lavorazione: nomeLavorazione,
        descrizione_lavorazione: descrizioneLavorazione || null,
        data_da_prevista: dataDa ? format(dataDa, "yyyy-MM-dd") : null,
        data_a_prevista: dataA ? format(dataA, "yyyy-MM-dd") : null,
        durata_prevista: durataOre || null,
        n_tecnici_previsti: numTecnici ? parseFloat(numTecnici) : null,
      });

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la lavorazione",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Lavorazione aggiunta",
        description: "La nuova lavorazione è stata aggiunta con successo",
      });
      
      // Reset form
      setNomeLavorazione("");
      setDescrizioneLavorazione("");
      setDataDa(undefined);
      setDataA(undefined);
      setDurataOre("");
      setNumTecnici("");
      setShowNuovaLavorazione(false);
      
      loadIntervento();
    }

    setLoading(false);
  };

  const handleEliminaLavorazione = async (idLavorazione: string) => {
    const { error } = await supabase
      .from("int_lavorazioni")
      .update({ is_cancellato: true })
      .eq("id_lavorazione", idLavorazione);

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare la lavorazione",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Lavorazione eliminata",
        description: "La lavorazione è stata eliminata con successo",
      });
      loadIntervento();
    }
  };

  const handleModificaLavorazione = (lavorazione: Lavorazione) => {
    setLavorazioneInModifica(lavorazione.id_lavorazione);
    setProdottiLavorazioneCorrente(lavorazione.prodotti || []);
  };

  const handleAggiungiProdotto = (prodotto: any) => {
    const nuovoProdotto: Prodotto = {
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
    setProdottiLavorazioneCorrente([...prodottiLavorazioneCorrente, nuovoProdotto]);
  };

  const handleSalvaProdotti = async () => {
    if (!lavorazioneInModifica) return;

    setLoading(true);

    try {
      // Elimina i prodotti esistenti
      await supabase
        .from("int_lav_prod")
        .delete()
        .eq("id_lavorazione", lavorazioneInModifica);

      // Inserisci i nuovi prodotti
      if (prodottiLavorazioneCorrente.length > 0) {
        const prodottiToInsert = prodottiLavorazioneCorrente.map(p => ({
          id_lavorazione: lavorazioneInModifica,
          id_prodotto: p.id_prodotto,
          n_prodotto_uscita_prevista: p.quantita,
          costo_prodotto_lavorazione: p.costo_lavorazione,
          prezzo_prodotto_lavorazione: p.prezzo_lavorazione,
        }));

        await supabase.from("int_lav_prod").insert(prodottiToInsert);
      }

      toast({
        title: "Prodotti salvati",
        description: "I prodotti della lavorazione sono stati aggiornati",
      });

      setLavorazioneInModifica(null);
      setProdottiLavorazioneCorrente([]);
      loadIntervento();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare i prodotti",
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
          <Edit className="h-4 w-4 mr-1" />
          Modifica
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Intervento</DialogTitle>
          <DialogDescription>
            Modifica i dati dell'intervento e gestisci le lavorazioni
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Descrizione Intervento</Label>
            <Textarea
              value={descrizioneIntervento}
              onChange={(e) => setDescrizioneIntervento(e.target.value)}
              placeholder="Descrizione generale dell'intervento..."
              rows={2}
            />
          </div>

          <Button onClick={handleUpdateIntervento} disabled={loading}>
            Salva Descrizione Intervento
          </Button>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Lavorazioni</h3>
              <Button 
                size="sm" 
                onClick={() => setShowNuovaLavorazione(!showNuovaLavorazione)}
                variant={showNuovaLavorazione ? "outline" : "default"}
              >
                <Plus className="h-4 w-4 mr-1" />
                {showNuovaLavorazione ? "Annulla" : "Aggiungi Lavorazione"}
              </Button>
            </div>

            {showNuovaLavorazione && (
              <div className="border p-4 rounded-lg mb-4 space-y-4">
                <div className="space-y-2">
                  <Label>Nome Lavorazione *</Label>
                  <Input
                    value={nomeLavorazione}
                    onChange={(e) => setNomeLavorazione(e.target.value)}
                    placeholder="Es: Riparazione motore"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrizione</Label>
                  <Textarea
                    value={descrizioneLavorazione}
                    onChange={(e) => setDescrizioneLavorazione(e.target.value)}
                    placeholder="Dettagli della lavorazione..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Inizio</Label>
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
                          {dataDa ? format(dataDa, "dd/MM/yyyy") : "Seleziona"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={dataDa} onSelect={setDataDa} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Fine</Label>
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
                          {dataA ? format(dataA, "dd/MM/yyyy") : "Seleziona"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={dataA} onSelect={setDataA} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Durata (ore)</Label>
                    <Input
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
                    />
                  </div>
                </div>

                <Button onClick={handleAggiungiLavorazione} disabled={loading}>
                  Salva Lavorazione
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {lavorazioni.map((lav) => (
                <div key={lav.id_lavorazione} className="border p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{lav.nome_lavorazione}</h4>
                      {lav.descrizione_lavorazione && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {lav.descrizione_lavorazione}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        {lav.data_da_prevista && (
                          <span>Da: {format(new Date(lav.data_da_prevista), "dd/MM/yyyy")}</span>
                        )}
                        {lav.data_a_prevista && (
                          <span>A: {format(new Date(lav.data_a_prevista), "dd/MM/yyyy")}</span>
                        )}
                        {lav.durata_prevista && <span>Durata: {lav.durata_prevista}</span>}
                        {lav.n_tecnici_previsti && <span>Tecnici: {lav.n_tecnici_previsti}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModificaLavorazione(lav)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEliminaLavorazione(lav.id_lavorazione)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {lavorazioneInModifica === lav.id_lavorazione && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold">Gestione Prodotti/Ricambi</Label>
                        <ProdottoSelettore onSelect={handleAggiungiProdotto} />
                      </div>

                      {prodottiLavorazioneCorrente.length > 0 && (
                        <div className="space-y-2">
                          {prodottiLavorazioneCorrente.map((prodotto, index) => (
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
                                    setProdottiLavorazioneCorrente(
                                      prodottiLavorazioneCorrente.filter((_, i) => i !== index)
                                    );
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
                                      const newProdotti = [...prodottiLavorazioneCorrente];
                                      newProdotti[index].quantita = parseFloat(e.target.value) || 1;
                                      setProdottiLavorazioneCorrente(newProdotti);
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
                                      const newProdotti = [...prodottiLavorazioneCorrente];
                                      newProdotti[index].costo_lavorazione = parseFloat(e.target.value) || 0;
                                      setProdottiLavorazioneCorrente(newProdotti);
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
                                      const newProdotti = [...prodottiLavorazioneCorrente];
                                      newProdotti[index].prezzo_lavorazione = parseFloat(e.target.value) || 0;
                                      setProdottiLavorazioneCorrente(newProdotti);
                                    }}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={handleSalvaProdotti} disabled={loading}>
                          Salva Prodotti
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setLavorazioneInModifica(null);
                            setProdottiLavorazioneCorrente([]);
                          }}
                        >
                          Annulla
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
