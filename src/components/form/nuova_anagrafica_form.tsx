import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/ui/responsive-modal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Plus, Building2, MapPin, Users, FileText, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/* =======================
   Schema (solo campi UI)
   Nota: cap è string nel form, poi convertiamo a number in insert.
======================= */
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

  // prima sede “principale”
  prima_sede: sedeSchema,

  // tipologie fornitore
  frn_mezzi: z.boolean().default(false),
  frn_ricambi: z.boolean().default(false),
  frn_servizi: z.boolean().default(false),
  frn_trasporti: z.boolean().default(false),

  // dati specifici fornitori
  sconto: z.number().optional(),
  tariffa_oraria: z.number().optional(),

  // amministrativi
  pec: z.string().optional(),
  codice_univoco: z.string().optional(),
  iban: z.string().optional(),
  pagamento: z.enum([
    "bonifico_anticipato",
    "bonifico_30gg",
    "bonifico_60gg",
    "bonifico_90gg",
    "riba_30gg",
    "riba_60gg",
    "riba_90gg",
    "rimessa_diretta",
    "contrassegno"
  ]).optional(),
  partita_iva_estera: z.string().optional(),
  esente_iva: z.boolean().default(false),
});

type AnagraficaFormValues = z.infer<typeof anagraficaSchema>;

/* =======================
   Tipi “array-driven” sedi/contatti
======================= */

type SedeTipo = "operativa" | "nave" | "banchina" | "officina";

type SedeSecondariaUI = {
  id: string; // id client-side per update/remove
  tipo: SedeTipo;

  nome_sede: string;
  indirizzo?: string;
  citta?: string;
  provincia?: string;
  cap?: string; // string in UI

  is_legale: false;
  is_operativa: boolean;
  is_nave: boolean;
  is_banchina: boolean;
  is_officina: boolean;
};

type ContattoRuolo = "nessuno" | "referente" | "aziendale";

type ContattoUI = {
  id: string;
  nome: string;
  email: string;
  telefono: string;
  ruolo: ContattoRuolo;
};

