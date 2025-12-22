import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, FileSignature, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AnagraficaSelettore } from "@/components/selettori/anagrafica_selettore";
import { SedeSelettore } from "@/components/selettori/sede_selettore";
import { useOwnerData } from "@/hooks/useOwnerData";
import { ContrattoPreviewDialog } from "@/components/contratti";

/* =======================
   Schema
======================= */
const noleggioSchema = z.object({
  id_anagrafica: z.string().min(1, "Seleziona un cliente"),
  sede_operativa: z.string().optional(),
  data_inizio: z.string().optional(),
  data_fine: z.string().optional(),
  tempo_indeterminato: z.boolean().default(false),
  prezzo_noleggio: z.number().optional(),
  prezzo_trasporto: z.number().optional(),
  tipo_canone: z.enum(["giornaliero", "mensile"]).optional(),
  note: z.string().optional(),
});

type NoleggioFormValues = z.infer<typeof noleggioSchema>;

/* =======================
   Types
======================= */
interface MezzoData {
  id_mezzo: string;
  marca: string | null;
  modello: string | null;
  matricola: string | null;
  id_interno: string | null;
  id_anagrafica: string | null;
  Anagrafiche: {
    ragione_sociale: string | null;
    partita_iva: string | null;
  } | null;
}

interface NuovoNoleggioFormProps {
  mezzo: MezzoData;
  onClose: () => void;
  onSuccess: () => void;
}

interface NoleggioData {
  id_noleggio: string;
  id_mezzo: string;
  id_anagrafica: string;
  sede_operativa: string | null;
  data_inizio: string | null;
  data_fine: string | null;
  tempo_indeterminato: boolean | null;
  prezzo_noleggio: number | null;
  prezzo_trasporto: number | null;
  tipo_canone: "giornaliero" | "mensile" | null;
  is_terminato: boolean;
  note: string | null;
  Mezzi: {
    marca: string | null;
    modello: string | null;
    matricola: string | null;
  } | null;
  Anagrafiche: {
    ragione_sociale: string | null;
  } | null;
  Sedi: {
    nome_sede: string | null;
    indirizzo: string | null;
    citta: string | null;
  } | null;
}

interface ModificaNoleggioFormProps {
  noleggio: NoleggioData;
  onClose: () => void;
  onSuccess: () => void;
}

