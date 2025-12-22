import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Trash2 } from "lucide-react";
import ProdottoSelettore from "@/components/selettori/prodotto_selettore";

interface ProdottoLavorazione {
  id_lav_prod?: string;
  id_prodotto: string;
  n_prodotto_uscita_prevista: number | null;
  costo_prodotto_lavorazione: number | null;
  prezzo_prodotto_lavorazione: number | null;
  Prodotti?: {
    nome: string | null;
    codice: string | null;
  };
}

interface LavorazioneFormProps {
  idIntervento: string;
  lavorazione?: {
    id_lavorazione: string;
    nome_lavorazione: string | null;
    descrizione_lavorazione: string | null;
    data_da_prevista: string | null;
    data_a_prevista: string | null;
    durata_prevista: string | null;
    n_tecnici_previsti: number | null;
    prezzo_lavorazione: number | null;
    prodotti?: ProdottoLavorazione[];
  } | null;
  prezzoManodopera: number;
  onSuccess: () => void;
  onDelete?: (id: string) => void;
}

export const LavorazioneForm = ({ 
  idIntervento, 
  lavorazione, 
  prezzoManodopera,
  onSuccess,
  onDelete 
}: LavorazioneFormProps) => {
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState(lavorazione?.nome_lavorazione || "");
  const [descrizione, setDescrizione] = useState(lavorazione?.descrizione_lavorazione || "");
  const [dataDa, setDataDa] = useState(lavorazione?.data_da_prevista || "");
  const [dataA, setDataA] = useState(lavorazione?.data_a_prevista || "");
  const [durata, setDurata] = useState(lavorazione?.durata_prevista || "");
  const [tecnici, setTecnici] = useState(lavorazione?.n_tecnici_previsti || 1);
  const [prezzo, setPrezzo] = useState(lavorazione?.prezzo_lavorazione || 0);
  const [prodotti, setProdotti] = useState<ProdottoLavorazione[]>(lavorazione?.prodotti || []);

  useEffect(() => {
    if (durata && tecnici) {
      const ore = parseFloat(durata) || 0;
      setPrezzo(ore * tecnici * prezzoManodopera);
    }
  }, [durata, tecnici, prezzoManodopera]);

  const handleSalva = async () => {
    if (!nome.trim()) {
      toast.error("Il nome della lavorazione è obbligatorio");
      return;
    }

    setSaving(true);

    try {
      const lavorazioneData = {
        id_intervento: idIntervento,
        nome_lavorazione: nome,
        descrizione_lavorazione: descrizione || null,
        data_da_prevista: dataDa || null,
        data_a_prevista: dataA || null,
        durata_prevista: durata || null,
        n_tecnici_previsti: tecnici,
        prezzo_lavorazione: prezzo
      };

      let idLavorazione: string;

      if (lavorazione?.id_lavorazione) {
        // Update existing
        const { error } = await supabase
          .from("int_lavorazioni")
          .update(lavorazioneData)
          .eq("id_lavorazione", lavorazione.id_lavorazione);

        if (error) throw error;
        idLavorazione = lavorazione.id_lavorazione;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("int_lavorazioni")
          .insert(lavorazioneData)
          .select()
          .single();

        if (error) throw error;
        idLavorazione = data.id_lavorazione;
      }

      // Update prodotti
      await supabase
        .from("int_lav_prod")
        .delete()
        .eq("id_lavorazione", idLavorazione);

      if (prodotti.length > 0) {
        const prodottiToInsert = prodotti.map(p => ({
          id_lavorazione: idLavorazione,
          id_prodotto: p.id_prodotto,
          n_prodotto_uscita_prevista: p.n_prodotto_uscita_prevista,
          costo_prodotto_lavorazione: p.costo_prodotto_lavorazione,
          prezzo_prodotto_lavorazione: p.prezzo_prodotto_lavorazione,
        }));

        const { error: prodError } = await supabase
          .from("int_lav_prod")
          .insert(prodottiToInsert);

        if (prodError) throw prodError;
      }

      toast.success(lavorazione ? "Lavorazione aggiornata" : "Lavorazione creata");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Errore nel salvataggio della lavorazione");
    } finally {
      setSaving(false);
    }
  };

  const aggiungiProdotto = (prodotto: any) => {
    const nuovoProdotto: ProdottoLavorazione = {
      id_prodotto: prodotto.id_prodotto,
      n_prodotto_uscita_prevista: 1,
      costo_prodotto_lavorazione: prodotto.costo_prodotto || 0,
      prezzo_prodotto_lavorazione: prodotto.prezzo_prodotto || 0,
      Prodotti: {
        nome: prodotto.nome,
        codice: prodotto.codice
      }
    };
    setProdotti([...prodotti, nuovoProdotto]);
  };

  const aggiornaProdotto = (index: number, field: string, value: number) => {
    const nuoviProdotti = [...prodotti];
    nuoviProdotti[index] = { ...nuoviProdotti[index], [field]: value };
    setProdotti(nuoviProdotti);
  };

  const rimuoviProdotto = (index: number) => {
    setProdotti(prodotti.filter((_, i) => i !== index));
  };

  const calcolaTotale = () => {
    const totaleProdotti = prodotti.reduce(
      (sum, p) => sum + (p.prezzo_prodotto_lavorazione || 0) * (p.n_prodotto_uscita_prevista || 0),
      0
    );
    return prezzo + totaleProdotti;
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nome Lavorazione *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Es: Riparazione motore"
            />
          </div>
          <div>
            <Label>Descrizione</Label>
            <Input
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              placeholder="Dettagli..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Data Inizio</Label>
            <Input
              type="date"
              value={dataDa}
              onChange={(e) => setDataDa(e.target.value)}
            />
          </div>
          <div>
            <Label>Data Fine</Label>
            <Input
              type="date"
              value={dataA}
              onChange={(e) => setDataA(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Durata (ore)</Label>
            <Input
              type="number"
              step="0.5"
              value={durata}
              onChange={(e) => setDurata(e.target.value)}
              placeholder="8"
            />
          </div>
          <div>
            <Label>N° Tecnici</Label>
            <Input
              type="number"
              min="1"
              value={tecnici}
              onChange={(e) => setTecnici(parseInt(e.target.value) || 1)}
            />
          </div>
          <div>
            <Label>Prezzo Manodopera (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={prezzo}
              onChange={(e) => setPrezzo(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Prodotti */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-semibold">Prodotti/Ricambi</Label>
            <ProdottoSelettore onSelect={aggiungiProdotto} />
          </div>

          {prodotti.length > 0 && (
            <div className="space-y-2">
              {prodotti.map((prod, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-center text-sm bg-muted/50 p-2 rounded">
                  <div className="col-span-2">
                    <p className="font-medium">{prod.Prodotti?.nome}</p>
                    <p className="text-xs text-muted-foreground">{prod.Prodotti?.codice}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Qtà</Label>
                    <Input
                      type="number"
                      min="1"
                      value={prod.n_prodotto_uscita_prevista || 1}
                      onChange={(e) => aggiornaProdotto(index, "n_prodotto_uscita_prevista", parseInt(e.target.value))}
                      className="h-7"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Prezzo €</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={prod.prezzo_prodotto_lavorazione || 0}
                      onChange={(e) => aggiornaProdotto(index, "prezzo_prodotto_lavorazione", parseFloat(e.target.value))}
                      className="h-7"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => rimuoviProdotto(index)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totale e azioni */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button onClick={handleSalva} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvataggio..." : "Salva"}
            </Button>
            {lavorazione && onDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete(lavorazione.id_lavorazione)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </Button>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Totale Lavorazione</p>
            <p className="text-lg font-bold">€{calcolaTotale().toFixed(2)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
