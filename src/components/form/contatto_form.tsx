import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

const contattoSchema = z.object({
  nome: z.string().min(1, "Nome richiesto"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  telefono: z.string().optional(),
  is_aziendale: z.boolean().default(false),
  is_referente: z.boolean().default(false),
});

export type ContattoFormValues = z.infer<typeof contattoSchema>;

interface ContattoFormProps {
  onAddContatto: (contatto: ContattoFormValues) => void;
}

export function ContattoForm({ onAddContatto }: ContattoFormProps) {
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

  function onSubmit(values: ContattoFormValues) {
    onAddContatto(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Mario Rossi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@esempio.it" {...field} />
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
                  <Input placeholder="+39 123 456 7890" {...field} />
                </FormControl>
                <FormMessage />
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
                <FormLabel className="font-normal">Contatto Aziendale</FormLabel>
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

        <Button type="submit" variant="outline" size="sm" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Aggiungi Contatto
        </Button>
      </form>
    </Form>
  );
}