/* =======================
   Component
======================= */
function NoleggioFormInternal({ mezzo, onClose, onSuccess }: NuovoNoleggioFormProps) {
  const [sediDisponibili, setSediDisponibili] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [showContrattoPreview, setShowContrattoPreview] = useState(false);
  const [clienteData, setClienteData] = useState<any>(null);
  const [previewPayload, setPreviewPayload] = useState<{
    datiMezzo: any;
    noleggioData: any;
  } | null>(null);

  const { ownerData, loading: loadingOwner } = useOwnerData();

  const form = useForm<NoleggioFormValues>({
    resolver: zodResolver(noleggioSchema),
    defaultValues: {
      tempo_indeterminato: false,
      tipo_canone: "mensile",
    },
  });

  const tempoIndeterminato = form.watch("tempo_indeterminato");
  const idAnagraficaWatch = form.watch("id_anagrafica");

  /* =======================
     Riassunto mezzo (compatto)
  ======================= */
  const mezzoSummary = useMemo(() => {
    const mezzoLabel = `${mezzo.marca ?? "-"} ${mezzo.modello ?? ""}`.trim();
    const matricola = mezzo.matricola ? `Matricola: ${mezzo.matricola}` : "Matricola: -";
    const idInterno = mezzo.id_interno ? `ID: ${mezzo.id_interno}` : "ID: -";
    const proprietario = mezzo.Anagrafiche?.ragione_sociale
      ? `Proprietario: ${mezzo.Anagrafiche.ragione_sociale}`
      : "Proprietario: -";
    const piva = mezzo.Anagrafiche?.partita_iva ? `P.IVA: ${mezzo.Anagrafiche.partita_iva}` : "P.IVA: -";

    return {
      mezzoLabel,
      riga1: `${matricola} • ${idInterno} • ${proprietario}`,
      riga2: piva,
    };
  }, [mezzo]);

  /* =======================
     Load sedi + cliente data
     + RESET sede quando cambia cliente (obbligatorio)
======================= */
  useEffect(() => {
    // ogni cambio cliente: chiudi preview e azzera payload (evita contratto "sporco" con cliente vecchio)
    setShowContrattoPreview(false);
    setPreviewPayload(null);

    if (idAnagraficaWatch) {
      // RESET sede SEMPRE, perché dipende dal cliente
      form.setValue("sede_operativa", undefined, { shouldDirty: true, shouldValidate: true });

      loadSedi(idAnagraficaWatch);
      loadClienteData(idAnagraficaWatch);
    } else {
      setSediDisponibili([]);
      setClienteData(null);
      form.setValue("sede_operativa", undefined, { shouldDirty: true, shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAnagraficaWatch]);

  async function loadSedi(anagraficaId: string) {
    const { data, error } = await supabase
      .from("Sedi")
      .select("*")
      .eq("id_anagrafica", anagraficaId)
      .eq("is_cancellato", false);

    if (!error && data) setSediDisponibili(data);
  }

  async function loadClienteData(anagraficaId: string) {
    const [clienteRes, datiAmmRes, sedeRes, contattoRes] = await Promise.all([
      supabase.from("Anagrafiche").select("*").eq("id_anagrafica", anagraficaId).single(),
      supabase.from("an_dati_amministrativi").select("*").eq("id_anagrafica", anagraficaId).single(),
      supabase.from("Sedi").select("*").eq("id_anagrafica", anagraficaId).eq("is_legale", true).single(),
      supabase.from("an_contatti").select("*").eq("id_anagrafica", anagraficaId).eq("is_aziendale", true).single(),
    ]);

    setClienteData({
      ragione_sociale: clienteRes.data?.ragione_sociale || "",
      partita_iva: clienteRes.data?.partita_iva,
      indirizzo: sedeRes.data?.indirizzo,
      citta: sedeRes.data?.citta,
      cap: sedeRes.data?.cap?.toString(),
      provincia: sedeRes.data?.provincia,
      telefono: contattoRes.data?.telefono,
      email: contattoRes.data?.email,
      pec: datiAmmRes.data?.pec,
      codice_univoco: datiAmmRes.data?.codice_univoco,
    });
  }

  // Firma reale del tuo componente: (id, anagrafica). Qui usiamo solo id.
  function handleAnagraficaSelect(id: string) {
    form.setValue("id_anagrafica", id, { shouldDirty: true, shouldValidate: true });
  }

  /* =======================
     Submit (solo noleggio)
  ======================= */
  async function onSubmit(values: NoleggioFormValues) {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("Noleggi").insert({
        id_mezzo: mezzo.id_mezzo,
        id_anagrafica: values.id_anagrafica,
        sede_operativa: values.sede_operativa,
        data_inizio: values.data_inizio,
        data_fine: values.tempo_indeterminato ? null : values.data_fine,
        tempo_indeterminato: values.tempo_indeterminato,
        prezzo_noleggio: values.prezzo_noleggio,
        prezzo_trasporto: values.prezzo_trasporto,
        tipo_canone: values.tipo_canone,
        note: values.note,
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Noleggio registrato con successo",
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating noleggio:", error);
      toast({
        title: "Errore",
        description: "Errore nella registrazione del noleggio",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  /* =======================
     Apri anteprima contratto
  ======================= */
  const handleOpenContrattoPreview = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Attenzione",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }
    if (!ownerData) {
      toast({
        title: "Errore",
        description: "Dati azienda non disponibili",
        variant: "destructive",
      });
      return;
    }
    if (!clienteData) {
      toast({
        title: "Errore",
        description: "Seleziona un cliente",
        variant: "destructive",
      });
      return;
    }

    const formValues = form.getValues();

    const datiMezzo = {
      marca: mezzo.marca,
      modello: mezzo.modello,
      matricola: mezzo.matricola,
      id_interno: mezzo.id_interno,
      anno: null,
      categoria: null,
      ore_moto: null,
    };

    const noleggioData = {
      id_mezzo: mezzo.id_mezzo,
      id_anagrafica: formValues.id_anagrafica,
      id_anagrafica_fornitore: mezzo.id_anagrafica,
      sede_operativa: formValues.sede_operativa,
      data_inizio: formValues.data_inizio,
      data_fine: formValues.data_fine,
      tempo_indeterminato: formValues.tempo_indeterminato,
      prezzo_noleggio: formValues.prezzo_noleggio,
      prezzo_trasporto: formValues.prezzo_trasporto,
      tipo_canone: formValues.tipo_canone,
      note: formValues.note,
    };

    setPreviewPayload({ datiMezzo, noleggioData });
    setShowContrattoPreview(true);
  };

  return (
    <>
      <Card className="w-full bg-card max-h-[90vh] flex flex-col overflow-hidden border-0 shadow-none">
        {/* Header + riassunto */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xl font-bold leading-tight">Nuovo Noleggio</h2>
              <p className="text-sm text-muted-foreground truncate">{mezzoSummary.mezzoLabel}</p>
            </div>
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            <div className="truncate">{mezzoSummary.riga1}</div>
            <div className="truncate">{mezzoSummary.riga2}</div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <Form {...form}>
              <form className="space-y-6 pb-6">
                {/* Cliente + Sede */}
                <section className="space-y-3">
                  <h3 className="text-base font-semibold">Cliente</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Cliente</label>
                      <AnagraficaSelettore onSelectAnagrafica={(id) => handleAnagraficaSelect(id)} />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Sede Operativa</label>
                      {idAnagraficaWatch ? (
                        <SedeSelettore
                          sedi={sediDisponibili}
                          onSelectSede={(id) =>
                            form.setValue("sede_operativa", id, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground border rounded-md px-3 py-2">
                          Seleziona prima un cliente
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Date */}
                <section className="space-y-3">
                  <h3 className="text-base font-semibold">Date</h3>

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
                  </div>
                </section>

                <Separator />

                {/* Prezzi */}
                <section className="space-y-3">
                  <h3 className="text-base font-semibold">Prezzi</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="tipo_canone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Canone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="giornaliero">Giornaliero</SelectItem>
                              <SelectItem value="mensile">Mensile</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prezzo_noleggio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canone (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prezzo_trasporto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trasporto (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator />

                {/* Note */}
                <section className="space-y-3">
                  <h3 className="text-base font-semibold">Note</h3>

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="Note aggiuntive..." className="resize-none" rows={3} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </section>
              </form>
            </Form>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>

          <Button variant="outline" onClick={handleOpenContrattoPreview} disabled={loadingOwner || !idAnagraficaWatch}>
            <FileSignature className="h-4 w-4 mr-2" />
            Genera Contratto
          </Button>

          <Button onClick={form.handleSubmit(onSubmit)} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Registra Noleggio
          </Button>
        </div>
      </Card>

      {ownerData && clienteData && previewPayload && (
        <ContrattoPreviewDialog
          open={showContrattoPreview}
          onOpenChange={setShowContrattoPreview}
          datiOwner={ownerData}
          datiCliente={clienteData}
          datiMezzo={previewPayload.datiMezzo}
          noleggioData={previewPayload.noleggioData}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}

// Esporta NuovoNoleggioForm
export const NuovoNoleggioForm = NoleggioFormInternal;

/* =======================
   ModificaNoleggioForm - Per modificare noleggi esistenti
======================= */
export function ModificaNoleggioForm({ noleggio, onClose, onSuccess }: ModificaNoleggioFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<NoleggioFormValues>({
    resolver: zodResolver(noleggioSchema),
    defaultValues: {
      id_anagrafica: noleggio.id_anagrafica,
      sede_operativa: noleggio.sede_operativa || undefined,
      data_inizio: noleggio.data_inizio || undefined,
      data_fine: noleggio.data_fine || undefined,
      tempo_indeterminato: noleggio.tempo_indeterminato || false,
      prezzo_noleggio: noleggio.prezzo_noleggio || undefined,
      prezzo_trasporto: noleggio.prezzo_trasporto || undefined,
      tipo_canone: noleggio.tipo_canone || "mensile",
      note: noleggio.note || undefined,
    },
  });

  const tempoIndeterminato = form.watch("tempo_indeterminato");

  const mezzoLabel = noleggio.Mezzi 
    ? `${noleggio.Mezzi.marca ?? "-"} ${noleggio.Mezzi.modello ?? ""}`.trim()
    : "Mezzo";

  async function onSubmit(values: NoleggioFormValues) {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("Noleggi")
        .update({
          sede_operativa: values.sede_operativa,
          data_inizio: values.data_inizio,
          data_fine: values.tempo_indeterminato ? null : values.data_fine,
          tempo_indeterminato: values.tempo_indeterminato,
          prezzo_noleggio: values.prezzo_noleggio,
          prezzo_trasporto: values.prezzo_trasporto,
          tipo_canone: values.tipo_canone,
          note: values.note,
        })
        .eq("id_noleggio", noleggio.id_noleggio);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Noleggio aggiornato con successo",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating noleggio:", error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento del noleggio",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full bg-card max-h-[90vh] flex flex-col overflow-hidden border-0 shadow-none">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-tight">Modifica Noleggio</h2>
            <p className="text-sm text-muted-foreground truncate">{mezzoLabel}</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <div className="truncate">Cliente: {noleggio.Anagrafiche?.ragione_sociale ?? "-"}</div>
          {noleggio.Mezzi?.matricola && <div className="truncate">Matricola: {noleggio.Mezzi.matricola}</div>}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <Form {...form}>
            <form className="space-y-6 pb-6">
              {/* Date */}
              <section className="space-y-3">
                <h3 className="text-base font-semibold">Date</h3>

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
                </div>
              </section>

              <Separator />

              {/* Prezzi */}
              <section className="space-y-3">
                <h3 className="text-base font-semibold">Prezzi</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo_canone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Canone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="giornaliero">Giornaliero</SelectItem>
                            <SelectItem value="mensile">Mensile</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prezzo_noleggio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canone (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prezzo_trasporto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trasporto (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              {/* Note */}
              <section className="space-y-3">
                <h3 className="text-base font-semibold">Note</h3>

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Note aggiuntive..." className="resize-none" rows={3} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </section>
            </form>
          </Form>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Annulla
        </Button>

        <Button onClick={form.handleSubmit(onSubmit)} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Salva Modifiche
        </Button>
      </div>
    </Card>
  );
}
