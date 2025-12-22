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

const contattoSchema = z.object({
  id_contatto: z.string().optional(),
  nome: z.string().min(1, "Nome richiesto"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  telefono: z.string().optional(),
  is_aziendale: z.boolean().default(false),
  is_referente: z.boolean().default(false),
});

type ContattoFormValues = z.infer<typeof contattoSchema>;

interface Contatto extends ContattoFormValues {
  id_contatto?: string;
}

interface EditContattiDialogProps {
  anagraficaId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EditContattiDialog({ anagraficaId, onSuccess, trigger }: EditContattiDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contatti, setContatti] = useState<Contatto[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [contattiDaEliminare, setContattiDaEliminare] = useState<string[]>([]);

  const form = useForm<ContattoFormValues>({
    resolver: zodResolver(contattoSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefono: "",
      is_aziendale: false,
      is_referente: false,
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
        .from("an_contatti")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .eq("is_cancellato", false);

      if (error) throw error;

      setContatti(data?.map(c => ({
        id_contatto: c.id_contatto,
        nome: c.nome || "",
        email: c.email || "",
        telefono: c.telefono || "",
        is_aziendale: c.is_aziendale || false,
        is_referente: c.is_referente || false,
      })) || []);
      setContattiDaEliminare([]);
      setEditingIndex(null);
    } catch (error) {
      console.error("Error loading contatti:", error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei contatti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleAddNew() {
    form.reset({
      nome: "",
      email: "",
      telefono: "",
      is_aziendale: false,
      is_referente: false,
    });
    setEditingIndex(contatti.length);
    setContatti([...contatti, {
      nome: "",
      email: "",
      telefono: "",
      is_aziendale: false,
      is_referente: false,
    }]);
  }

  function handleEdit(index: number) {
    const contatto = contatti[index];
    form.reset(contatto);
    setEditingIndex(index);
  }

  function handleRemove(index: number) {
    const contatto = contatti[index];
    if (contatto.id_contatto) {
      setContattiDaEliminare([...contattiDaEliminare, contatto.id_contatto]);
    }
    setContatti(contatti.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  }

  function handleSaveContatto(values: ContattoFormValues) {
    if (editingIndex !== null) {
      const newContatti = [...contatti];
      newContatti[editingIndex] = { ...values, id_contatto: contatti[editingIndex].id_contatto };
      setContatti(newContatti);
      setEditingIndex(null);
    }
  }

  async function handleSaveAll() {
    try {
      setLoading(true);

      // Elimina i contatti rimossi (soft delete)
      if (contattiDaEliminare.length > 0) {
        const { error: deleteError } = await supabase
          .from("an_contatti")
          .update({ is_cancellato: true })
          .in("id_contatto", contattiDaEliminare);
        if (deleteError) throw deleteError;
      }

      // Aggiorna i contatti esistenti
      for (const contatto of contatti.filter(c => c.id_contatto)) {
        const { error } = await supabase
          .from("an_contatti")
          .update({
            nome: contatto.nome,
            email: contatto.email || null,
            telefono: contatto.telefono || null,
            is_aziendale: contatto.is_aziendale,
            is_referente: contatto.is_referente,
          })
          .eq("id_contatto", contatto.id_contatto);
        if (error) throw error;
      }

      // Inserisci i nuovi contatti
      const nuoviContatti = contatti.filter(c => !c.id_contatto);
      if (nuoviContatti.length > 0) {
        const { error } = await supabase
          .from("an_contatti")
          .insert(nuoviContatti.map(contatto => ({
            id_anagrafica: anagraficaId,
            nome: contatto.nome,
            email: contatto.email || null,
            telefono: contatto.telefono || null,
            is_aziendale: contatto.is_aziendale,
            is_referente: contatto.is_referente,
          })));
        if (error) throw error;
      }

      toast({
        title: "Successo",
        description: "Contatti aggiornati",
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving contatti:", error);
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
          <DialogTitle>Gestione Contatti</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {contatti.map((contatto, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                {editingIndex === index ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSaveContatto)} className="space-y-3">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="telefono"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefono</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex gap-4">
                        <FormField
                          control={form.control}
                          name="is_aziendale"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Aziendale</FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="is_referente"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Referente</FormLabel>
                            </FormItem>
                          )}
                        />
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
                      <p className="font-medium">{contatto.nome || "Nuovo contatto"}</p>
                      {contatto.email && <p className="text-sm text-muted-foreground">{contatto.email}</p>}
                      {contatto.telefono && <p className="text-sm text-muted-foreground">{contatto.telefono}</p>}
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
              Aggiungi Contatto
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
