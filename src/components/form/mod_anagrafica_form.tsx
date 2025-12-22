import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Building2, MapPin, FileText, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SedeFields } from "./sede_fields";
import { SedeForm } from "./sede_form";
import { ContattoForm, type ContattoFormValues } from "./contatto_form";

const sedeSchema = z.object({
  nome_sede: z.string().min(1, "Nome sede richiesto"),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
  provincia: z.string().optional(),
  cap: z.string().optional(),
  is_legale: z.boolean().default(false),
  is_operativa: z.boolean().default(false),
  is_nave: z.boolean().default(false),
  is_banchina: z.boolean().default(false),
  is_officina: z.boolean().default(false),
});

const anagraficaSchema = z.object({
  ragione_sociale: z.string().min(1, "Ragione sociale richiesta"),
  partita_iva: z.string().optional(),
  prezzo_manodopera: z.number().optional(),
  is_cliente: z.boolean().default(false),
  is_fornitore: z.boolean().default(false),
  is_owner: z.boolean().default(false),
  // Prima sede obbligatoria
  prima_sede: sedeSchema,
  // Tipi fornitore
  frn_mezzi: z.boolean().default(false),
  frn_ricambi: z.boolean().default(false),
  frn_servizi: z.boolean().default(false),
  frn_trasporti: z.boolean().default(false),
  sconto: z.number().optional(),
  tariffa_oraria: z.number().optional(),
  // Dati amministrativi
  pec: z.string().optional(),
  codice_univoco: z.string().optional(),
  iban: z.string().optional(),
  pagamento: z.string().optional(),
  partita_iva_estera: z.string().optional(),
  esente_iva: z.boolean().default(false),
});

type AnagraficaFormValues = z.infer<typeof anagraficaSchema>;