/* =======================
   Helpers
======================= */
function newId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toCapNumber(cap?: string): number | null {
  const t = (cap ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function sedeFlagsByTipo(tipo: SedeTipo) {
  return {
    is_legale: false as const,
    is_operativa: true,
    is_nave: tipo === "nave",
    is_banchina: tipo === "banchina",
    is_officina: tipo === "officina",
  };
}

function defaultNomeByTipo(tipo: SedeTipo) {
  switch (tipo) {
    case "operativa":
      return "Operativa";
    case "nave":
      return "Nave";
    case "banchina":
      return "Banchina";
    case "officina":
      return "Officina";
  }
}

function contattoLabel(ruolo: ContattoRuolo) {
  if (ruolo === "aziendale") return "Aziendale";
  if (ruolo === "referente") return "Referente";
  return "—";
}

const PAYMENT_METHODS = [
  { value: "bonifico_anticipato", label: "Bonifico Anticipato" },
  { value: "bonifico_30gg", label: "Bonifico 30gg" },
  { value: "bonifico_60gg", label: "Bonifico 60gg" },
  { value: "bonifico_90gg", label: "Bonifico 90gg" },
  { value: "riba_30gg", label: "Ri.Ba. 30gg" },
  { value: "riba_60gg", label: "Ri.Ba. 60gg" },
  { value: "riba_90gg", label: "Ri.Ba. 90gg" },
  { value: "rimessa_diretta", label: "Rimessa Diretta" },
  { value: "contrassegno", label: "Contrassegno" },
] as const;

/* =======================
   Component
======================= */
export function NuovaAnagraficaForm() {
  const [open, setOpen] = useState(false);

  // ✅ sedi secondarie: array-driven
  const [sediAggiuntive, setSediAggiuntive] = useState<SedeSecondariaUI[]>([]);

  // ✅ contatti: UX uguale alle sedi → array-driven (add card → compila → remove)
  const [contatti, setContatti] = useState<ContattoUI[]>([]);

  const form = useForm<AnagraficaFormValues>({
    resolver: zodResolver(anagraficaSchema),
    defaultValues: {
      ragione_sociale: "",
      partita_iva: "",
      is_cliente: false,
      is_fornitore: false,

      // ✅ default: sede principale = legale + operativa
      prima_sede: {
        nome_sede: "Principale",
        indirizzo: "",
        citta: "",
        provincia: "",
        cap: "",
        is_legale: true,
        is_operativa: true,
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

  // “solo sede legale” = is_operativa false
  const isOperativaPrincipale = form.watch("prima_sede.is_operativa");

  // ✅ mantiene coerente prima sede: è sempre legale
  useEffect(() => {
    form.setValue("prima_sede.is_legale", true, { shouldDirty: true });
  }, [form]);

  // ✅ nome default: Principale vs Sede Legale (solo se NON toccato manualmente)
  const [nomePrincipaleTouched, setNomePrincipaleTouched] = useState(false);
  useEffect(() => {
    if (nomePrincipaleTouched) return;
    const soloLegale = !isOperativaPrincipale;
    form.setValue("prima_sede.nome_sede", soloLegale ? "Sede Legale" : "Principale", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [isOperativaPrincipale, form, nomePrincipaleTouched]);

  /* =======================
     Sedi secondarie - add/update/remove
  ======================= */
  function addSedeSecondaria() {
    const tipo: SedeTipo = "operativa";
    const baseFlags = sedeFlagsByTipo(tipo);

    const nuova: SedeSecondariaUI = {
      id: newId(),
      tipo,
      nome_sede: defaultNomeByTipo(tipo),
      indirizzo: "",
      citta: "",
      provincia: "",
      cap: "",
      ...baseFlags,
    };

    setSediAggiuntive((prev) => [...prev, nuova]);
  }

  function removeSedeSecondaria(id: string) {
    setSediAggiuntive((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSedeSecondaria(id: string, patch: Partial<SedeSecondariaUI>) {
    setSediAggiuntive((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function setSedeTipo(id: string, tipo: SedeTipo) {
    const flags = sedeFlagsByTipo(tipo);
    updateSedeSecondaria(id, {
      tipo,
      ...flags,
      nome_sede: defaultNomeByTipo(tipo),
    });
  }

  /* =======================
     Contatti - add/update/remove (UX come sedi)
  ======================= */
  function addContatto() {
    const nuova: ContattoUI = {
      id: newId(),
      nome: "",
      email: "",
      telefono: "",
      ruolo: "nessuno",
    };
    setContatti((prev) => [...prev, nuova]);
  }

  function removeContatto(id: string) {
    setContatti((prev) => prev.filter((c) => c.id !== id));
  }

  function updateContatto(id: string, patch: Partial<ContattoUI>) {
    setContatti((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  /* =======================
     Submit: flusso FK corretto
  ======================= */
  async function onSubmit(values: AnagraficaFormValues) {
    try {
      // 1) Insert Anagrafica -> ottieni id
      const { data: anagrafica, error: anagraficaError } = await supabase
        .from("Anagrafiche")
        .insert({
          ragione_sociale: values.ragione_sociale,
          partita_iva: values.partita_iva,
          is_cliente: values.is_cliente,
          is_fornitore: values.is_fornitore,
          // ✅ owner mai in UI
          is_owner: false,
        })
        .select()
        .single();

      if (anagraficaError) throw anagraficaError;

      const id_anagrafica = anagrafica.id_anagrafica;

      // 2) Insert amministrativi
      const { error: amministrativiError } = await supabase.from("an_dati_amministrativi").insert({
        id_anagrafica,
        pec: values.pec,
        codice_univoco: values.codice_univoco,
        iban: values.iban,
        pagamento: values.pagamento,
        partita_iva_estera: values.partita_iva_estera,
        esente_iva: values.esente_iva,
        prezzo_manodopera: values.prezzo_manodopera,
      });

      if (amministrativiError) throw amministrativiError;

      // 3) Insert sedi (principale + secondarie)
      const prima = values.prima_sede;

      const sedePrincipalePayload = {
        id_anagrafica,
        nome_sede: prima.nome_sede,
        indirizzo: prima.indirizzo,
        citta: prima.citta,
        provincia: prima.provincia,
        cap: toCapNumber(prima.cap),

        is_legale: true,
        is_operativa: !!prima.is_operativa,

        // principale: niente tipi speciali in questa UX
        is_nave: false,
        is_banchina: false,
        is_officina: false,
      };

      const sediSecondariePayload = sediAggiuntive.map((s) => ({
        id_anagrafica,
        nome_sede: s.nome_sede || defaultNomeByTipo(s.tipo),
        indirizzo: s.indirizzo,
        citta: s.citta,
        provincia: s.provincia,
        cap: toCapNumber(s.cap),

        is_legale: false,
        is_operativa: s.is_operativa,
        is_nave: s.is_nave,
        is_banchina: s.is_banchina,
        is_officina: s.is_officina,
      }));

      const { error: sediError } = await supabase
        .from("Sedi")
        .insert([sedePrincipalePayload, ...sediSecondariePayload]);

      if (sediError) throw sediError;

      // 4) Insert contatti
      if (contatti.length > 0) {
        const contattiPayload = contatti
          .map((c) => ({
            id_anagrafica,
            nome: c.nome?.trim() || null,
            email: c.email?.trim() || null,
            telefono: c.telefono?.trim() || null,
            is_aziendale: c.ruolo === "aziendale",
            is_referente: c.ruolo === "referente",
          }))
          // se è proprio tutto vuoto e ruolo nessuno, non inseriamo la riga
          .filter((c) => !!(c.nome || c.email || c.telefono || c.is_aziendale || c.is_referente));

        if (contattiPayload.length > 0) {
          const { error: contattiError } = await supabase.from("an_contatti").insert(contattiPayload);
          if (contattiError) throw contattiError;
        }
      }

      // 5) Insert tabelle fornitore
      if (values.is_fornitore) {
        if (values.frn_mezzi) {
          await supabase.from("frn_mezzi").insert({ id_anagrafica });
        }
        if (values.frn_ricambi) {
          await supabase.from("frn_ricambi").insert({
            id_anagrafica,
            sconto: values.sconto,
          });
        }
        if (values.frn_servizi) {
          await supabase.from("frn_servizi").insert({
            id_anagrafica,
            tariffa_oraria: values.tariffa_oraria,
          });
        }
        if (values.frn_trasporti) {
          await supabase.from("frn_trasporti").insert({ id_anagrafica });
        }
      }

      toast({ title: "Successo", description: "Anagrafica creata con successo" });

      // reset
      form.reset();
      setSediAggiuntive([]);
      setContatti([]);
      setNomePrincipaleTouched(false);
      setOpen(false);
    } catch (error) {
      console.error("Error creating anagrafica:", error);
      toast({
        title: "Errore",
        description: "Errore nella creazione dell'anagrafica",
        variant: "destructive",
      });
    }
  }

  /* =======================
     UI Helpers
  ======================= */
  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <div className="text-sm font-semibold">{title}</div>
    </div>
  );

  /* =======================
     Render
  ======================= */
  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
        Annulla
      </Button>
      <Button type="submit" form="anagrafica-form">
        Salva Anagrafica
      </Button>
    </div>
  );

  return (
    <>
      <Button size="lg" className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-5 w-5" />
        Nuova Anagrafica
      </Button>

      <FormModal
        open={open}
        onOpenChange={setOpen}
        title={
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Nuova Anagrafica
          </div>
        }
        footer={footer}
        size="xl"
      >
        <Form {...form}>
          <form id="anagrafica-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dati base */}
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="p-4 space-y-4">
                <SectionHeader icon={<Building2 className="h-4 w-4" />} title="Dati base" />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <FormField
                    control={form.control}
                    name="ragione_sociale"
                    render={({ field }) => (
                      <FormItem className="md:col-span-7">
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
                      <FormItem className="md:col-span-5">
                        <FormLabel>Partita IVA</FormLabel>
                        <FormControl>
                          <Input placeholder="IT00000000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-wrap gap-6">
                  <FormField
                    control={form.control}
                    name="is_cliente"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
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
                          <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                        </FormControl>
                        <FormLabel className="font-normal">Fornitore</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {isCliente && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <FormField
                      control={form.control}
                      name="prezzo_manodopera"
                      render={({ field }) => (
                        <FormItem className="md:col-span-4">
                          <FormLabel>Prezzo Manodopera (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Fornitore */}
                {isFornitore && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Tipologie Fornitore
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {(["frn_mezzi", "frn_ricambi", "frn_servizi", "frn_trasporti"] as const).map((k) => (
                            <FormField
                              key={k}
                              control={form.control}
                              name={k}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {k === "frn_mezzi"
                                      ? "Mezzi"
                                      : k === "frn_ricambi"
                                        ? "Ricambi"
                                        : k === "frn_servizi"
                                          ? "Servizi"
                                          : "Trasporti"}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                                    }
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
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sede principale */}
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="p-4 space-y-4">
                <SectionHeader icon={<MapPin className="h-4 w-4" />} title="Sede principale" />

                <div className="rounded-lg border bg-background/40 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <FormField
                      control={form.control}
                      name="prima_sede.nome_sede"
                      render={({ field }) => (
                        <FormItem className="md:col-span-6">
                          <FormLabel>Nome sede *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                setNomePrincipaleTouched(true);
                                field.onChange(e);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem className="md:col-span-6 flex items-end pb-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={!isOperativaPrincipale}
                          onCheckedChange={(v) => {
                            const soloLegale = !!v;
                            form.setValue("prima_sede.is_operativa", !soloLegale, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                            form.setValue("prima_sede.is_legale", true, { shouldDirty: true });
                          }}
                        />
                        <div className="text-sm">
                          Solo sede legale{" "}
                          <span className="text-muted-foreground">(default: legale + operativa)</span>
                        </div>
                      </div>
                    </FormItem>

                    <FormField
                      control={form.control}
                      name="prima_sede.indirizzo"
                      render={({ field }) => (
                        <FormItem className="md:col-span-7">
                          <FormLabel>Indirizzo</FormLabel>
                          <FormControl>
                            <Input placeholder="Via/Piazza..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prima_sede.citta"
                      render={({ field }) => (
                        <FormItem className="md:col-span-5">
                          <FormLabel>Città</FormLabel>
                          <FormControl>
                            <Input placeholder="Città" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prima_sede.provincia"
                      render={({ field }) => (
                        <FormItem className="md:col-span-4">
                          <FormLabel>Provincia</FormLabel>
                          <FormControl>
                            <Input placeholder="LI" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prima_sede.cap"
                      render={({ field }) => (
                        <FormItem className="md:col-span-4">
                          <FormLabel>CAP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ✅ bottone a sinistra */}
                  <div className="flex justify-start pt-1">
                    <Button type="button" variant="outline" onClick={addSedeSecondaria}>
                      + Aggiungi sede
                    </Button>
                  </div>
                </div>

                {/* Sedi aggiuntive (array-driven) */}
                {sediAggiuntive.length > 0 && (
                  <div className="rounded-lg border bg-background/40 p-4 space-y-3">
                    <div className="text-sm font-medium">Sedi operative aggiuntive</div>

                    <div className="space-y-3">
                      {sediAggiuntive.map((sede, idx) => (
                        <div key={sede.id} className="border rounded-lg bg-background shadow-sm p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-medium">Sede {idx + 1}</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSedeSecondaria(sede.id)}
                              title="Rimuovi sede"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4 space-y-2">
                              <div className="text-sm font-medium">Tipo</div>
                              <Select value={sede.tipo} onValueChange={(v) => setSedeTipo(sede.id, v as SedeTipo)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="operativa">Operativa</SelectItem>
                                  <SelectItem value="nave">Nave</SelectItem>
                                  <SelectItem value="banchina">Banchina</SelectItem>
                                  <SelectItem value="officina">Officina</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="md:col-span-8 space-y-2">
                              <div className="text-sm font-medium">Nome sede *</div>
                              <Input
                                value={sede.nome_sede}
                                onChange={(e) => updateSedeSecondaria(sede.id, { nome_sede: e.target.value })}
                              />
                            </div>

                            <div className="md:col-span-6 space-y-2">
                              <div className="text-sm font-medium">Indirizzo</div>
                              <Input
                                value={sede.indirizzo ?? ""}
                                onChange={(e) => updateSedeSecondaria(sede.id, { indirizzo: e.target.value })}
                              />
                            </div>

                            <div className="md:col-span-3 space-y-2">
                              <div className="text-sm font-medium">Città</div>
                              <Input
                                value={sede.citta ?? ""}
                                onChange={(e) => updateSedeSecondaria(sede.id, { citta: e.target.value })}
                              />
                            </div>

                            <div className="md:col-span-1 space-y-2">
                              <div className="text-sm font-medium">Prov.</div>
                              <Input
                                value={sede.provincia ?? ""}
                                onChange={(e) => updateSedeSecondaria(sede.id, { provincia: e.target.value })}
                              />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                              <div className="text-sm font-medium">CAP</div>
                              <Input
                                value={sede.cap ?? ""}
                                onChange={(e) => updateSedeSecondaria(sede.id, { cap: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ✅ bottone a sinistra */}
                    <div className="flex justify-start">
                      <Button type="button" variant="outline" onClick={addSedeSecondaria}>
                        + Aggiungi sede
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contatti */}
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="p-4 space-y-4">
                <SectionHeader icon={<Users className="h-4 w-4" />} title="Contatti" />

                <div className="rounded-lg border bg-background/40 p-4 space-y-3">
                  {/* ✅ bottone a sinistra */}
                  <div className="flex justify-start">
                    <Button type="button" variant="outline" onClick={addContatto}>
                      + Aggiungi contatto
                    </Button>
                  </div>

                  {contatti.length > 0 && (
                    <div className="space-y-3">
                      {contatti.map((c, idx) => (
                        <div key={c.id} className="border rounded-lg bg-background shadow-sm p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-medium">Contatto {idx + 1}</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeContatto(c.id)}
                              title="Rimuovi contatto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-4 space-y-2">
                              <div className="text-sm font-medium">Nome</div>
                              <Input
                                value={c.nome}
                                onChange={(e) => updateContatto(c.id, { nome: e.target.value })}
                              />
                            </div>

                            <div className="md:col-span-4 space-y-2">
                              <div className="text-sm font-medium">Email</div>
                              <Input
                                value={c.email}
                                onChange={(e) => updateContatto(c.id, { email: e.target.value })}
                              />
                            </div>

                            <div className="md:col-span-3 space-y-2">
                              <div className="text-sm font-medium">Telefono</div>
                              <Input
                                value={c.telefono}
                                onChange={(e) => updateContatto(c.id, { telefono: e.target.value })}
                              />
                            </div>

                            <div className="md:col-span-1 space-y-2">
                              <div className="text-sm font-medium">Tipo</div>
                              <Select
                                value={c.ruolo}
                                onValueChange={(v) => updateContatto(c.id, { ruolo: v as ContattoRuolo })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="nessuno">—</SelectItem>
                                  <SelectItem value="aziendale">Aziendale</SelectItem>
                                  <SelectItem value="referente">Referente</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">Stato: {contattoLabel(c.ruolo)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amministrativi */}
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="p-4 space-y-4">
                <SectionHeader icon={<FileText className="h-4 w-4" />} title="Amministrativi" />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <FormField
                    control={form.control}
                    name="pec"
                    render={({ field }) => (
                      <FormItem className="md:col-span-6">
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
                      <FormItem className="md:col-span-6">
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
                      <FormItem className="md:col-span-6">
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
                      <FormItem className="md:col-span-6">
                        <FormLabel>Pagamento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona modalità di pagamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
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
                    name="partita_iva_estera"
                    render={({ field }) => (
                      <FormItem className="md:col-span-6">
                        <FormLabel>P.IVA Estera</FormLabel>
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
                      <FormItem className="md:col-span-6 flex items-center gap-2 pt-8">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                        </FormControl>
                        <FormLabel className="font-normal m-0">Esente IVA</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </FormModal>
    </>
  );
}
