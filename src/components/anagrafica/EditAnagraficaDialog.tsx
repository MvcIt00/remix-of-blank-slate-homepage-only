import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const anagraficaSchema = z.object({
  ragione_sociale: z.string().min(1, "Ragione sociale richiesta"),
  partita_iva: z.string().optional(),
  is_cliente: z.boolean().default(false),
  is_fornitore: z.boolean().default(false),
  is_owner: z.boolean().default(false),
  richiede_contratto_noleggio: z.boolean().default(true),
});

type AnagraficaFormValues = z.infer<typeof anagraficaSchema>;

interface EditAnagraficaDialogProps {
  anagraficaId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EditAnagraficaDialog({ anagraficaId, onSuccess, trigger }: EditAnagraficaDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<AnagraficaFormValues>({
    resolver: zodResolver(anagraficaSchema),
    defaultValues: {
      ragione_sociale: "",
      partita_iva: "",
      is_cliente: false,
      is_fornitore: false,
      is_owner: false,
      richiede_contratto_noleggio: true,
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
        .from("Anagrafiche")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .single();

      if (error) throw error;

      form.reset({
        ragione_sociale: data.ragione_sociale,
        partita_iva: data.partita_iva || "",
        is_cliente: data.is_cliente || false,
        is_fornitore: data.is_fornitore || false,
        is_owner: data.is_owner || false,
        richiede_contratto_noleggio: data.richiede_contratto_noleggio !== false,
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
      setLoading(true);
      const { error } = await supabase
        .from("Anagrafiche")
        .update({
          ragione_sociale: values.ragione_sociale,
          partita_iva: values.partita_iva || null,
          is_cliente: values.is_cliente,
          is_fornitore: values.is_fornitore,
          is_owner: values.is_owner,
          richiede_contratto_noleggio: values.richiede_contratto_noleggio,
        })
        .eq("id_anagrafica", anagraficaId);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Dati anagrafica aggiornati",
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating anagrafica:", error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica Dati Anagrafica</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ragione_sociale"
              render={({ field }) => (
                <FormItem>
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

            <div className="space-y-2">
              <FormLabel>Tipologia</FormLabel>
              <div className="flex gap-4">
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
              </div>

              <FormField
                control={form.control}
                name="richiede_contratto_noleggio"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal text-muted-foreground">
                      Richiede contratto per noleggi
                    </FormLabel>
                  </FormItem>
                )}
              />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvataggio..." : "Salva"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
