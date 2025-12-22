import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Sede {
  id_sede: string;
  nome_sede: string | null;
  citta: string | null;
  indirizzo: string | null;
}

interface SedeSelettoreProps {
  sedi: Sede[];
  onSelectSede: (id: string) => void;
  value?: string;
  placeholder?: string;
}

export function SedeSelettore({ sedi, onSelectSede, value, placeholder }: SedeSelettoreProps) {
  if (sedi.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground border rounded-lg">
        Nessuna sede disponibile
      </div>
    );
  }

  return (
    <Select value={value || ""} onValueChange={onSelectSede}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || "Seleziona una sede"} />
      </SelectTrigger>
      <SelectContent>
        {sedi.map((sede) => (
          <SelectItem key={sede.id_sede} value={sede.id_sede}>
            {sede.nome_sede || "Sede senza nome"} - {sede.citta || ""} {sede.indirizzo || ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
