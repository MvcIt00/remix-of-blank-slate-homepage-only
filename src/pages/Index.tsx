import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NuovaAnagraficaForm } from "@/components/form/nuova_anagrafica_form";
import { NuovoMezzoBottone } from "@/components/bottoni/nuovo_mezzo_bottone";
import { AnagraficaSelettore } from "@/components/selettori/anagrafica_selettore";
import { MezzoSelettore } from "@/components/selettori/mezzo_selettore";
import { AnagraficaCard } from "@/components/card/anagrafica_card";
import { MezzoCard } from "@/components/card/mezzo_card";
import { ParcoMacchine } from "@/components/parco_macchine";

const Index = () => {
  const [selectedAnagraficaId, setSelectedAnagraficaId] = useState<string | null>(null);
  const [selectedMezzoId, setSelectedMezzoId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch noleggi attivi to cache them for instant navigation
    queryClient.prefetchQuery({
      queryKey: ["noleggi-attivi"],
      queryFn: async () => {
        const { data } = await supabase
          .from("vw_noleggi_completi" as any)
          .select("*")
          .neq("stato_noleggio", "archiviato")
          .order("created_at", { ascending: false });
        return data || [];
      },
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestione Aziendale</h1>
                <p className="text-sm text-muted-foreground">Sistema di registrazione e gestione</p>
              </div>
            </div>
            <div className="flex gap-3">
              <NuovaAnagraficaForm />
              <NuovoMezzoBottone />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-none bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                Parco Macchine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ParcoMacchine />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-none bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">
                  Cerca Anagrafica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnagraficaSelettore onSelectAnagrafica={setSelectedAnagraficaId} />
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-none bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">
                  Cerca Mezzo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MezzoSelettore onSelectMezzo={setSelectedMezzoId} />
              </CardContent>
            </Card>
          </div>
        </div>

        {selectedAnagraficaId && (
          <AnagraficaCard anagraficaId={selectedAnagraficaId} onClose={() => setSelectedAnagraficaId(null)} />
        )}

        {selectedMezzoId && (
          <MezzoCard mezzoId={selectedMezzoId} onClose={() => setSelectedMezzoId(null)} />
        )}
      </main>
    </div>
  );
};

export default Index;
