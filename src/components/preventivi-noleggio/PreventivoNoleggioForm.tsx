import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnagraficaSelettore } from "@/components/selettori/anagrafica_selettore";
import { MezzoSelettore } from "@/components/selettori/mezzo_selettore";
import { PreventivoNoleggioInput } from "@/types/preventiviNoleggio";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SedeSelettore } from "@/components/selettori/sede_selettore";
// import { useCalcoloTrasporto, useZoneTrasporto } from "@/hooks/useCalcoloTrasporto"; // OPTIONAL FUTURE FEATURE
import { Calculator, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const preventivoSchema = z.object({
  id_anagrafica: z.string().min(1, "Seleziona un cliente"),
  id_mezzo: z.string().min(1, "Seleziona un mezzo"),
  id_anagrafica_fornitore: z.string().optional().nullable(),
  sede_operativa: z.string().optional().nullable(),
  data_inizio: z.string().nullable(),
  data_fine: z.string().nullable(),
  tempo_indeterminato: z.boolean().default(false),
  prezzo_noleggio: z.number().nullable(),
  prezzo_trasporto: z.number().nullable(),
  id_zona_partenza: z.string().optional().nullable(),
  id_zona_arrivo: z.string().optional().nullable(),
  tipo_trasporto: z.enum(["andata", "ritorno", "andata_ritorno"]).default("andata"),
  tipo_canone: z.enum(["giornaliero", "mensile"]).nullable(),
  note: z.string().optional().nullable(),
});

type PreventivoFormValues = z.infer<typeof preventivoSchema>;

interface PreventivoNoleggioFormProps {
  onSubmit: (values: PreventivoNoleggioInput) => Promise<void>;
  defaultValues?: Partial<PreventivoFormValues>;
  submitLabel?: string;
}

export function PreventivoNoleggioForm({
  onSubmit,
  defaultValues,
  submitLabel = "Salva preventivo",
}: PreventivoNoleggioFormProps) {
  const [loading, setLoading] = useState(false);
  const { data: zone } = useZoneTrasporto();

  const form = useForm<PreventivoFormValues>({
    resolver: zodResolver(preventivoSchema),
    defaultValues: {
      id_anagrafica: "",
      id_mezzo: "",
      tempo_indeterminato: false,
      tipo_canone: "mensile",
      prezzo_noleggio: null,
      prezzo_trasporto: null,
      id_zona_partenza: null,
      id_zona_arrivo: null,
      tipo_trasporto: "andata",
      data_inizio: null,
      data_fine: null,
      note: null,
      id_anagrafica_fornitore: null,
      sede_operativa: null,
      ...defaultValues,
    },
  });

  const [sedi, setSedi] = useState<any[]>([]);
  const idAnagrafica = form.watch("id_anagrafica");
  const tempoIndeterminato = form.watch("tempo_indeterminato");
  const zonaPartenza = form.watch("id_zona_partenza");
  const zonaArrivo = form.watch("id_zona_arrivo");
  const tipoTrasporto = form.watch("tipo_trasporto");
  const idFornitore = form.watch("id_anagrafica_fornitore");

  // Hook per calcolo automatico prezzo trasporto - OPTIONAL FUTURE FEATURE
  // const { data: calcoloTrasporto, isLoading: isCalcoloLoading } = useCalcoloTrasporto(
  //   {
  //     id_zona_partenza: zonaPartenza || null,
  //     id_zona_arrivo: zonaArrivo || null,
  //     tipo_trasporto: tipoTrasporto,
  //     id_fornitore: idFornitore || null,
  //   },
  //   false // Non auto-eseguire, solo su click "Calcola"
  // );

  useEffect(() => {
    if (idAnagrafica) {
      loadSedi(idAnagrafica);
    } else {
      setSedi([]);
    }
  }, [idAnagrafica]);

  async function loadSedi(id: string) {
    const { data } = await supabase
      .from("Sedi")
      .select("*")
      .eq("id_anagrafica", id)
      .eq("is_cancellato", false);

    if (data) setSedi(data);
  }

  const handleSubmit = async (values: PreventivoFormValues) => {
    setLoading(true);
    await onSubmit({
      id_mezzo: values.id_mezzo,
      id_anagrafica: values.id_anagrafica,
      id_anagrafica_fornitore: values.id_anagrafica_fornitore ?? null,
      sede_operativa: values.sede_operativa ?? null,
      tempo_indeterminato: values.tempo_indeterminato,
      prezzo_noleggio: values.prezzo_noleggio,
      prezzo_trasporto: values.prezzo_trasporto,
      tipo_canone: values.tipo_canone,
      note: values.note ?? null,
      data_inizio: values.data_inizio || null,
      data_fine: values.tempo_indeterminato ? null : values.data_fine || null,
    });
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="id_anagrafica"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <FormControl>
                  <AnagraficaSelettore
                    onSelectAnagrafica={field.onChange}
                    defaultValue={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_mezzo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mezzo</FormLabel>
                <FormControl>
                  <MezzoSelettore
                    onSelectMezzo={field.onChange}
                    defaultValue={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sede_operativa"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Sede operativa</FormLabel>
                <FormControl>
                  <SedeSelettore
                    sedi={sedi}
                    onSelectSede={field.onChange}
                    value={field.value ?? undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data_inizio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data inizio</FormLabel>
                <FormControl>
                  <Input type="date" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data_fine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data fine</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={tempoIndeterminato}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tempo_indeterminato"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Tempo indeterminato</FormLabel>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="prezzo_noleggio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prezzo noleggio (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="id_zona_partenza"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona Partenza</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona zona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zone?.map((zona) => (
                          <SelectItem key={zona.id_zona} value={zona.id_zona}>
                            {zona.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="id_zona_arrivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona Arrivo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona zona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zone?.map((zona) => (
                          <SelectItem key={zona.id_zona} value={zona.id_zona}>
                            {zona.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_trasporto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Trasporto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="andata">Solo Andata</SelectItem>
                        <SelectItem value="ritorno">Solo Ritorno</SelectItem>
                        <SelectItem value="andata_ritorno">Andata e Ritorno</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {zonaPartenza && zonaArrivo && calcoloTrasporto && !calcoloTrasporto.has_config && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nessuna tariffa configurata per questa tratta. Inserisci il prezzo manualmente.
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="prezzo_trasporto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prezzo trasporto (€)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        placeholder={calcoloTrasporto?.prezzo_suggerito ? `Suggerito: €${calcoloTrasporto.prezzo_suggerito}` : "Inserisci prezzo"}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!zonaPartenza || !zonaArrivo || isCalcoloLoading}
                      onClick={() => {
                        if (calcoloTrasporto?.prezzo_suggerito) {
                          field.onChange(calcoloTrasporto.prezzo_suggerito);
                        }
                      }}
                      title="Calcola prezzo da configurazione"
                    >
                      <Calculator className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tipo_canone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo canone</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={(value) => field.onChange(value as "giornaliero" | "mensile")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensile">Mensile</SelectItem>
                      <SelectItem value="giornaliero">Giornaliero</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  placeholder="Aggiungi note o condizioni..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvataggio..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form >
  );
}
