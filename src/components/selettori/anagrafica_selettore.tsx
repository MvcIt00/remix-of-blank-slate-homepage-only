import { BaseSelector } from "@/components/ui/base-selector";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Anagrafica {
  id_anagrafica: string;
  ragione_sociale: string;
  partita_iva: string | null;
  is_cliente: boolean | null;
  is_fornitore: boolean | null;
  is_owner: boolean | null;
}

interface AnagraficaSelettoreProps {
  onSelectAnagrafica: (anagrafica: Anagrafica) => void;
  defaultValue?: string;
  placeholder?: string;
  filterView?: 'trasportatori';  // Estendibile: 'clienti' | 'fornitori' | etc.
}

export function AnagraficaSelettore({
  onSelectAnagrafica,
  defaultValue,
  placeholder = "Cerca anagrafica per nome o partita IVA...",
  filterView
}: AnagraficaSelettoreProps) {

  const tableName = filterView === 'trasportatori' ? 'vw_anagrafiche_trasportatori' : 'Anagrafiche';

  const handleSearch = async (term: string) => {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("is_cancellato", false)
      .or(`ragione_sociale.ilike.%${term}%,partita_iva.ilike.%${term}%`)
      .limit(10);

    if (error) {
      console.error("Error searching anagrafiche:", error);
      return null;
    }
    return data;
  };

  const loadById = async (id: string) => {
    const { data } = await supabase
      .from(tableName)
      .select("*")
      .eq("id_anagrafica", id)
      .eq("is_cancellato", false)
      .single();
    return data;
  };

  return (
    <BaseSelector
      onSearch={handleSearch}
      loadById={loadById}
      onSelect={(a) => onSelectAnagrafica(a)}
      getDisplayValue={(a) => a.ragione_sociale}
      getId={(a) => a.id_anagrafica}
      placeholder={placeholder}
      defaultValue={defaultValue}
      inputClassName="text-lg h-12"
      renderItem={(anagrafica) => (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{anagrafica.ragione_sociale}</h3>
            {anagrafica.partita_iva && (
              <p className="text-sm text-muted-foreground">P.IVA: {anagrafica.partita_iva}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-1 justify-end shrink-0">

          </div>
        </div>
      )}
    />
  );
}
