import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Truck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";
import { AnagraficaSelettore } from "@/components/selettori/anagrafica_selettore";
import { SedeSelettore } from "@/components/selettori/sede_selettore";
import { FormModal } from "@/components/ui/responsive-modal";

/* =======================
   Schema
======================= */
const mezzoSchema = z.object({
  // Proprietà / ubicazione
  id_anagrafica: z.string().optional(),
  id_sede_assegnata: z.string().optional(),

  // Dati mezzo
  marca: z.string().optional(),
  modello: z.string().optional(),
  matricola: z.string().optional(),
  id_interno: z.string().optional(),
  anno: z.string().optional(),
  ore_moto: z.string().optional(),

  categoria: z.string().optional(),

  stato_funzionamento: z.string().optional(),
  stato_funzionamento_descrizione: z.string().optional(),

  is_disponibile_noleggio: z.boolean().default(false),

  // Subnoleggio
  id_fornitore_subnoleggio: z.string().optional(),
  data_inizio: z.string().optional(),
  data_fine: z.string().optional(),
  tempo_indeterminato: z.boolean().default(false),
  costo_subnoleggio: z.string().optional(),
  valore_residuo: z.string().optional(),
  contratto: z.string().optional(),
});

type MezzoFormValues = z.infer<typeof mezzoSchema>;

interface NuovoMezzoFormProps {
  onSuccess?: () => void;
}

