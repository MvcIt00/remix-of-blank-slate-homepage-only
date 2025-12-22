import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Truck } from "lucide-react";
import { FormModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";
import { AnagraficaSelettore } from "@/components/selettori/anagrafica_selettore";
import { SedeSelettore } from "@/components/selettori/sede_selettore";
import { UbicazioneSelettore } from "@/components/selettori/ubicazione_selettore";

const mezzoSchema = z.object({
  id_anagrafica: z.string().optional(),
  id_sede_assegnata: z.string().optional(),
  id_sede_ubicazione: z.string().optional(),
  marca: z.string().optional(),
  modello: z.string().optional(),
  matricola: z.string().optional(),
  anno: z.string().optional(),
  id_interno: z.string().optional(),
  categoria: z.string().optional(),
  stato_funzionamento: z.string().optional(),
  stato_funzionamento_descrizione: z.string().optional(),
  ore_moto: z.string().optional(),
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

interface ModMezzoFormProps {
  mezzoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModMezzoForm({ mezzoId, onClose, onSuccess }: ModMezzoFormProps) {
  const [loading, setLoading] = useState(false);
  const [sediDisponibili, setSediDisponibili] = useState<any[]>([]);
  const [hasSubnoleggio, setHasSubnoleggio] = useState(false);
  const [subnoleggioId, setSubnoleggioId] = useState<string | null>(null);
  const [selectedAnagrafica, setSelectedAnagrafica] = useState<any>(null);

  const form = useForm<MezzoFormValues>({
    resolver: zodResolver(mezzoSchema),
    defaultValues: {
      id_anagrafica: "",
      id_sede_assegnata: "",
      id_sede_ubicazione: "",
      marca: "",
      modello: "",
      matricola: "",
      anno: "",
      id_interno: "",
      categoria: "",
      stato_funzionamento: "",
      stato_funzionamento_descrizione: "",
      ore_moto: "",
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

  useEffect(() => {
    loadMezzoData();
  }, [mezzoId]);

  async function loadMezzoData() {
    try {
      const { data: mezzoData, error: mezzoError } = await supabase
        .from("Mezzi")
        .select("*")
        .eq("id_mezzo", mezzoId)
        .single();
      if (mezzoError) throw mezzoError;

      const { data: subnoleggioData } = await supabase
        .from("Subnoleggi")
        .select("*")
        .eq("id_mezzo", mezzoId)
        .eq("is_cancellato", false)
        .maybeSingle();

      if (subnoleggioData) {
        setHasSubnoleggio(true);
        setSubnoleggioId(subnoleggioData.id_subnoleggio);
      }

      if (mezzoData.id_anagrafica) {
        await loadSedi(mezzoData.id_anagrafica);

        // Load anagrafica data
        const { data: anagraficaData } = await supabase
          .from("Anagrafiche")
          .select("*")
          .eq("id_anagrafica", mezzoData.id_anagrafica)
          .single();

        if (anagraficaData) {
          setSelectedAnagrafica(anagraficaData);
        }
      }

      form.reset({
        id_anagrafica: mezzoData.id_anagrafica || "",
        id_sede_assegnata: mezzoData.id_sede_assegnata || "",
        id_sede_ubicazione: mezzoData.id_sede_ubicazione || "",
        marca: mezzoData.marca || "",
        modello: mezzoData.modello || "",
        matricola: mezzoData.matricola || "",
        anno: mezzoData.anno || "",
        id_interno: mezzoData.id_interno || "",
        categoria: (mezzoData.categoria as any) || "",
        stato_funzionamento: (mezzoData.stato_funzionamento as any) || "",
        stato_funzionamento_descrizione: mezzoData.stato_funzionamento_descrizione || "",
        ore_moto: mezzoData.ore_moto?.toString() || "",
        is_disponibile_noleggio: mezzoData.is_disponibile_noleggio || false,
        id_fornitore_subnoleggio: subnoleggioData?.id_anagrafica || "",
        data_inizio: subnoleggioData?.data_inizio || "",
        data_fine: subnoleggioData?.data_fine || "",
        tempo_indeterminato: subnoleggioData?.tempo_indeterminato || false,
        costo_subnoleggio: subnoleggioData?.costo_subnoleggio?.toString() || "",
        valore_residuo: subnoleggioData?.valore_residuo?.toString() || "",
        contratto: subnoleggioData?.contratto || "",
      });
    } catch (error) {
      console.error("Error loading mezzo:", error);
      toast.error("Errore nel caricamento dei dati del mezzo");
    }
  }

  async function loadSedi(anagraficaId: string) {
    const { data: sedi } = await supabase
      .from("vw_sedi_per_anagrafica")
      .select("*")
      .eq("id_anagrafica", anagraficaId);
    setSediDisponibili(sedi || []);
  }

  async function handleAnagraficaSelect(anagraficaId: string, anagrafica: any) {
    setSelectedAnagrafica(anagrafica);
    form.setValue("id_anagrafica", anagraficaId);
    form.setValue("id_sede_assegnata", "");
    await loadSedi(anagraficaId);
  }

  async function onSubmit(values: MezzoFormValues) {
    try {
      setLoading(true);

      const { error: mezzoError } = await supabase
        .from("Mezzi")
        .update({
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
          id_sede_ubicazione: values.id_sede_ubicazione || null,
        })
        .eq("id_mezzo", mezzoId);
      if (mezzoError) throw mezzoError;

      if (hasSubnoleggio) {
        const subnoleggioData = {
          id_anagrafica: values.id_fornitore_subnoleggio!,
          data_inizio: values.data_inizio || null,
          data_fine: values.tempo_indeterminato ? null : values.data_fine || null,
          tempo_indeterminato: values.tempo_indeterminato,
          costo_subnoleggio: values.costo_subnoleggio ? parseFloat(values.costo_subnoleggio) : null,
          valore_residuo: values.valore_residuo ? parseFloat(values.valore_residuo) : null,
          contratto: values.contratto || null,
        };

        if (subnoleggioId) {
          const { error: subnoleggioError } = await supabase
            .from("Subnoleggi")
            .update(subnoleggioData)
            .eq("id_subnoleggio", subnoleggioId);
          if (subnoleggioError) throw subnoleggioError;
        } else {
          const { error: subnoleggioError } = await supabase
            .from("Subnoleggi")
            .insert({ ...subnoleggioData, id_mezzo: mezzoId });
          if (subnoleggioError) throw subnoleggioError;
        }
      } else if (subnoleggioId) {
        const { error: deleteError } = await supabase
          .from("Subnoleggi")
          .update({ is_cancellato: true })
          .eq("id_subnoleggio", subnoleggioId);
        if (deleteError) throw deleteError;
      }

      toast.success("Mezzo aggiornato con successo");
      onSuccess();
    } catch (error) {
      console.error("Error updating mezzo:", error);
      toast.error("Errore nell'aggiornamento del mezzo");
    } finally {
      setLoading(false);
    }
  }


  /* =======================
     Footer Buttons
  ======================= */
  const footer = (
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="outline" onClick={onClose}>
        Annulla
      </Button>
      <Button type="submit" form="mod-mezzo-form" disabled={loading}>
        {loading ? "Salvataggio..." : "Salva Modifiche"}
      </Button>
    </div>
  );

  return (
    <FormModal
      open={true}
      onOpenChange={(open) => !open && onClose()}
      title={
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Modifica Mezzo
        </div>
      }
      footer={footer}
      size="xl"
    >
      <Form {...form}>
        <form id="mod-mezzo-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dati Base Mezzo */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Dati Base Mezzo</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="stato_funzionamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato Funzionamento</FormLabel>
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
              name="stato_funzionamento_descrizione"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione Stato</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_disponibile_noleggio"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Disponibile a Noleggio</FormLabel>
                </FormItem>
              )}
            />
          </section>

          {/* Proprietà e Sede */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Proprietà e Sede</h3>

            <div>
              <Label>Anagrafica Proprietaria</Label>
              <AnagraficaSelettore
                onSelectAnagrafica={handleAnagraficaSelect}
                defaultValue={form.watch("id_anagrafica")}
              />
            </div>

            {sediDisponibili.length > 0 && (
              <div>
                <Label>Sede Assegnata</Label>
                <SedeSelettore
                  sedi={sediDisponibili}
                  onSelectSede={(sedeId) => form.setValue("id_sede_assegnata", sedeId)}
                  value={form.watch("id_sede_assegnata")}
                />
              </div>
            )}

            <div>
              <Label>Ubicazione</Label>
              <UbicazioneSelettore
                onSelectSede={(sedeId) => form.setValue("id_sede_ubicazione", sedeId)}
                value={form.watch("id_sede_ubicazione")}
                disabled={true}
              />
              <p className="text-xs text-muted-foreground mt-1">
                L'ubicazione può essere modificata solo tramite procedura di trasporto.
              </p>
            </div>
          </section>

          {/* Subnoleggio */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasSubnoleggio"
                checked={hasSubnoleggio}
                onCheckedChange={(checked) => setHasSubnoleggio(checked as boolean)}
              />
              <Label htmlFor="hasSubnoleggio" className="text-lg font-semibold cursor-pointer">
                Mezzo in Subnoleggio
              </Label>
            </div>

            {hasSubnoleggio && (
              <div className="space-y-4 pl-6 border-l-2">
                <div>
                  <Label>Fornitore Subnoleggio</Label>
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

                  <FormField
                    control={form.control}
                    name="tempo_indeterminato"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0 md:pt-8">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Tempo Indeterminato</FormLabel>
                      </FormItem>
                    )}
                  />

                  {!form.watch("tempo_indeterminato") && (
                    <FormField
                      control={form.control}
                      name="data_fine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Fine</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

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
  );

}
