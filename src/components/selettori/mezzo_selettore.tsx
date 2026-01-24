import { BaseSelector } from "@/components/ui/base-selector";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Mezzo {
  id_mezzo: string;
  marca: string | null;
  modello: string | null;
  matricola: string | null;
  anno: string | null;
  categoria: string | null;
  id_interno: string | null;
  owner_ragione_sociale: string | null;
  ubicazione_completa: string | null;
  sede_assegnata_ubicazione: string | null;
}

interface MezzoSelettoreProps {
  onSelectMezzo: (id: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

export function MezzoSelettore({
  onSelectMezzo,
  placeholder = "Cerca mezzo per marca, modello, matricola o ID interno...",
  defaultValue
}: MezzoSelettoreProps) {

  const handleSearch = async (term: string) => {
    // Query ultra-veloce sulla VIEW ottimizzata con tutti i JOIN pre-computati
    const { data, error } = await (supabase
      .from("vw_mezzi_selettore" as any)
      .select("*")
      .or(`marca.ilike.%${term}%,modello.ilike.%${term}%,matricola.ilike.%${term}%,id_interno.ilike.%${term}%,owner_ragione_sociale.ilike.%${term}%`)
      .limit(50) as any);

    if (error) {
      console.error("Error searching mezzi:", error);
      return null;
    }

    return data as Mezzo[];
  };

  const loadById = async (id: string): Promise<Mezzo | null> => {
    const { data } = await (supabase
      .from("vw_mezzi_selettore" as any)
      .select("*")
      .eq("id_mezzo", id)
      .single() as any);
    return data as Mezzo | null;
  };

  return (
    <BaseSelector
      onSearch={handleSearch}
      loadById={loadById}
      onSelect={(m) => onSelectMezzo(m.id_mezzo)}
      getDisplayValue={(m) => {
        const marca = m.marca ?? "";
        const modello = m.modello ?? "";
        const matricola = m.matricola ? `(Mat: ${m.matricola})` : "";
        const idInterno = m.id_interno ? `(ID: ${m.id_interno})` : "";
        return [marca, modello, matricola, idInterno].filter(Boolean).join(" ").trim() || "Mezzo sconosciuto";
      }}
      getId={(m) => m.id_mezzo}
      placeholder={placeholder}
      defaultValue={defaultValue}
      inputClassName="text-lg h-12"
      debounceMs={150}
      renderItem={(mezzo) => (
        <div className="flex flex-col gap-1">
          {mezzo.owner_ragione_sociale && (
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-0.5">
              {mezzo.owner_ragione_sociale}
            </p>
          )}
          <h3 className="font-semibold text-foreground text-base">{mezzo.marca} {mezzo.modello}</h3>
          <div className="text-sm text-foreground/90 space-y-0.5">
            <div className="flex gap-4">
              {mezzo.matricola && <p className="font-light">Matricola: {mezzo.matricola}</p>}
              {mezzo.id_interno && <p className="font-light">ID: {mezzo.id_interno}</p>}
            </div>
            {mezzo.ubicazione_completa && <p className="italic font-normal">Ubicazione: {mezzo.ubicazione_completa}</p>}
          </div>
        </div>
      )}
    />
  );
}