export function NuovoMezzoForm({ onSuccess }: NuovoMezzoFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // sedi in funzione dell'anagrafica proprietaria
  const [sediDisponibili, setSediDisponibili] = useState<any[]>([]);
  const [hasSubnoleggio, setHasSubnoleggio] = useState(false);

  const form = useForm<MezzoFormValues>({
    resolver: zodResolver(mezzoSchema),
    defaultValues: {
      id_anagrafica: "",
      id_sede_assegnata: "",
      marca: "",
      modello: "",
      matricola: "",
      id_interno: "",
      anno: "",
      ore_moto: "",
      categoria: "",
      stato_funzionamento: "",
      stato_funzionamento_descrizione: "",
      is_disponibile_noleggio: false,
      id_fornitore_subnoleggio: "",
      data_inizio: "",
      data_fine: "",
      tempo_indeterminato: false,
      costo_subnoleggio: "",
      valore_residuo: "",
      contratto: "",
    },
  });

  const idAnagraficaWatch = form.watch("id_anagrafica");
  const tempoIndeterminato = form.watch("tempo_indeterminato");
  const categoriaWatch = form.watch("categoria");

  /* =======================
     Load sedi (dipende da anagrafica)
  ======================= */
  async function loadSedi(anagraficaId: string) {
    const { data, error } = await supabase.from("vw_sedi_per_anagrafica").select("*").eq("id_anagrafica", anagraficaId);

    if (error) {
      console.error("Errore loadSedi:", error);
      setSediDisponibili([]);
      return;
    }
    setSediDisponibili(data || []);
  }

  // Gerarchia: cambia anagrafica => reset sede + reload sedi
  useEffect(() => {
    if (idAnagraficaWatch && idAnagraficaWatch.trim().length > 0) {
      form.setValue("id_sede_assegnata", "");
      loadSedi(idAnagraficaWatch);
    } else {
      setSediDisponibili([]);
      form.setValue("id_sede_assegnata", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAnagraficaWatch]);

  async function handleAnagraficaSelect(anagraficaId: string) {
    form.setValue("id_anagrafica", anagraficaId);
    // NON chiamare loadSedi qui: lo fa già l'useEffect quando cambia id_anagrafica
  }

  /* =======================
     Submit
  ======================= */
  async function onSubmit(values: MezzoFormValues) {
    try {
      setLoading(true);

      const { data: mezzoData, error: mezzoError } = await supabase
        .from("Mezzi")
        .insert({
          marca: values.marca || null,
          modello: values.modello || null,
          matricola: values.matricola || null,
          anno: values.anno || null,
          id_interno: values.id_interno || null,
          categoria: (values.categoria as any) || null,

          stato_funzionamento: (values.stato_funzionamento as any) || null,
          stato_funzionamento_descrizione: values.stato_funzionamento_descrizione || null,

          ore_moto: values.ore_moto ? parseFloat(values.ore_moto) : null,
          is_disponibile_noleggio: values.is_disponibile_noleggio,

          id_anagrafica: values.id_anagrafica || null,
          id_sede_assegnata: values.id_sede_assegnata || null,
          id_sede_ubicazione: values.id_sede_assegnata || null,
        })
        .select()
        .single();

      if (mezzoError) throw mezzoError;

      if (hasSubnoleggio && mezzoData) {
        const { error: subnoleggioError } = await supabase.from("Subnoleggi").insert({
          id_mezzo: mezzoData.id_mezzo,
          id_anagrafica: values.id_fornitore_subnoleggio || null,
          data_inizio: values.data_inizio || null,
          data_fine: values.tempo_indeterminato ? null : values.data_fine || null,
          tempo_indeterminato: values.tempo_indeterminato,
          costo_subnoleggio: values.costo_subnoleggio ? parseFloat(values.costo_subnoleggio) : null,
          valore_residuo: values.valore_residuo ? parseFloat(values.valore_residuo) : null,
          contratto: values.contratto || null,
        });

        if (subnoleggioError) throw subnoleggioError;
      }

      toast.success("Mezzo creato con successo");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating mezzo:", error);
      toast.error("Errore nella creazione del mezzo");
    } finally {
      setLoading(false);
    }
  }

  /* =======================
     Render (Modal + Form)
  ======================= */
  const footer = (
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
        Annulla
      </Button>

      <Button type="submit" form="mezzo-form" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Crea Mezzo
      </Button>
    </div>
  );

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)} className="gap-2">
        <Truck className="h-5 w-5" />
        Nuovo Mezzo
      </Button>

      <FormModal
        open={open}
        onOpenChange={setOpen}
        title={
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Nuovo Mezzo
          </div>
        }
        footer={footer}
        size="lg"
      >
        <Form {...form}>
          <form id="mezzo-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Proprietà e Sede */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold">Proprietà e Sede</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Anagrafica Proprietaria</label>
                  <AnagraficaSelettore onSelectAnagrafica={(id) => handleAnagraficaSelect(id)} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sede Assegnata</label>
                  {idAnagraficaWatch ? (
                    <SedeSelettore
                      sedi={sediDisponibili}
                      onSelectSede={(sedeId) => form.setValue("id_sede_assegnata", sedeId)}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground border rounded-md px-3 py-2">
                      Seleziona prima un’anagrafica
                    </div>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Dati Mezzo - layout “furbo” */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold">Dati Mezzo</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* COLONNA SINISTRA: dati stabili */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="marca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modello"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modello</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="matricola"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matricola</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="id_interno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Interno</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="anno"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anno</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ore_moto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ore Motore</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="is_disponibile_noleggio"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 pt-1">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="m-0 text-sm cursor-pointer">Disponibile a Noleggio</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* COLONNA DESTRA: categoria + campi dinamici */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Constants.public.Enums.categoria_mezzo.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Placeholder campi categoria-specifici */}
                  <div className="rounded-md border p-3 text-sm text-muted-foreground">
                    {categoriaWatch ? (
                      <div>
                        Campi specifici per categoria: <span className="font-medium text-foreground">{categoriaWatch}</span>
                        <div className="mt-1">(placeholder: qui inseriremo i campi dinamici in base alla categoria)</div>
                      </div>
                    ) : (
                      <div>Seleziona una categoria per mostrare i campi specifici.</div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Stato funzionamento - full width (dato “speciale”) */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold">Stato di Funzionamento</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stato_funzionamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stato</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona stato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Constants.public.Enums.stato_funzionamento.map((stato) => (
                            <SelectItem key={stato} value={stato}>
                              {stato}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="stato_funzionamento_descrizione"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrizione</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            {/* Subnoleggio */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox checked={hasSubnoleggio} onCheckedChange={(v) => setHasSubnoleggio(!!v)} />
                <Label className="text-sm font-medium cursor-pointer">Mezzo in Subnoleggio</Label>
              </div>

              {hasSubnoleggio && (
                <div className="space-y-4 pl-4 border-l">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fornitore Subnoleggio</label>
                    <AnagraficaSelettore onSelectAnagrafica={(id) => form.setValue("id_fornitore_subnoleggio", id)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="data_inizio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Inizio</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="data_fine"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Fine</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                disabled={tempoIndeterminato}
                                value={tempoIndeterminato ? "" : (field.value ?? "")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tempo_indeterminato"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                            </FormControl>
                            <FormLabel className="m-0 text-sm cursor-pointer">Tempo indeterminato</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="costo_subnoleggio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Costo Subnoleggio (€)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="valore_residuo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valore Residuo (€)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contratto"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Contratto</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </section>
          </form>
        </Form>
      </FormModal>
    </>
  );
}
