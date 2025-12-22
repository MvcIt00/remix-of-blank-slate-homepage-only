import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Sede {
  id_sede: string;
  nome_sede: string | null;
  indirizzo: string | null;
  citta: string | null;
  provincia: string | null;
  ubicazione_completa: string | null;
}

interface UbicazioneSelettoreProps {
  onSelectSede: (id: string) => void;
  value?: string;
  disabled?: boolean;
}

export function UbicazioneSelettore({ onSelectSede, value, disabled }: UbicazioneSelettoreProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load value whenever it changes
  useEffect(() => {
    if (value && value !== selectedSede?.id_sede) {
      loadSedeById(value);
    } else if (!value) {
      setSearchTerm("");
      setSelectedSede(null);
    }
    // Optimization: prevent loop if selectedSede matches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  async function loadSedeById(sedeId: string) {
    const { data } = await supabase
      .from("vw_sedi_tutte")
      .select("*")
      .eq("id_sede", sedeId)
      .single();

    if (data) {
      setSelectedSede(data);
      setSearchTerm(data.ubicazione_completa || "");
    }
  }

  useEffect(() => {
    if (disabled) return;
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchSedi();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, disabled]);

  async function searchSedi() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vw_sedi_tutte")
        .select("*")
        .or(`indirizzo.ilike.%${searchTerm}%,citta.ilike.%${searchTerm}%,provincia.ilike.%${searchTerm}%,nome_sede.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setResults(data || []);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error searching sedi:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectSede(sede: Sede) {
    setSelectedSede(sede);
    setSearchTerm(sede.ubicazione_completa || "");
    onSelectSede(sede.id_sede);
    setShowDropdown(false);
    setResults([]);
  }

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={disabled ? "Ubicazione vincolata" : "Cerca per indirizzo, città o provincia..."}
          value={searchTerm}
          onChange={(e) => {
            if (disabled) return;
            setSearchTerm(e.target.value);
            setSelectedSede(null);
          }}
          onFocus={() => {
            if (disabled) return;
            if (results.length > 0) setShowDropdown(true);
          }}
          className="pl-9"
          disabled={disabled}
        />
      </div>

      {showDropdown && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Caricamento...
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((sede) => (
                <button
                  key={sede.id_sede}
                  onClick={() => handleSelectSede(sede)}
                  className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
                >
                  <div className="font-medium">{sede.ubicazione_completa}</div>
                </button>
              ))}
            </div>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nessuna sede trovata
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
