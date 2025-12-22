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

const datiAmministrativiSchema = z.object({
  pec: z.string().optional(),
  codice_univoco: z.string().optional(),
  iban: z.string().optional(),
  pagamento: z.string().optional(),
  partita_iva_estera: z.string().optional(),
  esente_iva: z.boolean().default(false),
  prezzo_manodopera: z.coerce.number().optional(),
});

type DatiAmministrativiFormValues = z.infer<typeof datiAmministrativiSchema>;

interface EditDatiAmministrativiDialogProps {
  anagraficaId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EditDatiAmministrativiDialog({ anagraficaId, onSuccess, trigger }: EditDatiAmministrativiDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<DatiAmministrativiFormValues>({
    resolver: zodResolver(datiAmministrativiSchema),
    defaultValues: {
      pec: "",
      codice_univoco: "",
      iban: "",
      pagamento: "",
      partita_iva_estera: "",
      esente_iva: false,
      prezzo_manodopera: undefined,
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
        .from("an_dati_amministrativi")
        .select("*")
        .eq("id_anagrafica", anagraficaId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        form.reset({
          pec: data.pec || "",
          codice_univoco: data.codice_univoco || "",
          iban: data.iban || "",
          pagamento: data.pagamento || "",
          partita_iva_estera: data.partita_iva_estera || "",
          esente_iva: data.esente_iva || false,
          prezzo_manodopera: data.prezzo_manodopera || undefined,
        });
      } else {
        form.reset({
          pec: "",
          codice_univoco: "",
          iban: "",
          pagamento: "",
          partita_iva_estera: "",
          esente_iva: false,
          prezzo_manodopera: undefined,
        });
      }
    } catch (error) {
      console.error("Error loading dati amministrativi:", error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei dati",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: DatiAmministrativiFormValues) {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("an_dati_amministrativi")
        .upsert({
          id_anagrafica: anagraficaId,
          pec: values.pec || null,
          codice_univoco: values.codice_univoco || null,
          iban: values.iban || null,
          pagamento: values.pagamento || null,
          partita_iva_estera: values.partita_iva_estera || null,
          esente_iva: values.esente_iva,
          prezzo_manodopera: values.prezzo_manodopera || null,
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Dati amministrativi aggiornati",
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating dati amministrativi:", error);
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
          <DialogTitle>Modifica Dati Amministrativi</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pec"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PEC</FormLabel>
                  <FormControl>
                    <Input placeholder="email@pec.it" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codice_univoco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codice Univoco</FormLabel>
                    <FormControl>
                      <Input placeholder="XXXXXXX" {...field} />
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
                    <FormLabel>Pagamento</FormLabel>
                    <FormControl>
                      <Input placeholder="30gg DF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="partita_iva_estera"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>P.IVA Estera</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prezzo_manodopera"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prezzo Manodopera (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="esente_iva"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Esente IVA</FormLabel>
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
