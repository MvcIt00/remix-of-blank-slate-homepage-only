import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Prodotto {
  id_prodotto: string;
  codice: string | null;
  nome: string | null;
  marca: string | null;
  modello: string | null;
  costo_prodotto: number | null;
  prezzo_prodotto: number | null;
}

interface ProdottoSelettoreProps {
  onSelect: (prodotto: Prodotto) => void;
}

const ProdottoSelettore = ({ onSelect }: ProdottoSelettoreProps) => {
  const [open, setOpen] = useState(false);
  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [filteredProdotti, setFilteredProdotti] = useState<Prodotto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadProdotti();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProdotti(prodotti);
    } else {
      const filtered = prodotti.filter(
        (p) =>
          p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.codice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.modello?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProdotti(filtered);
    }
  }, [searchTerm, prodotti]);

  const loadProdotti = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Prodotti")
      .select("*")
      .eq("is_cancellato", false)
      .order("nome", { ascending: true });

    if (error) {
      console.error("Errore nel caricamento dei prodotti:", error);
    } else {
      setProdotti(data || []);
      setFilteredProdotti(data || []);
    }
    setLoading(false);
  };

  const handleSelect = (prodotto: Prodotto) => {
    onSelect(prodotto);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Prodotto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seleziona Prodotto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Cerca Prodotto</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, codice, marca o modello..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[400px] border rounded-lg">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Caricamento...
              </div>
            ) : filteredProdotti.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nessun prodotto trovato
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredProdotti.map((prodotto) => (
                  <div
                    key={prodotto.id_prodotto}
                    className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleSelect(prodotto)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{prodotto.nome || "N/D"}</p>
                        <p className="text-sm text-muted-foreground">
                          Codice: {prodotto.codice || "N/D"}
                        </p>
                        {(prodotto.marca || prodotto.modello) && (
                          <p className="text-sm text-muted-foreground">
                            {prodotto.marca} {prodotto.modello}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p>Costo: €{prodotto.costo_prodotto?.toFixed(2) || "0.00"}</p>
                        <p>Prezzo: €{prodotto.prezzo_prodotto?.toFixed(2) || "0.00"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProdottoSelettore;
