import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const sedeSchema = z.object({
  id_sede: z.string().optional(),
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

type SedeFormValues = z.infer<typeof sedeSchema>;

interface Sede extends SedeFormValues {
  id_sede?: string;
}

interface EditSediDialogProps {
  anagraficaId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EditSediDialog({ anagraficaId, onSuccess, trigger }: EditSediDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sedi, setSedi] = useState<Sede[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [sediDaEliminare, setSediDaEliminare] = useState<string[]>([]);

  const form = useForm<SedeFormValues>({
    resolver: zodResolver(sedeSchema),
    defaultValues: {
      nome_sede: "",
      indirizzo: "",
      citta: "",
      provincia: "",
      cap: "",
      is_legale: false,
      is_operativa: false,
      is_nave: false,
      is_banchina: false,
      is_officina: false,
    },
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, anagraficaId]);

  async function loadData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Sedi")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .eq("is_cancellato", false);

      if (error) throw error;

      setSedi(data?.map(s => ({
        id_sede: s.id_sede,
        nome_sede: s.nome_sede || "",
        indirizzo: s.indirizzo || "",
        citta: s.citta || "",
        provincia: s.provincia || "",
        cap: s.cap?.toString() || "",
        is_legale: s.is_legale || false,
        is_operativa: s.is_operativa || false,
        is_nave: s.is_nave || false,
        is_banchina: s.is_banchina || false,
        is_officina: s.is_officina || false,
      })) || []);
      setSediDaEliminare([]);
      setEditingIndex(null);
    } catch (error) {
      console.error("Error loading sedi:", error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle sedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleAddNew() {
    form.reset({
      nome_sede: "",
      indirizzo: "",
      citta: "",
      provincia: "",
      cap: "",
      is_legale: false,
      is_operativa: false,
      is_nave: false,
      is_banchina: false,
      is_officina: false,
    });
    setEditingIndex(sedi.length);
    setSedi([...sedi, {
      nome_sede: "",
      indirizzo: "",
      citta: "",
      provincia: "",
      cap: "",
      is_legale: false,
      is_operativa: false,
      is_nave: false,
      is_banchina: false,
      is_officina: false,
    }]);
  }

  function handleEdit(index: number) {
    const sede = sedi[index];
    form.reset(sede);
    setEditingIndex(index);
  }

  function handleRemove(index: number) {
    const sede = sedi[index];
    if (sede.id_sede) {
      setSediDaEliminare([...sediDaEliminare, sede.id_sede]);
    }
    setSedi(sedi.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  }

  function handleSaveSede(values: SedeFormValues) {
    if (editingIndex !== null) {
      const newSedi = [...sedi];
      newSedi[editingIndex] = { ...values, id_sede: sedi[editingIndex].id_sede };
      setSedi(newSedi);
      setEditingIndex(null);
    }
  }

  async function handleSaveAll() {
    try {
      setLoading(true);

      // Elimina le sedi rimosse (soft delete)
      if (sediDaEliminare.length > 0) {
        const { error: deleteError } = await supabase
          .from("Sedi")
          .update({ is_cancellato: true })
          .in("id_sede", sediDaEliminare);
        if (deleteError) throw deleteError;
      }

      // Aggiorna le sedi esistenti
      for (const sede of sedi.filter(s => s.id_sede)) {
        const { error } = await supabase
          .from("Sedi")
          .update({
            nome_sede: sede.nome_sede,
            indirizzo: sede.indirizzo || null,
            citta: sede.citta || null,
            provincia: sede.provincia || null,
            cap: sede.cap ? parseInt(sede.cap) : null,
            is_legale: sede.is_legale,
            is_operativa: sede.is_operativa,
            is_nave: sede.is_nave,
            is_banchina: sede.is_banchina,
            is_officina: sede.is_officina,
          })
          .eq("id_sede", sede.id_sede);
        if (error) throw error;
      }

      // Inserisci le nuove sedi
      const nuoveSedi = sedi.filter(s => !s.id_sede);
      if (nuoveSedi.length > 0) {
        const { error } = await supabase
          .from("Sedi")
          .insert(nuoveSedi.map(sede => ({
            id_anagrafica: anagraficaId,
            nome_sede: sede.nome_sede,
            indirizzo: sede.indirizzo || null,
            citta: sede.citta || null,
            provincia: sede.provincia || null,
            cap: sede.cap ? parseInt(sede.cap) : null,
            is_legale: sede.is_legale,
            is_operativa: sede.is_operativa,
            is_nave: sede.is_nave,
            is_banchina: sede.is_banchina,
            is_officina: sede.is_officina,
          })));
        if (error) throw error;
      }

      toast({
        title: "Successo",
        description: "Sedi aggiornate",
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving sedi:", error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gestione Sedi</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {sedi.map((sede, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                {editingIndex === index ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSaveSede)} className="space-y-3">
                      <FormField
                        control={form.control}
                        name="nome_sede"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Sede *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="indirizzo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Indirizzo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <FormField
                          control={form.control}
                          name="citta"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Città</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="provincia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prov.</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cap"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CAP</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {["is_legale", "is_operativa", "is_nave", "is_banchina", "is_officina"].map((fieldName) => (
                          <FormField
                            key={fieldName}
                            control={form.control}
                            name={fieldName as keyof SedeFormValues}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value as boolean} 
                                    onCheckedChange={field.onChange} 
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-xs">
                                  {fieldName.replace("is_", "").charAt(0).toUpperCase() + fieldName.replace("is_", "").slice(1)}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">Conferma</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingIndex(null)}>
                          Annulla
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{sede.nome_sede || "Nuova sede"}</p>
                      {sede.indirizzo && (
                        <p className="text-sm text-muted-foreground">
                          {sede.indirizzo}, {sede.citta} ({sede.provincia}) - {sede.cap}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(index)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button type="button" variant="outline" className="w-full" onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Sede
            </Button>
          </div>
        </ScrollArea>

        <Separator className="my-4" />
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button onClick={handleSaveAll} disabled={loading || editingIndex !== null}>
            {loading ? "Salvataggio..." : "Salva Tutto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