interface ModAnagraficaFormProps {
  anagraficaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModAnagraficaForm({ anagraficaId, onClose, onSuccess }: ModAnagraficaFormProps) {
  const [sediAggiuntive, setSediAggiuntive] = useState<any[]>([]);
  const [contatti, setContatti] = useState<ContattoFormValues[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaSedeId, setPrimaSedeId] = useState<string | null>(null);
  const [sediOriginaliIds, setSediOriginaliIds] = useState<string[]>([]);

  const form = useForm<AnagraficaFormValues>({
    resolver: zodResolver(anagraficaSchema),
    defaultValues: {
      ragione_sociale: "",
      partita_iva: "",
      is_cliente: false,
      is_fornitore: false,
      is_owner: false,
      prima_sede: {
        nome_sede: "",
        indirizzo: "",
        citta: "",
        provincia: "",
        cap: "",
        is_legale: true,
        is_operativa: false,
        is_nave: false,
        is_banchina: false,
        is_officina: false,
      },
      frn_mezzi: false,
      frn_ricambi: false,
      frn_servizi: false,
      frn_trasporti: false,
      esente_iva: false,
    },
  });

  const isFornitore = form.watch("is_fornitore");
  const isCliente = form.watch("is_cliente");
  const frnRicambi = form.watch("frn_ricambi");
  const frnServizi = form.watch("frn_servizi");

  useEffect(() => {
    loadAnagraficaData();
  }, [anagraficaId]);

  async function loadAnagraficaData() {
    try {
      setLoading(true);

      // Load anagrafica base
      const { data: anagraficaData, error: anagraficaError } = await supabase
        .from("Anagrafiche")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .single();

      if (anagraficaError) throw anagraficaError;

      // Load dati amministrativi
      const { data: datiAmm } = await supabase
        .from("an_dati_amministrativi")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .maybeSingle();

      // Load sedi
      const { data: sediData } = await supabase
        .from("Sedi")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .eq("is_cancellato", false);

      // Separa prima sede da sedi aggiuntive e salva gli ID originali
      const primaSede = sediData && sediData.length > 0 ? sediData[0] : null;
      const altreSedi = sediData && sediData.length > 1 ? sediData.slice(1) : [];
      
      // Salva gli ID originali delle sedi per poterli aggiornare invece di eliminarli
      if (primaSede) {
        setPrimaSedeId(primaSede.id_sede);
      }
      setSediOriginaliIds(altreSedi.map((s: any) => s.id_sede));
      setSediAggiuntive(altreSedi);

      // Load contatti
      const { data: contattiData } = await supabase
        .from("an_contatti")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .eq("is_cancellato", false);

      setContatti(contattiData || []);

      // Load tipi fornitore
      let tipiFornitore: any = {
        mezzi: false,
        ricambi: false,
        servizi: false,
        trasporti: false,
        sconto: undefined,
        tariffa_oraria: undefined,
      };

      if (anagraficaData.is_fornitore) {
        const [mezzi, ricambi, servizi, trasporti] = await Promise.all([
          supabase.from("frn_mezzi").select("*").eq("id_anagrafica", anagraficaId).maybeSingle(),
          supabase.from("frn_ricambi").select("*").eq("id_anagrafica", anagraficaId).maybeSingle(),
          supabase.from("frn_servizi").select("*").eq("id_anagrafica", anagraficaId).maybeSingle(),
          supabase.from("frn_trasporti").select("*").eq("id_anagrafica", anagraficaId).maybeSingle(),
        ]);

        tipiFornitore = {
          mezzi: !!mezzi.data,
          ricambi: !!ricambi.data,
          servizi: !!servizi.data,
          trasporti: !!trasporti.data,
          sconto: ricambi.data?.sconto || undefined,
          tariffa_oraria: servizi.data?.tariffa_oraria || undefined,
        };
      }

      // Set form values
      form.reset({
        ragione_sociale: anagraficaData.ragione_sociale,
        partita_iva: anagraficaData.partita_iva || "",
        is_cliente: anagraficaData.is_cliente || false,
        is_fornitore: anagraficaData.is_fornitore || false,
        is_owner: anagraficaData.is_owner || false,
        prima_sede: primaSede ? {
          nome_sede: primaSede.nome_sede || "",
          indirizzo: primaSede.indirizzo || "",
          citta: primaSede.citta || "",
          provincia: primaSede.provincia || "",
          cap: primaSede.cap?.toString() || "",
          is_legale: primaSede.is_legale || true,
          is_operativa: primaSede.is_operativa || false,
          is_nave: primaSede.is_nave || false,
          is_banchina: primaSede.is_banchina || false,
          is_officina: primaSede.is_officina || false,
        } : {
          nome_sede: "",
          indirizzo: "",
          citta: "",
          provincia: "",
          cap: "",
          is_legale: true,
          is_operativa: false,
          is_nave: false,
          is_banchina: false,
          is_officina: false,
        },
        frn_mezzi: tipiFornitore.mezzi,
        frn_ricambi: tipiFornitore.ricambi,
        frn_servizi: tipiFornitore.servizi,
        frn_trasporti: tipiFornitore.trasporti,
        sconto: tipiFornitore.sconto,
        tariffa_oraria: tipiFornitore.tariffa_oraria,
        pec: datiAmm?.pec || "",
        codice_univoco: datiAmm?.codice_univoco || "",
        iban: datiAmm?.iban || "",
        pagamento: datiAmm?.pagamento || "",
        partita_iva_estera: datiAmm?.partita_iva_estera || "",
        esente_iva: datiAmm?.esente_iva || false,
        prezzo_manodopera: datiAmm?.prezzo_manodopera || undefined,
      });

    } catch (error) {
      console.error("Error loading anagrafica:", error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei dati",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: AnagraficaFormValues) {
    try {
      // Update anagrafica
      const { error: anagraficaError } = await supabase
        .from("Anagrafiche")
        .update({
          ragione_sociale: values.ragione_sociale,
          partita_iva: values.partita_iva,
          is_cliente: values.is_cliente,
          is_fornitore: values.is_fornitore,
          is_owner: values.is_owner,
        })
        .eq("id_anagrafica", anagraficaId);

      if (anagraficaError) throw anagraficaError;

      // Update or insert dati amministrativi
      const { error: amministrativiError } = await supabase
        .from("an_dati_amministrativi")
        .upsert({
          id_anagrafica: anagraficaId,
          pec: values.pec,
          codice_univoco: values.codice_univoco,
          iban: values.iban,
          pagamento: values.pagamento,
          partita_iva_estera: values.partita_iva_estera,
          esente_iva: values.esente_iva,
          prezzo_manodopera: values.prezzo_manodopera,
        });

      if (amministrativiError) throw amministrativiError;

      // Update sedi - PRESERVA gli ID esistenti per non rompere i riferimenti FK
      // Aggiorna la prima sede se esiste, altrimenti la crea
      if (primaSedeId) {
        const { error: primaSedeError } = await supabase
          .from("Sedi")
          .update({
            nome_sede: values.prima_sede.nome_sede,
            indirizzo: values.prima_sede.indirizzo,
            citta: values.prima_sede.citta,
            provincia: values.prima_sede.provincia,
            cap: values.prima_sede.cap ? parseInt(values.prima_sede.cap) : null,
            is_legale: values.prima_sede.is_legale,
            is_operativa: values.prima_sede.is_operativa,
            is_nave: values.prima_sede.is_nave,
            is_banchina: values.prima_sede.is_banchina,
            is_officina: values.prima_sede.is_officina,
          })
          .eq("id_sede", primaSedeId);
        
        if (primaSedeError) throw primaSedeError;
      } else {
        // Crea nuova prima sede solo se non esisteva
        const { error: newSedeError } = await supabase
          .from("Sedi")
          .insert([{
            nome_sede: values.prima_sede.nome_sede,
            indirizzo: values.prima_sede.indirizzo,
            citta: values.prima_sede.citta,
            provincia: values.prima_sede.provincia,
            cap: values.prima_sede.cap ? parseInt(values.prima_sede.cap) : null,
            is_legale: values.prima_sede.is_legale,
            is_operativa: values.prima_sede.is_operativa,
            is_nave: values.prima_sede.is_nave,
            is_banchina: values.prima_sede.is_banchina,
            is_officina: values.prima_sede.is_officina,
            id_anagrafica: anagraficaId,
          }]);
        if (newSedeError) throw newSedeError;
      }

      // Per le sedi aggiuntive: aggiorna quelle esistenti, inserisci le nuove, elimina le rimosse
      const sediAggiuntiveConId = sediAggiuntive.filter((s: any) => s.id_sede);
      const sediAggiuntiveNuove = sediAggiuntive.filter((s: any) => !s.id_sede);
      const sediIdDaMantenere = sediAggiuntiveConId.map((s: any) => s.id_sede);
      
      // Elimina solo le sedi aggiuntive che sono state rimosse dall'utente
      const sediDaEliminare = sediOriginaliIds.filter(id => !sediIdDaMantenere.includes(id));
      if (sediDaEliminare.length > 0) {
        await supabase
          .from("Sedi")
          .update({ is_cancellato: true })
          .in("id_sede", sediDaEliminare);
      }

      // Aggiorna le sedi aggiuntive esistenti
      for (const sede of sediAggiuntiveConId) {
        await supabase
          .from("Sedi")
          .update({
            nome_sede: sede.nome_sede,
            indirizzo: sede.indirizzo,
            citta: sede.citta,
            provincia: sede.provincia,
            cap: sede.cap,
            is_legale: sede.is_legale,
            is_operativa: sede.is_operativa,
            is_nave: sede.is_nave,
            is_banchina: sede.is_banchina,
            is_officina: sede.is_officina,
          })
          .eq("id_sede", sede.id_sede);
      }

      // Inserisci le nuove sedi aggiuntive
      if (sediAggiuntiveNuove.length > 0) {
        await supabase
          .from("Sedi")
          .insert(sediAggiuntiveNuove.map((sede: any) => ({
            nome_sede: sede.nome_sede,
            indirizzo: sede.indirizzo,
            citta: sede.citta,
            provincia: sede.provincia,
            cap: sede.cap,
            is_legale: sede.is_legale,
            is_operativa: sede.is_operativa,
            is_nave: sede.is_nave,
            is_banchina: sede.is_banchina,
            is_officina: sede.is_officina,
            id_anagrafica: anagraficaId,
          })));
      }

      // Update contatti (delete old, insert new)
      await supabase.from("an_contatti").delete().eq("id_anagrafica", anagraficaId);
      
      if (contatti.length > 0) {
        const contattiWithAnagrafica = contatti.map(contatto => ({
          ...contatto,
          id_anagrafica: anagraficaId,
        }));

        await supabase.from("an_contatti").insert(contattiWithAnagrafica);
      }

      // Update fornitore data
      await supabase.from("frn_mezzi").delete().eq("id_anagrafica", anagraficaId);
      await supabase.from("frn_ricambi").delete().eq("id_anagrafica", anagraficaId);
      await supabase.from("frn_servizi").delete().eq("id_anagrafica", anagraficaId);
      await supabase.from("frn_trasporti").delete().eq("id_anagrafica", anagraficaId);

      if (values.is_fornitore) {
        if (values.frn_mezzi) {
          await supabase.from("frn_mezzi").insert({ id_anagrafica: anagraficaId });
        }
        if (values.frn_ricambi) {
          await supabase.from("frn_ricambi").insert({
            id_anagrafica: anagraficaId,
            sconto: values.sconto,
          });
        }
        if (values.frn_servizi) {
          await supabase.from("frn_servizi").insert({
            id_anagrafica: anagraficaId,
            tariffa_oraria: values.tariffa_oraria,
          });
        }
        if (values.frn_trasporti) {
          await supabase.from("frn_trasporti").insert({ id_anagrafica: anagraficaId });
        }
      }

      toast({
        title: "Successo",
        description: "Anagrafica aggiornata con successo",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating anagrafica:", error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dell'anagrafica",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl bg-card max-h-[90vh] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Modifica Anagrafica</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-6">
            {/* Dati Anagrafica */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Dati Anagrafica</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ragione_sociale"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Ragione Sociale *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome azienda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="partita_iva"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partita IVA</FormLabel>
                      <FormControl>
                        <Input placeholder="IT00000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isCliente && (
                  <FormField
                    control={form.control}
                    name="prezzo_manodopera"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prezzo Manodopera (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex gap-6">
                <FormField
                  control={form.control}
                  name="is_cliente"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Cliente</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_fornitore"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Fornitore</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_owner"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Owner</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Dati Fornitore */}
            {isFornitore && (
              <>
                <Separator />
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">Tipologie Fornitore</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="frn_mezzi"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Mezzi</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frn_ricambi"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Ricambi</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frn_servizi"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Servizi</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frn_trasporti"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Trasporti</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {frnRicambi && (
                    <FormField
                      control={form.control}
                      name="sconto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sconto (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {frnServizi && (
                    <FormField
                      control={form.control}
                      name="tariffa_oraria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tariffa Oraria (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </section>
              </>
            )}

            <Separator />

            {/* Sedi */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Sedi</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Prima Sede (Obbligatoria)</h4>
                  <SedeFields 
                    form={form}
                    namePrefix="prima_sede"
                    isPrimaSede={true}
                  />
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Sedi Aggiuntive</h4>
                  <SedeForm 
                    onAddSede={(sede) => setSediAggiuntive([...sediAggiuntive, sede])} 
                    isPrimaSede={false}
                  />
                </div>

                {sediAggiuntive.length > 0 && (
                  <div className="space-y-2">
                    {sediAggiuntive.map((sede, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-muted/50 flex items-start justify-between">
                        <div>
                          <p className="font-medium">{sede.nome_sede}</p>
                          <p className="text-sm text-muted-foreground">
                            {sede.indirizzo}, {sede.citta} ({sede.provincia})
                          </p>
                          <div className="flex gap-2 mt-2">
                            {sede.is_legale && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Sede Legale</span>
                            )}
                            {sede.is_operativa && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Operativa</span>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSediAggiuntive(sediAggiuntive.filter((_, i) => i !== index))}
                        >
                          Rimuovi
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Contatti */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Contatti</h3>
              </div>

              <ContattoForm onAddContatto={(contatto) => setContatti([...contatti, contatto])} />

              {contatti.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">Contatti aggiunti:</p>
                  {contatti.map((contatto, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/50">
                      <p className="font-medium">{contatto.nome}</p>
                      {contatto.email && <p className="text-sm text-muted-foreground">{contatto.email}</p>}
                      {contatto.telefono && <p className="text-sm text-muted-foreground">{contatto.telefono}</p>}
                      <div className="flex gap-2 mt-2">
                        {contatto.is_aziendale && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Aziendale</span>
                        )}
                        {contatto.is_referente && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Referente</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Separator />

            {/* Dati Amministrativi */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Dati Amministrativi</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pec"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PEC</FormLabel>
                      <FormControl>
                        <Input placeholder="pec@esempio.it" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="codice_univoco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Codice Univoco</FormLabel>
                      <FormControl>
                        <Input placeholder="0000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl>
                        <Input placeholder="IT00X0000000000000000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalità di Pagamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Bonifico bancario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="partita_iva_estera"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partita IVA Estera</FormLabel>
                      <FormControl>
                        <Input placeholder="ES00000000X" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="esente_iva"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 pt-8">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Esente IVA</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button type="submit">
                Salva Modifiche
              </Button>
            </div>
          </form>
        </Form>
        </div>
      </ScrollArea>
    </Card>
  );
}